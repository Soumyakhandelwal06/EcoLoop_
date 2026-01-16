from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# --- Game Data Schemas ---

class ChallengeCompletion(BaseModel):
    challenge_id: int
    completion_date: date

    class Config:
        from_attributes = True

class LevelBase(BaseModel):
    title: str
    description: str
    order: int
    xp_reward: int
    theme_id: str
    video_id: str
    task_description: str
    info_content: str

class QuestionBase(BaseModel):
    text: str
    options: str
    correct_index: int
    difficulty: int
    segment_index: int = 0

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True

class Level(LevelBase):
    id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True

class UserProgressBase(BaseModel):
    level_id: int
    status: str
    score: int

class UserProgress(UserProgressBase):
    id: int

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    coins: int
    streak: int
    profile_image: Optional[str] = None
    progress: List[UserProgress] = []
    challenge_completions: List[ChallengeCompletion] = []

    class Config:
        from_attributes = True

class TaskVerification(BaseModel):
    is_valid: bool
    confidence: float
    message: str

class ProgressUpdate(BaseModel):
    level_id: int
    coins_earned: int
    xp_earned: int
    is_level_completion: bool = True

# --- Chat Schemas ---

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# --- Store Schemas ---
class StoreItemSchema(BaseModel):
    id: int
    name: str
    description: str
    price: int
    icon_type: str
    category: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class PurchaseRequest(BaseModel):
    item_id: int



class ChallengeSchema(BaseModel):
    id: int
    title: str
    description: str
    coin_reward: int
    type: str # 'daily', 'weekly'
    is_active: bool
    verification_label: Optional[str] = None
    is_completed: Optional[bool] = False

    class Config:
        from_attributes = True

class ChallengeCompletionResponse(BaseModel):
    message: str
    new_balance: int
    streak_incremented: bool
    new_streak: int