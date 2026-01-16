import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import time

# Load Environment Variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("CRITICAL ERROR: GOOGLE_API_KEY is missing from .env file.")
    exit(1)

genai.configure(api_key=GOOGLE_API_KEY)

# Configuration
VIDEO_DIR = "static/videos"
OUTPUT_FILE = "generated_questions.json"
LEVELS = [1, 2, 3, 4, 5]

SYSTEM_PROMPT = """
You are an expert educational content creator for the EcoLoop platform.
Your task is to watch a video, divide it into 5 equal time segments, and generate ONE multiple-choice question for EACH segment.

CRITICAL RULES:
1.  **Strict Segmentation**: The question for Segment N must be answerable ONLY using information presented in Segment N.
2.  **No Leakage**: Do not ask about concepts that appear in future segments.
3.  **No External Knowledge**: Answers must be derived strictly from the video content.
4.  **Format**: Return a JSON array of 5 objects.
"""

JSON_SCHEMA = """
[
  {
    "segment_index": 0,
    "text": "Question text here?",
    "options": "Option A|Option B|Option C|Option D",
    "correct_index": 0, # Index of correct option (0-3)
    "difficulty": 1
  },
  ... (4 more items)
]
"""

def generate_questions_for_video(video_path, level_id):
    print(f"\nPROCESSING LEVEL {level_id}: {video_path}")
    
    if not os.path.exists(video_path):
        print(f"File not found: {video_path}")
        return []

    try:
        # 1. Upload Video
        print("Uploading to Gemini...")
        video_file = genai.upload_file(path=video_path)
        
        # Wait for processing
        print("Waiting for processing", end="")
        while video_file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(2)
            video_file = genai.get_file(video_file.name)
        
        if video_file.state.name == "FAILED":
            raise Exception("Video processing failed.")
        
        print("\nVideo Ready. Generating questions...")

        # 2. Generate
        model = genai.GenerativeModel('gemini-2.0-flash-lite-001') # Fast model
        prompt = f"{SYSTEM_PROMPT}\n\nSchema: {JSON_SCHEMA}\n\nTask: Generate 5 questions for this video."
        
        response = model.generate_content([prompt, video_file], generation_config={"response_mime_type": "application/json"})
        
        # 3. Parse
        try:
            questions = json.loads(response.text)
            # Inject level_id
            for q in questions:
                q['level_id'] = level_id
            
            print(f"Successfully generated {len(questions)} questions for Level {level_id}.")
            return questions
            
        except json.JSONDecodeError:
            print(f"Error decoding JSON for Level {level_id}. Content: {response.text}")
            return []
            
    except Exception as e:
        print(f"Error processing Level {level_id}: {e}")
        return []

def main():
    all_questions = []
    
    for level_num in LEVELS:
        filename = f"level{level_num}.mp4"
        path = os.path.join(VIDEO_DIR, filename)
        
        # Check if file exists in current directory context
        # The script is run from 'backend' usually, so path depends on CWD.
        # Let's assume script runs from 'backend' dir, so static/videos is correct.
        if not os.path.exists(path):
            # Try absolute path if CWD is wrong
            # Adjust based on known structure
            path = f"/Users/namanagrawal/Documents/ecoloop/backend/static/videos/{filename}"

        questions = generate_questions_for_video(path, level_num)
        if questions:
            all_questions.extend(questions)
    
    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_questions, f, indent=2)
    
    print(f"\nDone! Saved {len(all_questions)} questions to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
