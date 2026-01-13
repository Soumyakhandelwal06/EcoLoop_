from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

import models
import schemas
import database
import auth
import ai_service

# ---------------- INITIALIZE DB ----------------

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EcoLoop API")

# ---------------- CORS ----------------

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STATIC FILES ----------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------- AUTH ROUTES ----------------

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user.username = user.username.lower()

    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth.get_password_hash(user.password),
        streak=1,
        last_login=date.today()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_access_token({"sub": new_user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user.username = user.username.lower()

    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if not db_user or not auth.verify_password(
        user.password, db_user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    today = date.today()
    if db_user.last_login != today:
        db_user.streak = db_user.streak + 1 if db_user.last_login == today - timedelta(days=1) else 1
        db_user.last_login = today
        db.commit()

    token = auth.create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ---------------- PROGRESS ----------------

@app.post("/users/progress")
def update_progress(
    progress: schemas.ProgressUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    current_user.coins += progress.coins_earned

    entry = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.level_id == progress.level_id
    ).first()

    if entry:
        entry.status = "COMPLETED"
        entry.score = max(entry.score or 0, progress.xp_earned)
    else:
        db.add(models.UserProgress(
            user_id=current_user.id,
            level_id=progress.level_id,
            status="COMPLETED",
            score=progress.xp_earned
        ))

    db.commit()
    return {"message": "Progress updated", "coins": current_user.coins}

# ---------------- LEVELS ----------------

@app.get("/levels", response_model=List[schemas.Level])
def get_levels(db: Session = Depends(database.get_db)):
    levels = db.query(models.Level).order_by(models.Level.order).all()
    if not levels:
        raise HTTPException(status_code=404, detail="No levels found")
    return levels

# ---------------- AI VERIFICATION (FINAL) ----------------

@app.post("/verify-task")
async def verify_task(
    file: UploadFile = File(...),
    task_description: str = Form(...),
    task_type: str = Form("Daily Task"),
    level_id: int = Form(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Advanced AI-powered task verification with:
    - AI-generated content detection
    - Proof validation
    - Reward system
    """

    MAX_FILE_SIZE = 10 * 1024 * 1024
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (10MB max)")

    allowed_types = [
        "image/jpeg", "image/jpg", "image/png", "image/webp",
        "video/mp4", "video/mpeg", "video/quicktime"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    if len(content) < 100:
        raise HTTPException(status_code=400, detail="File appears corrupted")

    try:
        result = await ai_service.verify_task_submission(
            file_bytes=content,
            mime_type=file.content_type,
            task_description=task_description,
            task_type=task_type
        )

        if result.get("error"):
            return {
                "success": False,
                "verified": False,
                "message": result.get("feedback_message"),
                "error": result.get("error")
            }

        if result.get("is_verified"):
            rewards = {
                "Daily Task": {"coins": 10, "xp": 20},
                "Monthly Task": {"coins": 50, "xp": 100},
                "Level Challenge": {"coins": 25, "xp": 50}
            }

            reward = rewards.get(task_type, {"coins": 10, "xp": 20})
            current_user.coins += reward["coins"]

            if level_id and task_type == "Level Challenge":
                entry = db.query(models.UserProgress).filter(
                    models.UserProgress.user_id == current_user.id,
                    models.UserProgress.level_id == level_id
                ).first()

                if entry:
                    entry.status = "COMPLETED"
                    entry.score = max(entry.score or 0, reward["xp"])
                else:
                    db.add(models.UserProgress(
                        user_id=current_user.id,
                        level_id=level_id,
                        status="COMPLETED",
                        score=reward["xp"]
                    ))

            db.commit()

            return {
                "success": True,
                "verified": True,
                "message": result.get("feedback_message", "Task verified!"),
                "rewards": reward,
                "new_coin_balance": current_user.coins,
                "analysis": {
                    "confidence": result.get("confidence_score"),
                    "ai_probability": result.get("ai_generated_probability"),
                    "relevance": result.get("task_relevance_score"),
                    "proof_detected": result.get("proof_detected")
                }
            }

        return {
            "success": False,
            "verified": False,
            "message": result.get("feedback_message"),
            "analysis": {
                "confidence": result.get("confidence_score"),
                "ai_probability": result.get("ai_generated_probability"),
                "relevance": result.get("task_relevance_score"),
                "proof_detected": result.get("proof_detected")
            },
            "suggestions": [
                "Upload a real photo/video",
                "Avoid AI-generated content",
                "Ensure task is clearly visible"
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- IMAGE QUALITY CHECK ----------------

@app.post("/check-image-quality")
async def check_image_quality(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    content = await file.read()

    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Images only")

    try:
        result = await ai_service.analyze_image_quality(
            file_bytes=content,
            mime_type=file.content_type
        )
        return result
    except Exception as e:
        return {"quality_ok": True, "message": "Quality check unavailable", "error": str(e)}

# ---------------- SEED DATA ----------------

@app.post("/seed")
def seed(db: Session = Depends(database.get_db)):
    if db.query(models.Level).count() > 0:
        return {"message": "Levels already seeded"}

    levels_data = [
        {
            "title": "Sustainability",
            "description": "Making choices that protect our planet for the future.",
            "order": 1,
            "theme_id": "sustainability",
            "xp_reward": 100,
            "video_id": "http://localhost:8000/static/videos/level1.mp4",
            "task_description": "Take a photo of a sustainable action you are doing (e.g., using a reusable bottle or walking instead of driving)."
        },
        {
            "title": "Environmental Sustainability",
            "description": "Caring for nature and the environment around us.",
            "order": 2,
            "theme_id": "environment",
            "xp_reward": 120,
            "video_id": "http://localhost:8000/static/videos/level2.mp4",
            "task_description": "Take a photo of a clean green space, park, or garden."
        },
        {
            "title": "Natural Resources",
            "description": "Resources provided by nature like water, air, soil, and sunlight.",
            "order": 3,
            "theme_id": "resources",
            "xp_reward": 140,
            "video_id": "http://localhost:8000/static/videos/level3.mp4",
            "task_description": "Take a photo of a natural resource you use daily."
        },
        {
            "title": "3 Rs",
            "description": "Reduce, Reuse, and Recycle to cut down waste.",
            "order": 4,
            "theme_id": "3rs",
            "xp_reward": 160,
            "video_id": "http://localhost:8000/static/videos/level4.mp4",
            "task_description": "Take a photo showing Reduce, Reuse, or Recycle in action."
        },
        {
            "title": "Global Warming",
            "description": "Understanding climate change caused by human activities.",
            "order": 5,
            "theme_id": "climate",
            "xp_reward": 180,
            "video_id": "http://localhost:8000/static/videos/level5.mp4",
            "task_description": "Take a photo of an action that helps reduce global warming."
        },
    ]

    for lvl in levels_data:
        db_level = models.Level(**lvl)
        db.add(db_level)
        db.flush()

        if lvl["theme_id"] == "sustainability":
            questions = [
                {"text": "What does sustainability aim to protect?", "options": "Only humans|Future generations|Only animals|Only plants", "correct_index": 1, "difficulty": 1},
                {"text": "Which habit supports sustainability?", "options": "Wasting food|Using reusable bags|Burning trash|Overusing water", "correct_index": 1, "difficulty": 2},
                {"text": "Sustainability balances environment, society and what?", "options": "Weather|Economy|Technology|Population", "correct_index": 1, "difficulty": 3},
                {"text": "Why is saving energy important?", "options": "Costs more|Reduces resource use|Creates pollution|Wastes time", "correct_index": 1, "difficulty": 4},
                {"text": "Which is least sustainable?", "options": "Recycling|Public transport|Single-use plastic|Saving electricity", "correct_index": 2, "difficulty": 5},
            ]

        elif lvl["theme_id"] == "environment":
            questions = [
                {"text": "Environmental sustainability protects what?", "options": "Buildings|Nature|Machines|Roads", "correct_index": 1, "difficulty": 1},
                {"text": "Which harms the environment most?", "options": "Planting trees|Recycling|Pollution|Solar energy", "correct_index": 2, "difficulty": 2},
                {"text": "Why are forests important?", "options": "Cause noise|Absorb CO₂|Reduce oxygen|Stop rain", "correct_index": 1, "difficulty": 3},
                {"text": "Protecting wildlife maintains what?", "options": "Traffic|Ecosystem balance|Urban growth|Population", "correct_index": 1, "difficulty": 4},
                {"text": "Environmental care helps reduce?", "options": "Internet use|Climate change|Unemployment|Education gaps", "correct_index": 1, "difficulty": 5},
            ]

        elif lvl["theme_id"] == "resources":
            questions = [
                {"text": "Which is a natural resource?", "options": "Plastic|Water|Glass|Rubber", "correct_index": 1, "difficulty": 1},
                {"text": "Resources are renewable and?", "options": "Reusable|Artificial|Non-renewable|Temporary", "correct_index": 2, "difficulty": 2},
                {"text": "Which is non-renewable?", "options": "Wind|Solar|Coal|Water", "correct_index": 2, "difficulty": 3},
                {"text": "Overuse leads to?", "options": "Balance|Depletion|Growth|Conservation", "correct_index": 1, "difficulty": 4},
                {"text": "Renewables reduce use of?", "options": "Nature|Fossil fuels|Forests|Recycling", "correct_index": 1, "difficulty": 5},
            ]

        elif lvl["theme_id"] == "3rs":
            questions = [
                {"text": "What does Reduce mean?", "options": "Use more|Avoid waste|Burn garbage|Store trash", "correct_index": 1, "difficulty": 1},
                {"text": "Example of reuse?", "options": "Throwing bottles|Using containers again|Burning waste|Landfill", "correct_index": 1, "difficulty": 2},
                {"text": "Recycling helps by?", "options": "More waste|Saving resources|More pollution|More energy use", "correct_index": 1, "difficulty": 3},
                {"text": "First step in 3 Rs?", "options": "Recycle|Reuse|Reduce|Repair", "correct_index": 2, "difficulty": 4},
                {"text": "3 Rs mainly reduce?", "options": "Population|Waste|Rainfall|Temperature", "correct_index": 1, "difficulty": 5},
            ]

        elif lvl["theme_id"] == "climate":
            questions = [
                {"text": "Global warming is caused by?", "options": "Earth rotation|Greenhouse gases|Moon gravity|Oceans", "correct_index": 1, "difficulty": 1},
                {"text": "Main warming gas?", "options": "Oxygen|Carbon dioxide|Nitrogen|Hydrogen", "correct_index": 1, "difficulty": 2},
                {"text": "Burning fuels releases?", "options": "Ozone|CO₂|Helium|Neon", "correct_index": 1, "difficulty": 3},
                {"text": "Effect of warming?", "options": "Stable climate|Melting glaciers|More forests|Less oceans", "correct_index": 1, "difficulty": 4},
                {"text": "Which helps reduce warming?", "options": "Deforestation|Planting trees|Using coal|More vehicles", "correct_index": 1, "difficulty": 5},
            ]

        for q in questions:
            db.add(models.Question(level_id=db_level.id, **q))

    db.commit()
    return {"message": "Levels seeded successfully"}
