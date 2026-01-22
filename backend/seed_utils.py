import models
import database
from sqlalchemy.orm import Session
from datetime import date, timedelta

def seed_database(db: Session):
    # 1. Comprehensive Levels & Questions Data
    levels_data = [
        {"title": "Sustainability", "description": "Save the world!", "order": 1, "theme_id": "forest", "xp_reward": 100, "video_id": "/static/videos/level1.mp4", "task_description": "Take a photo of any single potted plant", "info_content": "Definition: Sustainability is described as a way of living that minimizes environmental damage by understanding how our lifestyle choices impact the world.\n\nSustainable Development: It is defined as development that meets the needs of the present generation without compromising the ability of future generations to meet their own needs.\n\nGoal: The ultimate goal is to \"save the world\" and ensure the health and well-being of the planet for the future."},
        {"title": "Env. Sustainability", "description": "Keep nature safe.", "order": 2, "theme_id": "river", "xp_reward": 150, "video_id": "/static/videos/level2.mp4", "task_description": "Take a photo of you using a reusable water bottle!", "info_content": "Focus: This specific type of sustainability focuses on keeping natural materials safe and protecting the habitats of animals and plants.\n\nActionable Tips:\n\nConserve Water: Turn off taps while brushing or shaving, take shorter showers, and reuse unsalted cooking water for plants.\n\nReduce Plastic: Use less plastic (bags and bottles) to prevent pollution and save energy.\n\nPlanting: Growing your own plants helps prevent harmful chemicals from infecting the environment.\n\nFood Consumption: Take smaller portions to avoid food waste and reduce dependency on food importation."},
        {"title": "Natural Resources", "description": "Mother Nature's supply.", "order": 3, "theme_id": "city", "xp_reward": 200, "video_id": "/static/videos/level3.mp4", "task_description": "Take a photo of a recycling bin or segregated waste.", "info_content": "Definition: These are sources of supply or support provided by \"Mother Nature\" that are present on Earth without human activity (e.g., water, forests, air, minerals).\n\nClassification:\n\nRenewable (Inexhaustible): Resources with an unlimited supply that can be used repeatedly, such as sunlight, air, and water (though water can become polluted).\n\nNon-Renewable (Exhaustible): Resources available in limited quantities that take a very long time to replenish, such as coal, petroleum, and natural gas.\n\nConsumption: There is a disparity in consumption; for instance, people in rich countries consume up to 10 times more natural resources than those in poorer countries."},
        {"title": "3 R's", "description": "Manage waste.", "order": 4, "theme_id": "mountain", "xp_reward": 250, "video_id": "/static/videos/level4.mp4", "task_description": "Take a photo of a bicycle or walking path (eco-transport).", "info_content": "Concept: A technique central to sustainable living to manage waste and resources.\n\nReduce: Curb the temptation to buy new products to decrease demand on resources.\n\nReuse: Find new uses for items instead of throwing them away (e.g., reusing paper for packaging).\n\nRecycle: Process waste materials into new products (e.g., molding glass into new glass, turning plastic into hangers or toys)."},
        {"title": "Global Warming", "description": "Earth is slowly dying.", "order": 5, "theme_id": "sky", "xp_reward": 500, "video_id": "/static/videos/level5.mp4", "task_description": "Take a clear photo of the sky (aim for clean air!).", "info_content": "Impact: The videos describe the Earth as \"slowly dying\" and under threat from \"extreme climate change\" due to the rising world population and growing demand for resources.\n\nCauses: Activities like burning fossil fuels (coal, petroleum) and excessive energy usage contribute to environmental damage.\n\nPollution: Air and water pollution are highlighted as hazardous conditions that threaten the survival of living beings and render renewable resources like water unusable."},
        {"title": "Green Forest", "description": "Save the trees!", "order": 6, "theme_id": "forest", "xp_reward": 600, "video_id": "/static/videos/level1.mp4", "task_description": "Find a tree or plant and take a photo to show you appreciate nature!", "info_content": "Forests cover 31% of the land area on our planet. They help people thrive and survive by purifying water and air and providing people with jobs."},
        {"title": "Clean River", "description": "Keep waters blue.", "order": 7, "theme_id": "river", "xp_reward": 700, "video_id": "/static/videos/level2.mp4", "task_description": "Take a photo of you using a reusable water bottle!", "info_content": "Water pollution occurs when harmful substances—often chemicals or microorganisms—contaminate a stream, river, lake, ocean, aquifer, or other body of water."},
        {"title": "Eco City", "description": "Urban sustainability.", "order": 8, "theme_id": "city", "xp_reward": 800, "video_id": "/static/videos/level3.mp4", "task_description": "Take a photo of a recycling bin or segregated waste.", "info_content": "Sustainable cities are designed with consideration for the triple bottom line: social, economic, and environmental impact."},
        {"title": "Windy Peak", "description": "Renewable energy.", "order": 9, "theme_id": "mountain", "xp_reward": 900, "video_id": "/static/videos/level4.mp4", "task_description": "Take a photo of a bicycle or walking path (eco-transport).", "info_content": "Renewable energy is energy that is collected from renewable resources that are naturally replenished on a human timescale."},
        {"title": "Space Station", "description": "Future of earth.", "order": 10, "theme_id": "sky", "xp_reward": 1000, "video_id": "/static/videos/level5.mp4", "task_description": "Take a clear photo of the sky.", "info_content": "Climate change describes a change in the average conditions — such as temperature and rainfall — in a region over a long period of time."},
    ]

    questions_data = {
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

    # Seeding Logic for Levels & Questions
    for l_data in levels_data:
        level = db.query(models.Level).filter(models.Level.order == l_data["order"]).first()
        if not level:
            level = models.Level(**l_data)
            db.add(level)
            db.flush()
        else:
            # Update attributes
            for key, value in l_data.items():
                setattr(level, key, value)
        
        # Sync Questions
        level_id = level.id
        target_questions = questions_data.get(l_data["order"], [])
        current_count = db.query(models.Question).filter(models.Question.level_id == level_id).count()
        
        if current_count != len(target_questions):
            # Safe reset for simple seeding
            db.query(models.Question).filter(models.Question.level_id == level_id).delete()
            for q_data in target_questions:
                db_q = models.Question(level_id=level_id, **q_data)
                db.add(db_q)

    # 2. Seed Store Items
    store_items = [
        {"name": "Plant a Tree", "description": "We will plant a real tree in your name.", "price": 1000, "icon_type": "tree", "category": "Symbolic", "image_url": "/static/image/store/tree.jpg"},
        {"name": "Eco-Warrior Hoodie", "description": "Virtual hoodie for your avatar.", "price": 500, "icon_type": "hoodie", "category": "Premium", "image_url": "/static/image/store/hoodie.jpg"},
        {"name": "Reusable Bottle", "description": "Digital badge for your profile.", "price": 200, "icon_type": "bottle", "category": "Virtual", "image_url": "/static/image/store/bottle.jpg"},
        {"name": "Waste Hero Badge", "description": "Rare gold profile badge.", "price": 300, "icon_type": "badge", "category": "Premium", "image_url": "/static/image/store/badge.jpg"},
        {"name": "Eco Sticker Pack", "description": "Fun stickers to spread the green message.", "price": 150, "icon_type": "sticker", "category": "Student", "image_url": "/static/image/store/stickers.jpg"},
        {"name": "Bio-Geometry Box", "description": "Sleek, transparent, and eco-friendly geometry kit.", "price": 600, "icon_type": "box", "category": "Student", "image_url": "/static/image/store/geometry_box.jpg"},
        {"name": "Recycled Pouch", "description": "Durable pouch made from upcycled fabric.", "price": 400, "icon_type": "pouch", "category": "Student", "image_url": "/static/image/store/pouch.jpg"},
        {"name": "Green Journal", "description": "100% recycled paper for your notes.", "price": 300, "icon_type": "book", "category": "Student", "image_url": "/static/image/store/notebook.jpg"},
        {"name": "Solar Charger", "description": "Charge your devices with the sun's energy.", "price": 2500, "icon_type": "zap", "category": "Premium", "image_url": "/static/image/store/solar_charger.jpg"},
    ]
    for item in store_items:
        existing = db.query(models.StoreItem).filter(models.StoreItem.name == item["name"]).first()
        if not existing:
            db_item = models.StoreItem(**item)
            db.add(db_item)
        else:
            for key, value in item.items():
                setattr(existing, key, value)

    # 3. Seed Challenges
    challenges_data = [
        {"title": "Nature Appreciation", "description": "Find a tree and take a photo to show you appreciate nature!", "coin_reward": 20, "type": "daily", "verification_label": "tree, plant, green nature, leaves"},
        {"title": "Water Saver", "description": "Limit your shower to 5 minutes.", "coin_reward": 20, "type": "daily", "verification_label": "shower timer or water saving fixture"},
        {"title": "Weekly Cleanup", "description": "Clean up a local park or street for 1 hour.", "coin_reward": 20, "type": "weekly", "verification_label": "person collecting trash outdoors with a bag"},
        {"title": "Vegetarian Week", "description": "Eat no meat for a full week.", "coin_reward": 20, "type": "weekly", "verification_label": "vegetarian meal without any meat"},
    ]
    for c_data in challenges_data:
        existing = db.query(models.Challenge).filter(models.Challenge.title == c_data["title"]).first()
        if not existing:
            db_challenge = models.Challenge(**c_data)
            db.add(db_challenge)
        else:
            for key, value in c_data.items():
                setattr(existing, key, value)

    db.commit()

