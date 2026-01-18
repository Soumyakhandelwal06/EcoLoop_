from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
import database
import auth
import ai_service
from typing import List
from datetime import date, timedelta
import os
import time
import email_utils
from seed_utils import seed_database

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EcoLoop API")

# CORS (Allow Frontend)
origins = [
    "https://ecoloopweb.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files
if not os.path.exists("static/image/store"):
    os.makedirs("static/image/store", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "EcoLoop API is running", "docs": "/docs"}

@app.get("/health")
def health_check():
    """
    Standard health check endpoint to verify backend availability.
    """
    return {"status": "healthy", "timestamp": str(date.today())}

# --- Helpers ---

def update_user_streak(user: models.User, db: Session):
    """
    Updates the user's streak based on the date of the last action.
    Should be called ONLY during task completion.
    """
    today = date.today()
    if user.last_login is None:
        # First task ever
        user.streak = 1
    elif user.last_login != today:
        if user.last_login == today - timedelta(days=1):
            user.streak += 1
        else:
            # Reset if they haven't completed a task since yesterday
            user.streak = 1
    
    # If user.last_login == today, we don't increment multiple times
    user.last_login = today
    db.commit()

# --- Authentication Routes ---

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    print(f"Registration attempt: {user.username}")
    # Normalize username to lowercase
    user.username = user.username.lower()

    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        print(f"Registration failed: Username '{user.username}' taken")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        print(f"Registration failed: Email '{user.email}' taken")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Create User
        print("Hashing password...")
        hashed_pwd = auth.get_password_hash(user.password)
        new_user = models.User(
            username=user.username, 
            email=user.email, 
            hashed_password=hashed_pwd,
            streak=0,
            last_login=None
        )
        db.add(new_user)
        db.flush() # Get ID without committing yet
        print(f"User created with ID: {new_user.id}")
        
        # Initialize Progress (Unlock Level 1)
        # Get Level 1 ID
        level1 = db.query(models.Level).filter(models.Level.order == 1).first()
        if level1:
            print(f"Unlocking Level 1 for user {new_user.id}")
            new_progress = models.UserProgress(
                user_id=new_user.id,
                level_id=level1.id,
                status="unlocked",
                score=0
            )
            db.add(new_progress)
        
        db.commit()
        print("Registration transaction committed successfully")
        
        # Create Token
        access_token = auth.create_access_token(data={"sub": new_user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Normalize username
    user_credentials.username = user_credentials.username.lower()
    
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Credentials")
        
    # Login no longer updates streak to ensure it's task-based
    # update_user_streak(user, db)
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/users/progress")
def update_progress(
    progress_data: schemas.ProgressUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Update User Coins & Streak
    current_user.coins += progress_data.coins_earned
    
    # Only update streak if it's a level completion (task verified)
    if progress_data.is_level_completion:
        update_user_streak(current_user, db)
        
    # 2. Check/Update UserProgress for this Level
    user_progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.level_id == progress_data.level_id
    ).first()
    
    if user_progress:
        # Only mark completed if this IS a completion event
        if progress_data.is_level_completion and user_progress.status != "completed":
             user_progress.status = "completed"
             user_progress.score = max(user_progress.score, progress_data.xp_earned) 
    else:
        # Create progress entry if it doesn't exist
        new_status = "completed" if progress_data.is_level_completion else "unlocked"
        user_progress = models.UserProgress(
            user_id=current_user.id,
            level_id=progress_data.level_id,
            status=new_status,
            score=progress_data.xp_earned if progress_data.is_level_completion else 0
        )
        db.add(user_progress)
    
    # 3. Unlock Next Level (ONLY on completion)
    if progress_data.is_level_completion:
        current_level = db.query(models.Level).filter(models.Level.id == progress_data.level_id).first()
        if current_level:
            next_level = db.query(models.Level).filter(models.Level.order == current_level.order + 1).first()
            if next_level:
                # Check if next level progress already exists
                next_progress = db.query(models.UserProgress).filter(
                    models.UserProgress.user_id == current_user.id,
                    models.UserProgress.level_id == next_level.id
                ).first()
                
                if not next_progress:
                    next_progress = models.UserProgress(
                        user_id=current_user.id,
                        level_id=next_level.id,
                        status="unlocked",
                        score=0
                    )
                    db.add(next_progress)
                elif next_progress.status == "locked":
                    next_progress.status = "unlocked"
        
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"message": "Progress Updated", "new_balance": current_user.coins}

# --- Game Routes ---

@app.get("/levels", response_model=List[schemas.Level])
def get_levels(db: Session = Depends(database.get_db)):
    return db.query(models.Level).all()

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(database.get_db)):
    # Return top 10 users by coins, then streak
    users = db.query(models.User).order_by(models.User.coins.desc(), models.User.streak.desc()).limit(10).all()
    return [{"username": u.username, "coins": u.coins, "streak": u.streak} for u in users]

# ---------------- CHAT ROUTE (Migrated) ----------------

@app.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_ecobot(request: schemas.ChatRequest):
    """
    Endpoint for the EcoBot Chat Interface.
    """
    response = await ai_service.get_chat_response(request.message)
    return response

# --- AI Verification Route ---
@app.post("/verify-task")
async def verify_task(
    file: UploadFile = File(...), 
    task_label: str = Form("nature conservation"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    print(f"DEBUG: Verifying task for {current_user.username}")
    print(f"DEBUG: Task Label received: {task_label}")
    print(f"DEBUG: Content Type: {file.content_type}")

    # Save file temporarily to handle video processing or large images
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{current_user.id}_{int(time.time())}_{file.filename}")
    
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        result = await ai_service.verify_task_content(temp_path, file.content_type, task_label)
        return result
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ---------------- IMAGE QUALITY CHECK (Migrated) ----------------

@app.post("/check-image-quality")
async def check_image_quality(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    return {"quality_ok": True, "message": "Quality check bypassed (Optimization)"}

@app.post("/eco-scanner")
async def eco_scanner(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    AI Scanner: Identifies an object, gives eco-advice, and awards coins.
    """
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"scan_{current_user.id}_{int(time.time())}_{file.filename}")
    
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        result = await ai_service.analyze_eco_object(temp_path, file.content_type)
        
        # Award coins if result is valid
        if "points" in result:
            current_user.coins += int(result["points"])
            db.commit()
            result["new_balance"] = current_user.coins
            
        return result
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# --- Store Endpoints ---
@app.get("/store/items", response_model=List[schemas.StoreItemSchema])
def get_store_items(db: Session = Depends(database.get_db)):
    return db.query(models.StoreItem).all()

@app.post("/store/buy")
def purchase_item(
    request: schemas.PurchaseRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.StoreItem).filter(models.StoreItem.id == request.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if current_user.coins < item.price:
        raise HTTPException(status_code=400, detail="Insufficient EcoCoins")
    
    # Check if already owned 
    already_owned = db.query(models.UserItem).filter(
        models.UserItem.user_id == current_user.id,
        models.UserItem.item_id == item.id
    ).first()
    
    if already_owned:
        raise HTTPException(status_code=400, detail="You already own this item!")

    # Deduct coins
    current_user.coins -= item.price
    
    # Log purchase
    user_item = models.UserItem(user_id=current_user.id, item_id=item.id)
    db.add(user_item)
    db.commit()
    
    return {"message": f"Successfully purchased {item.name}!", "new_balance": current_user.coins}

# --- Challenge Endpoints ---
@app.get("/challenges", response_model=List[schemas.ChallengeSchema])
def get_challenges(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    challenges = db.query(models.Challenge).filter(models.Challenge.is_active == True).all()
    
    # Check completion for current user today
    today = date.today()
    results = []
    for c in challenges:
        is_completed = False
        if c.type == 'daily':
            is_completed = db.query(models.UserChallengeCompletion).filter(
                models.UserChallengeCompletion.user_id == current_user.id,
                models.UserChallengeCompletion.challenge_id == c.id,
                models.UserChallengeCompletion.completion_date == today
            ).first() is not None
        elif c.type == 'weekly':
            # Simplified weekly: check if completed in current week (Sun-Sat or Mon-Sun)
            start_of_week = today - timedelta(days=today.weekday())
            is_completed = db.query(models.UserChallengeCompletion).filter(
                models.UserChallengeCompletion.user_id == current_user.id,
                models.UserChallengeCompletion.challenge_id == c.id,
                models.UserChallengeCompletion.completion_date >= start_of_week
            ).first() is not None

        c_schema = schemas.ChallengeSchema.from_orm(c)
        c_schema.is_completed = is_completed
        results.append(c_schema)
        
    return results

@app.post("/challenges/{challenge_id}/complete", response_model=schemas.ChallengeCompletionResponse)
async def complete_challenge(
    challenge_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    today = date.today()
    
    # Check if already completed
    existing = None
    if challenge.type == 'daily':
        existing = db.query(models.UserChallengeCompletion).filter(
            models.UserChallengeCompletion.user_id == current_user.id,
            models.UserChallengeCompletion.challenge_id == challenge.id,
            models.UserChallengeCompletion.completion_date == today
        ).first()
    else: # weekly
        start_of_week = today - timedelta(days=today.weekday())
        existing = db.query(models.UserChallengeCompletion).filter(
            models.UserChallengeCompletion.user_id == current_user.id,
            models.UserChallengeCompletion.challenge_id == challenge.id,
            models.UserChallengeCompletion.completion_date >= start_of_week
        ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Challenge already completed!")

    # --- AI Verification ---
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"challenge_{challenge_id}_{int(time.time())}_{file.filename}")
    
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Use challenge description to match Level Task verification logic (which uses task_description)
        label = challenge.description or challenge.title
        verification = await ai_service.verify_task_content(temp_path, file.content_type, label)
        
        if not verification.get("is_valid"):
             raise HTTPException(status_code=400, detail=f"Verification failed: {verification.get('message')}")
             
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # Reward Coins
    current_user.coins += challenge.coin_reward
    
    streak_incremented = False
    if challenge.type == 'daily':
        update_user_streak(current_user, db)
        streak_incremented = True
    
    # Log Completion
    completion = models.UserChallengeCompletion(user_id=current_user.id, challenge_id=challenge.id)
    db.add(completion)
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": f"Challenge '{challenge.title}' Verified & Completed!",
        "new_balance": current_user.coins,
        "streak_incremented": streak_incremented,
        "new_streak": current_user.streak
    }

# --- Seed Data Endpoint (For Demo) ---
@app.post("/seed")
def seed_data(db: Session = Depends(database.get_db)):
    messages = []

    # 1. Seed Levels (Upsert)
    levels_data = [

        {"title": "Sustainability", "description": "Save the world!", "order": 1, "theme_id": "forest", "xp_reward": 100, "video_id": "/static/videos/level1.mp4", "task_description": "Take a photo of any single potted plant", "info_content": "Definition: Sustainability is described as a way of living that minimizes environmental damage by understanding how our lifestyle choices impact the world.\n\nSustainable Development: It is defined as development that meets the needs of the present generation without compromising the ability of future generations to meet their own needs.\n\nGoal: The ultimate goal is to \"save the world\" and ensure the health and well-being of the planet for the future."},
        {"title": "Env. Sustainability", "description": "Keep nature safe.", "order": 2, "theme_id": "river", "xp_reward": 150, "video_id": "/static/videos/level2.mp4", "task_description": "Take a photo of you using a reusable water bottle!", "info_content": "Focus: This specific type of sustainability focuses on keeping natural materials safe and protecting the habitats of animals and plants.\n\nActionable Tips:\n\nConserve Water: Turn off taps while brushing or shaving, take shorter showers, and reuse unsalted cooking water for plants.\n\nReduce Plastic: Use less plastic (bags and bottles) to prevent pollution and save energy.\n\nPlanting: Growing your own plants helps prevent harmful chemicals from infecting the environment.\n\nFood Consumption: Take smaller portions to avoid food waste and reduce dependency on food importation."},
        {"title": "Natural Resources", "description": "Mother Nature's supply.", "order": 3, "theme_id": "city", "xp_reward": 200, "video_id": "/static/videos/level3.mp4", "task_description": "Take a photo of a recycling bin or segregated waste.", "info_content": "Definition: These are sources of supply or support provided by \"Mother Nature\" that are present on Earth without human activity (e.g., water, forests, air, minerals).\n\nClassification:\n\nRenewable (Inexhaustible): Resources with an unlimited supply that can be used repeatedly, such as sunlight, air, and water (though water can become polluted).\n\nNon-Renewable (Exhaustible): Resources available in limited quantities that take a very long time to replenish, such as coal, petroleum, and natural gas.\n\nConsumption: There is a disparity in consumption; for instance, people in rich countries consume up to 10 times more natural resources than those in poorer countries."},
        {"title": "3 R's", "description": "Manage waste.", "order": 4, "theme_id": "mountain", "xp_reward": 250, "video_id": "/static/videos/level4.mp4", "task_description": "Take a photo of a bicycle or walking path (eco-transport).", "info_content": "Concept: A technique central to sustainable living to manage waste and resources.\n\nReduce: Curb the temptation to buy new products to decrease demand on resources.\n\nReuse: Find new uses for items instead of throwing them away (e.g., reusing paper for packaging).\n\nRecycle: Process waste materials into new products (e.g., molding glass into new glass, turning plastic into hangers or toys)."},
        {"title": "Global Warming", "description": "Earth is slowly dying.", "order": 5, "theme_id": "sky", "xp_reward": 500, "video_id": "/static/videos/level5.mp4", "task_description": "Take a clear photo of the sky (aim for clean air!).", "info_content": "Impact: The videos describe the Earth as \"slowly dying\" and under threat from \"extreme climate change\" due to the rising world population and growing demand for resources.\n\nCauses: Activities like burning fossil fuels (coal, petroleum) and excessive energy usage contribute to environmental damage.\n\nPollution: Air and water pollution are highlighted as hazardous conditions that threaten the survival of living beings and render renewable resources like water unusable."},
        # Levels 6-10 (From n2, renumbered)
        {"title": "Green Forest", "description": "Save the trees!", "order": 6, "theme_id": "forest", "xp_reward": 600, "video_id": "/static/videos/level1.mp4", "task_description": "Find a tree or plant and take a photo to show you appreciate nature!", "info_content": "Forests cover 31% of the land area on our planet. They help people thrive and survive by purifying water and air and providing people with jobs."},
        {"title": "Clean River", "description": "Keep waters blue.", "order": 7, "theme_id": "river", "xp_reward": 700, "video_id": "/static/videos/level2.mp4", "task_description": "Take a photo of you using a reusable water bottle!", "info_content": "Water pollution occurs when harmful substances—often chemicals or microorganisms—contaminate a stream, river, lake, ocean, aquifer, or other body of water."},
        {"title": "Eco City", "description": "Urban sustainability.", "order": 8, "theme_id": "city", "xp_reward": 800, "video_id": "/static/videos/level3.mp4", "task_description": "Take a photo of a recycling bin or segregated waste.", "info_content": "Sustainable cities are designed with consideration for the triple bottom line: social, economic, and environmental impact."},
        {"title": "Windy Peak", "description": "Renewable energy.", "order": 9, "theme_id": "mountain", "xp_reward": 900, "video_id": "/static/videos/level4.mp4", "task_description": "Take a photo of a bicycle or walking path (eco-transport).", "info_content": "Renewable energy is energy that is collected from renewable resources that are naturally replenished on a human timescale."},
        {"title": "Space Station", "description": "Future of earth.", "order": 10, "theme_id": "sky", "xp_reward": 1000, "video_id": "/static/videos/level5.mp4", "task_description": "Take a clear photo of the sky.", "info_content": "Climate change describes a change in the average conditions — such as temperature and rainfall — in a region over a long period of time."},
    ]
    
    # Hardcoded Questions Data (Video 1 -> Level 1, etc.)
    hardcoded_questions = {
        1: [
            {"text": "Sustainability mainly focuses on meeting the needs of the present without compromising the needs of the _______.", "options": "Government|Past generation|Future generation|Industries", "correct_index": 2, "difficulty": 1, "segment_index": 0},
            {"text": "Which of the following is not a pillar of sustainability?", "options": "Environmental|Economic|Social|Political", "correct_index": 3, "difficulty": 1, "segment_index": 1},
            {"text": "Sustainable development promotes _______.", "options": "Unlimited use of resources|Balanced use of resources|Destruction of nature|Use of only non-renewable resources", "correct_index": 1, "difficulty": 1, "segment_index": 2},
            {"text": "The main goal of sustainability is to maintain _______.", "options": "Pollution|Equity and balance|Overconsumption|Industrial waste", "correct_index": 1, "difficulty": 1, "segment_index": 3},
            {"text": "“Reduce, Reuse, Recycle” is related to _______.", "options": "Sustainable practices|Entertainment|Agriculture only|Economics", "correct_index": 0, "difficulty": 1, "segment_index": 4},
        ],
        2: [
            {"text": "Environmental sustainability aims to _______.", "options": "Increase pollution|Protect natural ecosystems|Promote waste generation|Use unlimited resources", "correct_index": 1, "difficulty": 1, "segment_index": 0},
            {"text": "Which action supports environmental sustainability?", "options": "Burning plastic|Deforestation|Using renewable energy|Excessive mining", "correct_index": 2, "difficulty": 1, "segment_index": 1},
            {"text": "Which gas causes ozone depletion?", "options": "Oxygen|Chlorofluorocarbons (CFCs)|Nitrogen|Helium", "correct_index": 1, "difficulty": 1, "segment_index": 2},
            {"text": "Planting trees helps in _______.", "options": "Increasing CO₂|Reducing air pollution|Increasing soil erosion|Reducing biodiversity", "correct_index": 1, "difficulty": 1, "segment_index": 3},
            {"text": "Environmental sustainability encourages _______.", "options": "Short-term benefits|Long-term ecological balance|Overuse of natural resources|Pollution increase", "correct_index": 1, "difficulty": 1, "segment_index": 4},
        ],
        3: [
            {"text": "Which of the following is a renewable natural resource?", "options": "Coal|Petroleum|Solar energy|Natural gas", "correct_index": 2, "difficulty": 1, "segment_index": 0},
            {"text": "Forests are an example of _______.", "options": "Man-made resource|Natural resource|Artificial resource|Mechanical resource", "correct_index": 1, "difficulty": 1, "segment_index": 1},
            {"text": "Which is an example of a non-renewable resource?", "options": "Wind|Water|Sunlight|Coal", "correct_index": 3, "difficulty": 1, "segment_index": 2},
            {"text": "Natural resources are classified into _______.", "options": "Biotic and abiotic|Electric and magnetic|Natural and artificial|Living and man-made", "correct_index": 0, "difficulty": 1, "segment_index": 3},
            {"text": "Overuse of natural resources leads to _______.", "options": "Resource conservation|Resource depletion|More biodiversity|Less pollution", "correct_index": 1, "difficulty": 1, "segment_index": 4},
        ],
        4: [
            {"text": "The 3R’s help in reducing _______.", "options": "Pollution|Education|Transportation|Technology", "correct_index": 0, "difficulty": 1, "segment_index": 0},
            {"text": "Which of the following is an example of reusing?", "options": "Throwing old jars|Using plastic bags again|Burning waste|Mining metals", "correct_index": 1, "difficulty": 1, "segment_index": 1},
            {"text": "Recycling involves _______.", "options": "Using products again without change|Making new products from waste materials|Reducing energy use|Buying new items", "correct_index": 1, "difficulty": 1, "segment_index": 2},
            {"text": "Reduce means _______.", "options": "Using more products|Using less and avoiding waste|Throwing everything|Burning items", "correct_index": 1, "difficulty": 1, "segment_index": 3},
            {"text": "Which of the following can be recycled?", "options": "Glass|Food|Soil|Air", "correct_index": 0, "difficulty": 1, "segment_index": 4},
        ],
        5: [
            {"text": "Global warming mainly refers to _______.", "options": "Cooling of the Earth|Increase in Earth's average temperature|Increase in rainfall|Formation of glaciers", "correct_index": 1, "difficulty": 1, "segment_index": 0},
            {"text": "Which gas is the major contributor to global warming?", "options": "O₂|N₂|CO₂|He", "correct_index": 2, "difficulty": 1, "segment_index": 1},
            {"text": "Which human activity increases global warming?", "options": "Planting trees|Burning fossil fuels|Using solar power|Water harvesting", "correct_index": 1, "difficulty": 1, "segment_index": 2},
            {"text": "Polar ice melting is a result of _______.", "options": "Deforestation|Earthquakes|Global warming|Soil erosion", "correct_index": 2, "difficulty": 1, "segment_index": 3},
            {"text": "Which of the following is a consequence of global warming?", "options": "Stable climate|Rise in sea level|Decrease in temperature|More snowfall everywhere", "correct_index": 1, "difficulty": 1, "segment_index": 4},
        ],
        
        # Questions for Levels 6-10 (from n2)
        6: [
           {"text": "What is the primary cause of deforestation mentioned?", "options": "Agriculture|Urbanization|Mining|Tourism", "correct_index": 0, "difficulty": 1, "segment_index": 0},
           {"text": "Which gas do trees absorb from the atmosphere?", "options": "Oxygen|Carbon Dioxide|Nitrogen|Helium", "correct_index": 1, "difficulty": 2, "segment_index": 1},
           {"text": "What happens to the soil when trees are removed?", "options": "It becomes richer|It erodes easily|It changes color|Nothing", "correct_index": 1, "difficulty": 3, "segment_index": 2},
           {"text": "Deforestation leads to the loss of habitat for what percentage of land animals?", "options": "10%|50%|80%|100%", "correct_index": 2, "difficulty": 4, "segment_index": 3},
           {"text": "Which strategy was suggested to combat deforestation?", "options": "Buying more paper|Reforestation|Building roads|Ignoring it", "correct_index": 1, "difficulty": 5, "segment_index": 4},
        ],
        7: [
           {"text": "What is the main source of water pollution?", "options": "Fish|Industrial Waste|Rain|Sunlight", "correct_index": 1, "difficulty": 1, "segment_index": 0},
           {"text": "Why shouldn't you throw plastic in the river?", "options": "It floats|Animals eat it and die|It looks ugly|It melts", "correct_index": 1, "difficulty": 2, "segment_index": 1},
           {"text": "What is 'runoff'?", "options": "Running fast|Water washing chemicals into rivers|A type of boat|A river race", "correct_index": 1, "difficulty": 3, "segment_index": 2},
           {"text": "Which percentage of Earth's water is fresh and drinkable?", "options": "75%|50%|2.5%|10%", "correct_index": 2, "difficulty": 4, "segment_index": 3},
           {"text": "What can you do at home to save water?", "options": "Leave tap open|Fix leaks|Take long showers|Wash cars daily", "correct_index": 1, "difficulty": 5, "segment_index": 4},
        ],
        8: [
           {"text": "What is the 3R rule?", "options": "Run, Rest, Repeat|Reduce, Reuse, Recycle|Read, Write, React|Red, Rose, Ruby", "correct_index": 1, "difficulty": 1, "segment_index": 0},
           {"text": "Which bin is usually for recycling?", "options": "Black|Blue/Green|Red|Invisible", "correct_index": 1, "difficulty": 2, "segment_index": 1},
           {"text": "What is 'composting'?", "options": "Burning trash|Turning food waste into soil|Throwing food in river|Painting", "correct_index": 1, "difficulty": 3, "segment_index": 2},
           {"text": "How do sustainable cities reduce traffic?", "options": "More cars|Public transport & biking|Closing roads|Flying cars", "correct_index": 1, "difficulty": 4, "segment_index": 3},
           {"text": "What is a 'vertical garden'?", "options": "Plants on walls|Plants on ceilings|Plants in space|Fake plants", "correct_index": 0, "difficulty": 5, "segment_index": 4},
        ],
        9: [
           {"text": "Which of these is a renewable energy source?", "options": "Coal|Solar|Oil|Gas", "correct_index": 1, "difficulty": 1, "segment_index": 0},
           {"text": "What captures energy from the wind?", "options": "Solar Panels|Turbines|Mirrors|Dams", "correct_index": 1, "difficulty": 2, "segment_index": 1},
           {"text": "Why are fossil fuels bad for the climate?", "options": "They smell|They release greenhouse gases|They differ in color|They are cold", "correct_index": 1, "difficulty": 3, "segment_index": 2},
           {"text": "What energy comes from the Earth's heat?", "options": "Geothermal|Hydro|Biomass|Nuclear", "correct_index": 0, "difficulty": 4, "segment_index": 3},
           {"text": "Which country runs almost 100% on renewable energy (example)?", "options": "Iceland|USA|Mars|Atlantis", "correct_index": 0, "difficulty": 5, "segment_index": 4},
        ],
        10: [
           {"text": "What is the 'Greenhouse Effect'?", "options": "Growing plants|Trapping heat in atmosphere|Painting houses green|Cooling the earth", "correct_index": 1, "difficulty": 1, "segment_index": 0},
           {"text": "What is the main gas causing global warming?", "options": "Oxygen|Carbon Dioxide|Helium|Neon", "correct_index": 1, "difficulty": 2, "segment_index": 1},
           {"text": "Rising sea levels are caused by...", "options": "More rain|Melting ice caps|Too many boats|Fish", "correct_index": 1, "difficulty": 3, "segment_index": 2},
           {"text": "What is a 'Carbon Footprint'?", "options": "Total greenhouse gas emissions by a person|A dirty shoe|Coal dust|Graphite", "correct_index": 0, "difficulty": 4, "segment_index": 3},
           {"text": "What is the global target limit for warming?", "options": "1.5°C|10°C|50°C|0°C", "correct_index": 0, "difficulty": 5, "segment_index": 4},
        ]
    }
            
    for l in levels_data:
        existing_level = db.query(models.Level).filter(models.Level.order == l["order"]).first()
        
        # Determine questions for this level
        level_questions = hardcoded_questions.get(l["order"], [])

        if existing_level:
            # Update existing level
            existing_level.title = l["title"]
            existing_level.description = l["description"]
            existing_level.video_id = l["video_id"]
            existing_level.info_content = l["info_content"]
            existing_level.task_description = l["task_description"]
            existing_level.theme_id = l["theme_id"]
            existing_level.xp_reward = l["xp_reward"]
            
            # Use hardcoded questions
            if level_questions:
                # Remove old questions
                db.query(models.Question).filter(models.Question.level_id == existing_level.id).delete()
                for q in level_questions:
                    db_q = models.Question(level_id=existing_level.id, **q)
                    db.add(db_q)

        else:
            db_level = models.Level(**l)
            db.add(db_level)
            db.flush() # Get ID
            
            # Add Questions
            if level_questions:
                for q in level_questions:
                    db_q = models.Question(level_id=db_level.id, **q)
                    db.add(db_q)
    
    messages.append("Levels and Questions seeded/updated.")

    
    # 2. Seed Store Items (Update if exists)
    store_items = [
        {"name": "Plant a Tree", "description": "We will plant a real tree in your name.", "price": 1000, "icon_type": "tree", "category": "Symbolic", "image_url": "/image/store/tree.jpeg"},
        {"name": "Eco-Warrior Hoodie", "description": "Virtual hoodie for your avatar.", "price": 500, "icon_type": "hoodie", "category": "Premium", "image_url": "/image/store/hoodie.jpeg"},
        {"name": "Reusable Bottle", "description": "Digital badge for your profile.", "price": 200, "icon_type": "bottle", "category": "Virtual", "image_url": "/image/store/bottle.jpeg"},
        {"name": "Waste Hero Badge", "description": "Rare gold profile badge.", "price": 300, "icon_type": "badge", "category": "Premium", "image_url": "/image/store/badge.jpeg"},
        {"name": "Coral Restorer", "description": "Help restore a coral reef.", "price": 1500, "icon_type": "water", "category": "Symbolic", "image_url": "/image/store/coral.jpeg"},
        {"name": "Solar Kit", "description": "Support renewable energy projects.", "price": 2000, "icon_type": "zap", "category": "Premium", "image_url": "/image/store/solar.jpeg"},
        {"name": "Watercolor Set", "description": "Professional 3D watercolor paints for eco-art.", "price": 450, "icon_type": "palette", "category": "Student", "image_url": "/image/store/watercolor.jpeg"},
        {"name": "Eco Sticker Pack", "description": "Fun stickers to spread the green message.", "price": 150, "icon_type": "sticker", "category": "Student", "image_url": "/image/store/stickers.jpeg"},
        {"name": "Bio-Geometry Box", "description": "Sleek, transparent, and eco-friendly geometry kit.", "price": 600, "icon_type": "box", "category": "Student", "image_url": "/image/store/geometry_box.jpeg"},
        {"name": "Recycled Notebooks", "description": "A set of premium recycled paper notebooks.", "price": 350, "icon_type": "book", "category": "Student", "image_url": "/image/store/notebooks.jpeg"},
    ]
    
    for item in store_items:
        existing = db.query(models.StoreItem).filter(models.StoreItem.name == item["name"]).first()
        if existing:
            existing.image_url = item["image_url"]
            existing.description = item["description"]
            existing.price = item["price"]
            existing.category = item["category"]
            existing.icon_type = item["icon_type"]
        else:
            db_item = models.StoreItem(**item)
            db.add(db_item)
    messages.append("Store Items seeded/updated.")

    # 3. Seed Challenges
    if db.query(models.Challenge).count() == 0:
        challenges_data = [
            {"title": "Nature Appreciation", "description": "Find a tree and take a photo to show you appreciate nature!", "coin_reward": 20, "type": "daily", "verification_label": "tree, plant, green nature, leaves"},
            {"title": "Water Saver", "description": "Limit your shower to 5 minutes.", "coin_reward": 20, "type": "daily", "verification_label": "shower timer or water saving fixture"},
            {"title": "Weekly Cleanup", "description": "Clean up a local park or street for 1 hour.", "coin_reward": 20, "type": "weekly", "verification_label": "person collecting trash outdoors with a bag"},
            {"title": "Vegetarian Week", "description": "Eat no meat for a full week.", "coin_reward": 20, "type": "weekly", "verification_label": "vegetarian meal without any meat"},
        ]
        for c in challenges_data:
            db_challenge = models.Challenge(**c)
            db.add(db_challenge)
        messages.append("Challenges seeded.")
    else:
        messages.append("Challenges already exist.")

    db.commit()
    return {"message": " / ".join(messages)}

# --- Community Feed Routes ---
@app.get("/community-feed", response_model=List[schemas.CommunityFeedSchema])
def get_community_feed(db: Session = Depends(database.get_db)):
    return db.query(models.CommunityFeed).order_by(models.CommunityFeed.created_at.desc()).all()


# --- Update Seed Data for Community Feed ---
@app.post("/seed-full")
def seed_full_data(db: Session = Depends(database.get_db)):
    # Call original seed logic (simplified by calling functions or just re-implementing relevant parts if needed)
    # For prototype, let's just do it all here or piggyback.
    # To avoid redefining everything, I'll allow this endpoint to handle the community feed specifically 
    # OR better yet, just update the existing /seed logic below seamlessly if that was the instruction.
    # But since I am editing the file, I will just append the Community Feed seeding to the existing /seed endpoint logic 
    # via a new call. Wait, I should edit the existing /seed function instead of making a new one if possible.
    # But replacing a large block is risky.
    # I will CREATE a separate seed-community endpoint for safety and clarity, then user can call it.
    
    messages = []
    
    if db.query(models.CommunityFeed).count() == 0:
        feed_data = [
            {
                "title": "City Green Drive",
                "category": "Greenery",
                "location": "New York, NY",
                "description": "Join us for a weekend tree plantation drive at Central Park.",
                "external_link": "https://www.nycparks.org",
                "created_at": date.today()
            },
            {
                "title": "Ocean Cleanup Initiative",
                "category": "Water",
                "location": "San Francisco, CA",
                "description": "Volunteer to clean up the beaches and protect marine life.",
                "external_link": "https://theoceancleanup.com",
                "created_at": date.today() - timedelta(days=2)
            },
            {
                "title": "Solar for Schools",
                "category": "Energy",
                "location": "Austin, TX",
                "description": "Help install solar panels in local public schools.",
                "external_link": "https://solarforeveryone.org",
                "created_at": date.today() - timedelta(days=5)
            },
            {
                "title": "Zero Waste Workshop",
                "category": "Waste",
                "location": "Seattle, WA",
                "description": "Learn how to reduce your daily waste to zero with experts.",
                "external_link": "https://zerowaste.org",
                "created_at": date.today() - timedelta(days=1)
            },
             {
                "title": "Community Composting",
                "category": "Waste",
                "location": "Portland, OR",
                "description": "Turn your kitchen scraps into rich soil for community gardens.",
                "external_link": "https://portlandcomposts.org",
                "created_at": date.today() - timedelta(days=3)
            }
        ]
        
        for item in feed_data:
            feed_item = models.CommunityFeed(**item)
            db.add(feed_item)
        
        db.commit()
        messages.append("Community Feed seeded.")
    else:
        messages.append("Community Feed already exists.")

    return {"message": " ".join(messages)}


@app.post("/contact")
async def create_ngo_request(request: schemas.NGORequestCreate, db: Session = Depends(database.get_db)):
    new_request = models.NGORequest(**request.dict())
    db.add(new_request)
    db.commit()
    
    # Send Email
    try:
        email_service = email_utils.EmailService()
        subject = f"New NGO Request: {request.org_name}"
        body = f"""
        <h1>New Partnership Request</h1>
        <p><strong>Organization:</strong> {request.org_name}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Location:</strong> {request.location}</p>
        <p><strong>Category:</strong> {request.category}</p>
        <p><strong>Website:</strong> {request.website}</p>
        <p><strong>Description:</strong> {request.description}</p>
        """
        # Send to admin (using the configured MAIL_USERNAME as admin for now, or a specific admin email)
        # Using the sender email as recipient for self-notification
        admin_email = os.getenv("MAIL_USERNAME") 
        if admin_email:
            await email_service.send_contact_email(subject, admin_email, body)
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Build success but warn about email? Or just ignore for prototype robustness
        pass
        
    return {"message": "Request received. We will review your submission shortly."}


