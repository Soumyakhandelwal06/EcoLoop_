import models
import database
from sqlalchemy.orm import Session
from datetime import date, timedelta

def seed_database(db: Session):
    # 1. Seed Levels
    if db.query(models.Level).count() == 0:
        levels_data = [
            {"title": "Sustainability", "description": "Save the world!", "order": 1, "theme_id": "forest", "xp_reward": 100, "video_id": "/static/videos/level1.mp4", "task_description": "Take a photo of any single potted plant", "info_content": "Definition: Sustainability is described as a way of living..."},
            {"title": "Env. Sustainability", "description": "Keep nature safe.", "order": 2, "theme_id": "river", "xp_reward": 150, "video_id": "/static/videos/level2.mp4", "task_description": "Take a photo of you using a reusable water bottle!", "info_content": "Focus: This specific type of sustainability focuses on keeping natural materials safe..."},
            {"title": "Natural Resources", "description": "Mother Nature's supply.", "order": 3, "theme_id": "city", "xp_reward": 200, "video_id": "/static/videos/level3.mp4", "task_description": "Take a photo of a recycling bin or segregated waste.", "info_content": "Definition: These are sources of supply or support provided by \"Mother Nature\"..."},
            {"title": "3 R's", "description": "Manage waste.", "order": 4, "theme_id": "mountain", "xp_reward": 250, "video_id": "/static/videos/level4.mp4", "task_description": "Take a photo of a bicycle or walking path (eco-transport).", "info_content": "Concept: A technique central to sustainable living to manage waste and resources."},
            {"title": "Global Warming", "description": "Earth is slowly dying.", "order": 5, "theme_id": "sky", "xp_reward": 500, "video_id": "/static/videos/level5.mp4", "task_description": "Take a clear photo of the sky (aim for clean air!).", "info_content": "Impact: The videos describe the Earth as \"slowly dying\" and under threat from \"extreme climate change\"..."},
        ]
        for l in levels_data:
            db_level = models.Level(**l)
            db.add(db_level)
        db.commit()

    # 2. Seed Store Items
    if db.query(models.StoreItem).count() == 0:
        store_items = [
            {"name": "Plant a Tree", "description": "We will plant a real tree in your name.", "price": 1000, "icon_type": "tree", "category": "Symbolic", "image_url": "/static/image/store/tree.jpg"},
            {"name": "Eco-Warrior Hoodie", "description": "Virtual hoodie for your avatar.", "price": 500, "icon_type": "hoodie", "category": "Premium", "image_url": "/static/image/store/hoodie.jpg"},
            {"name": "Reusable Bottle", "description": "Digital badge for your profile.", "price": 200, "icon_type": "bottle", "category": "Virtual", "image_url": "/static/image/store/bottle.jpg"},
            {"name": "Waste Hero Badge", "description": "Rare gold profile badge.", "price": 300, "icon_type": "badge", "category": "Premium", "image_url": "/static/image/store/badge.jpg"},
        ]
        for item in store_items:
            db_item = models.StoreItem(**item)
            db.add(db_item)
        db.commit()

    # 3. Seed Challenges
    if db.query(models.Challenge).count() == 0:
        challenges_data = [
            {"title": "Nature Appreciation", "description": "Find a tree and take a photo to show you appreciate nature!", "coin_reward": 20, "type": "daily", "verification_label": "tree, plant, green nature, leaves"},
            {"title": "Water Saver", "description": "Limit your shower to 5 minutes.", "coin_reward": 20, "type": "daily", "verification_label": "shower timer or water saving fixture"},
            {"title": "Weekly Cleanup", "description": "Clean up a local park or street for 1 hour.", "coin_reward": 20, "type": "weekly", "verification_label": "person collecting trash outdoors with a bag"},
        ]
        for c in challenges_data:
            db_challenge = models.Challenge(**c)
            db.add(db_challenge)
        db.commit()
