from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
import enum
from datetime import date
from database import Base

# Enum for Level Status
class LevelStatus(str, enum.Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    coins = Column(Integer, default=0)
    streak = Column(Integer, default=1)
    last_login = Column(Date, nullable=True)
    profile_image = Column(String, nullable=True) # Optional avatar URL

    # Relationships
    progress = relationship("UserProgress", back_populates="user")
    owned_items = relationship("UserItem", back_populates="user")
    challenge_completions = relationship("UserChallengeCompletion", back_populates="user")

class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)      # e.g., "Green Forest"
    description = Column(String) # e.g., "Learn about segregation"
    info_content = Column(String, default="") # Detailed educational content
    order = Column(Integer)     # 1, 2, 3...
    xp_reward = Column(Integer, default=100) # Coins reward
    theme_id = Column(String)   # 'forest', 'river' etc. for frontend map matching
    video_id = Column(String, default="dQw4w9WgXcQ") # YouTube Video ID
    task_description = Column(String, default="Upload a photo proving you completed the eco-task!")

    # Relationships
    user_progress = relationship("UserProgress", back_populates="level")
    questions = relationship("Question", back_populates="level")

class StoreItem(Base):
    __tablename__ = "store_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    price = Column(Integer)
    icon_type = Column(String) # 'badge', 'hoodie', 'bottle', 'tree'
    category = Column(String, default="Virtual") # 'Symbolic', 'Premium', 'Virtual'
    image_url = Column(String, nullable=True)

class UserItem(Base):
    """Tracks which user has bought which store item"""
    __tablename__ = "user_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("store_items.id"))
    purchase_date = Column(Date, default=date.today)

    user = relationship("User", back_populates="owned_items")
    item = relationship("StoreItem")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"))
    text = Column(String)
    # Storing options as JSON string or comma-separated for simplicity in SQLite 
    # (JSON type is available in newer, but simple string with separator is safest for raw prototype)
    # Actually, we can just use 4 column fields or a delimiter. Let's use a delimiter '|'.
    options = Column(String) # "A|B|C|D"
    correct_index = Column(Integer) # 0-3
    difficulty = Column(Integer) # 1-5 (Increasing difficulty)

    level = relationship("Level", back_populates="questions")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level_id = Column(Integer, ForeignKey("levels.id"))
    status = Column(String, default="locked") # 'locked', 'unlocked', 'completed'
    score = Column(Integer, default=0) # Quiz score (0-5)

    # Relationships
    user = relationship("User", back_populates="progress")
    level = relationship("Level", back_populates="user_progress")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    coin_reward = Column(Integer, default=50)
    type = Column(String) # 'daily', 'weekly'
    is_active = Column(Boolean, default=True)
    verification_label = Column(String, nullable=True) # AI tag

class UserChallengeCompletion(Base):
    __tablename__ = "user_challenge_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    completion_date = Column(Date, default=date.today)

    user = relationship("User", back_populates="challenge_completions")
    challenge = relationship("Challenge")
