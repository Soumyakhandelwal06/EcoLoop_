from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database, auth, ai_service
from typing import List
from datetime import date, timedelta
import os
import time

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EcoLoop API")

# CORS (Allow Frontend)
origins = [
    "http://localhost:5173", # Vite Dev Server
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "EcoLoop API is running", "docs": "/docs"}

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
    # Normalize username to lowercase
    user.username = user.username.lower()

    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create User
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_pwd,
        streak=0,
        last_login=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize Progress (Unlock Level 1)
    # We should have seed levels first. Let's assume they exist or check.
    # ideally we seed levels on startup.
    
    # Create Token
    access_token = auth.create_access_token(data={"sub": new_user.username})

    # Initialize Progress (Unlock Level 1)
    # Get Level 1 ID
    level1 = db.query(models.Level).filter(models.Level.order == 1).first()
    if level1:
        new_progress = models.UserProgress(
            user_id=new_user.id,
            level_id=level1.id,
            status="unlocked",
            score=0
        )
        db.add(new_progress)
        db.commit()

    return {"access_token": access_token, "token_type": "bearer"}

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
    update_user_streak(current_user, db)
    
    # 2. Check/Update UserProgress for this Level
    user_progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.level_id == progress_data.level_id
    ).first()
    
    if user_progress:
        if user_progress.status != "completed":
             user_progress.status = "completed"
             user_progress.score = max(user_progress.score, progress_data.xp_earned) 
    else:
        user_progress = models.UserProgress(
            user_id=current_user.id,
            level_id=progress_data.level_id,
            status="completed",
            score=progress_data.xp_earned
        )
        db.add(user_progress)
    
    # 3. Unlock Next Level
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
        
    db.commit()
    db.refresh(current_user)
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

