import requests
import random
import string
import sys

BASE_URL = "http://localhost:8000"

def get_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_registration_flow():
    username = f"testuser_{get_random_string()}"
    email = f"{username}@example.com"
    password = "password123"

    print(f"--- Testing Registration Flow for: {username} ---")

    # 1. Register
    reg_url = f"{BASE_URL}/register"
    reg_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        reg_res = requests.post(reg_url, json=reg_payload)
        if reg_res.status_code != 200:
            print(f"❌ Registration Failed: {reg_res.status_code} - {reg_res.text}")
            sys.exit(1)
        
        token = reg_res.json().get("access_token")
        print("✅ Registration Successful")

        # 2. Get Me (Check Progress)
        me_url = f"{BASE_URL}/users/me"
        headers = {"Authorization": f"Bearer {token}"}
        me_res = requests.get(me_url, headers=headers)
        
        if me_res.status_code != 200:
            print(f"❌ Get Me Failed: {me_res.status_code} - {me_res.text}")
            sys.exit(1)
        
        user_data = me_res.json()
        progress = user_data.get("progress", [])
        
        # Check if any progress entry is for level 1 and is 'unlocked'
        level1_unlocked = any(p.get("level_id") == 1 and p.get("status") == "unlocked" for p in progress)
        
        if level1_unlocked:
            print("✅ Level 1 initialized and unlocked for new user!")
        else:
            print("❌ Level 1 NOT found or NOT unlocked for new user!")
            print(f"Debug - Progress: {progress}")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error during test: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_registration_flow()
