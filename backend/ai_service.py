import google.generativeai as genai
import os
import time
from dotenv import load_dotenv
from PIL import Image
import io
import json

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

async def verify_task_content(file_path: str, mime_type: str, task_tag: str) -> dict:
    """
    Verifies if the uploaded content (Image or Video) matches the required task using Gemini.
    """
    if not api_key:
        print("WARNING: GEMINI_API_KEY not found. Returning Mock Success.")
        return {
            "is_valid": True, 
            "message": "AI Verification Skipped (No API Key). Assuming success!", 
            "confidence": 1.0
        }

    try:
        # Use gemini-2.0-flash as it's the latest and great for multimodal
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"Analyze this media (could be image or video). Does it show {task_tag}? Answer ONLY with a JSON object: {{ 'valid': boolean, 'reason': string }}."

        if mime_type.startswith('video/'):
            # Video path
            print(f"DEBUG: Processing video with Gemini File API: {file_path}")
            
            # Upload the file
            video_file = genai.upload_file(path=file_path, mime_type=mime_type)
            
            # Wait for processing
            while video_file.state.name == "PROCESSING":
                print(".", end="", flush=True)
                time.sleep(1)
                video_file = genai.get_file(video_file.name)

            if video_file.state.name == "FAILED":
                raise Exception("Video processing failed at Google Gemini backend.")

            response = model.generate_content([prompt, video_file])
            
            # Clean up: Files are stored for 48 hours, but we can delete manually if needed
            # For this prototype, we'll let them expire or add delete later.
        else:
            # Image path - optimized
            image = Image.open(file_path)
            response = model.generate_content([prompt, image])

        if not response or not hasattr(response, 'text'):
             return {
                "is_valid": False,
                "message": "AI could not process this media. Please try again with clear content.",
                "confidence": 0.0
            }

        text = response.text.replace('```json', '').replace('```', '').strip()
        
        try:
            result = json.loads(text)
            return {
                "is_valid": result.get("valid", False),
                "message": result.get("reason", "Analysis complete."),
                "confidence": 0.95 
            }
        except json.JSONDecodeError:
            is_valid = "true" in text.lower() or "yes" in text.lower()
            return {
                "is_valid": is_valid,
                "message": text,
                "confidence": 0.8
            }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "is_valid": False, 
            "message": f"AI Error: {str(e)}", 
            "confidence": 0.0
        }
