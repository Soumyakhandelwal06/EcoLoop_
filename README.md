# EcoLoop 🌍

EcoLoop is a gamified sustainability application designed to educate and empower users to take environmental action. Users can learn about sustainability, track their progress, and earn rewards for eco-friendly behaviors.

## 🚀 Features

- **Gamified Learning**: Interactive levels featuring videos and quizzes on sustainability topics.
- **Eco-Challenges**: Daily and weekly challenges to encourage real-world impact.
- **Virtual Hero ID**: A customizable digital identity card showcasing your sustainability stats (CO2 saved, water saved, waste recycled).
- **Leaderboard & Badges**: Compete with others and earn recognition for your environmental contributions.
- **Eco Store**: Use EARNED EcoCoins to unlock rewards and enhancements.

## 🛠 Tech Stack

### Frontend
- **React.js**: Modern component-based UI.
- **Tailwind CSS**: Utility-first styling for a premium feel.
- **Lucide React**: High-quality icon set.
- **html2canvas**: Used for generating shareable Hero ID cards.

### Backend
- **FastAPI**: High-performance Python web framework.
- **MongoDB**: Flexible NoSQL database for user data and progress tracking.
- **Uvicorn**: Lightning-fast ASGI server.

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB (running locally or a cloud instance)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Soumyakhandelwal06/EcoLoop_
   cd EcoLoop_
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
Made with 🌱 for a greener planet.
