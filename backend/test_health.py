import requests
import sys

def test_health():
    url = "http://localhost:8000/health"
    print(f"Testing Health Endpoint: {url}")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print(f"✅ Success! Status: {response.status_code}")
            print(f"Response Body: {response.json()}")
        else:
            print(f"❌ Failed! Status: {response.status_code}")
            print(f"Error Body: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_health()