# --- Seed Data Endpoint (For Demo) ---
@app.post("/seed")
def seed_data(db: Session = Depends(database.get_db)):
    # Check if levels exist
    if db.query(models.Level).count() > 0:
        return {"message": "Data already seeded"}
    
    levels_data = [
        {"title": "Green Forest", "description": "Save the trees!", "order": 1, "theme_id": "forest", "xp_reward": 100, "video_id": "Ic-J6hcSKa8", "task_description": "Find a tree or plant and take a photo to show you appreciate nature!"}, # Deforestation Dr Binocs
        {"title": "Clean River", "description": "Keep waters blue.", "order": 2, "theme_id": "river", "xp_reward": 150, "video_id": "Om42Lppkd9w", "task_description": "Take a photo of you using a reusable water bottle!"}, # Water Pollution (Dr Binocs)
        {"title": "Eco City", "description": "Urban sustainability.", "order": 3, "theme_id": "city", "xp_reward": 200, "video_id": "VlRPA1h5F40", "task_description": "Take a photo of a recycling bin or segregated waste."}, # Sustainable Cities
        {"title": "Windy Peak", "description": "Renewable energy.", "order": 4, "theme_id": "mountain", "xp_reward": 250, "video_id": "RnvCbquYeIM", "task_description": "Take a photo of a bicycle or walking path (eco-transport)."}, # Renewable Energy
        {"title": "Space Station", "description": "Future of earth.", "order": 5, "theme_id": "sky", "xp_reward": 500, "video_id": "KoGgqC6S71Y", "task_description": "Take a clear photo of the sky (aim for clean air!)."}, # Climate Change from Space
    ]
    
    for l in levels_data:
        db_level = models.Level(**l)
        db.add(db_level)
        db.flush() # Get ID
        
        # Add Questions for this Level
        questions = []
        if l["theme_id"] == "forest": # Deforestation
            questions = [
               {"text": "What is the primary cause of deforestation mentioned?", "options": "Agriculture|Urbanization|Mining|Tourism", "correct_index": 0, "difficulty": 1},
               {"text": "Which gas do trees absorb from the atmosphere?", "options": "Oxygen|Carbon Dioxide|Nitrogen|Helium", "correct_index": 1, "difficulty": 2},
               {"text": "What happens to the soil when trees are removed?", "options": "It becomes richer|It erodes easily|It changes color|Nothing", "correct_index": 1, "difficulty": 3},
               {"text": "Deforestation leads to the loss of habitat for what percentage of land animals?", "options": "10%|50%|80%|100%", "correct_index": 2, "difficulty": 4},
               {"text": "Which strategy was suggested to combat deforestation?", "options": "Buying more paper|Reforestation|Building roads|Ignoring it", "correct_index": 1, "difficulty": 5},
            ]
        elif l["theme_id"] == "river": # Water Pollution
             questions = [
               {"text": "What is the main source of water pollution?", "options": "Fish|Industrial Waste|Rain|Sunlight", "correct_index": 1, "difficulty": 1},
               {"text": "Why shouldn't you throw plastic in the river?", "options": "It floats|Animals eat it and die|It looks ugly|It melts", "correct_index": 1, "difficulty": 2},
               {"text": "What is 'runoff'?", "options": "Running fast|Water washing chemicals into rivers|A type of boat|A river race", "correct_index": 1, "difficulty": 3},
               {"text": "Which percentage of Earth's water is fresh and drinkable?", "options": "75%|50%|2.5%|10%", "correct_index": 2, "difficulty": 4},
               {"text": "What can you do at home to save water?", "options": "Leave tap open|Fix leaks|Take long showers|Wash cars daily", "correct_index": 1, "difficulty": 5},
            ]
        elif l["theme_id"] == "city": # Sustainable Cities
             questions = [
               {"text": "What is the 3R rule?", "options": "Run, Rest, Repeat|Reduce, Reuse, Recycle|Read, Write, React|Red, Rose, Ruby", "correct_index": 1, "difficulty": 1},
               {"text": "Which bin is usually for recycling?", "options": "Black|Blue/Green|Red|Invisible", "correct_index": 1, "difficulty": 2},
               {"text": "What is 'composting'?", "options": "Burning trash|Turning food waste into soil|Throwing food in river|Painting", "correct_index": 1, "difficulty": 3},
               {"text": "How do sustainable cities reduce traffic?", "options": "More cars|Public transport & biking|Closing roads|Flying cars", "correct_index": 1, "difficulty": 4},
               {"text": "What is a 'vertical garden'?", "options": "Plants on walls|Plants on ceilings|Plants in space|Fake plants", "correct_index": 0, "difficulty": 5},
            ]
        elif l["theme_id"] == "mountain": # Renewable Energy
             questions = [
               {"text": "Which of these is a renewable energy source?", "options": "Coal|Solar|Oil|Gas", "correct_index": 1, "difficulty": 1},
               {"text": "What captures energy from the wind?", "options": "Solar Panels|Turbines|Mirrors|Dams", "correct_index": 1, "difficulty": 2},
               {"text": "Why are fossil fuels bad for the climate?", "options": "They smell|They release greenhouse gases|They differ in color|They are cold", "correct_index": 1, "difficulty": 3},
               {"text": "What energy comes from the Earth's heat?", "options": "Geothermal|Hydro|Biomass|Nuclear", "correct_index": 0, "difficulty": 4},
               {"text": "Which country runs almost 100% on renewable energy (example)?", "options": "Iceland|USA|Mars|Atlantis", "correct_index": 0, "difficulty": 5},
            ]
        elif l["theme_id"] == "sky": # Climate Change
             questions = [
               {"text": "What is the 'Greenhouse Effect'?", "options": "Growing plants|Trapping heat in atmosphere|Painting houses green|Cooling the earth", "correct_index": 1, "difficulty": 1},
               {"text": "What is the main gas causing global warming?", "options": "Oxygen|Carbon Dioxide|Helium|Neon", "correct_index": 1, "difficulty": 2},
               {"text": "Rising sea levels are caused by...", "options": "More rain|Melting ice caps|Too many boats|Fish", "correct_index": 1, "difficulty": 3},
               {"text": "What is a 'Carbon Footprint'?", "options": "A dirty shoe|Total greenhouse gas emissions by a person|Coal dust| Graphite", "correct_index": 1, "difficulty": 4},
               {"text": "What is the global target limit for warming?", "options": "1.5°C|10°C|50°C|0°C", "correct_index": 0, "difficulty": 5},
            ]

        for q in questions:
            db_q = models.Question(level_id=db_level.id, **q)
            db.add(db_q)
    
    db.commit()
    return {"message": "Levels seeded successfully!"}
