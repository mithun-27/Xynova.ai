import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_flow():
    print("--- 1. Testing Registration ---")
    reg_data = {
        "username": f"user_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com",
        "password": "password123"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(f"Register Status: {resp.status_code}")
    
    print("\n--- 2. Testing Login ---")
    login_data = {"username": reg_data["email"], "password": reg_data["password"]}
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Login Status: {resp.status_code}")
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing Roadmap Generation ---")
    roadmap_data = {"topic": "Python Programming"}
    resp = requests.post(f"{BASE_URL}/roadmap/generate-roadmap", json=roadmap_data, headers=headers)
    print(f"Roadmap Status: {resp.status_code}")
    try:
        data = resp.json()
        task_id = data["task_id"]
        print(f"Task ID: {task_id}")
    except Exception as e:
        print(f"Error decoding JSON: {e}")
        print(f"Raw Response: {resp.text}")
        return

    print("\n--- 4. Polling Task Status ---")
    topic_id = None
    for _ in range(10):
        resp = requests.get(f"{BASE_URL}/tasks/status/{task_id}", headers=headers)
        res_json = resp.json()
        status = res_json["status"]
        print(f"Task Status: {status}")
        if status == "SUCCESS":
            topic_id = res_json["result"]["topic_id"]
            break
        time.sleep(5)

    print("\n--- 5. Testing Chat ---")
    chat_data = {
        "user_message": "What is Python?",
        "topic_id": topic_id,
        "history": []
    }
    resp = requests.post(f"{BASE_URL}/chat/", json=chat_data, headers=headers)
    print(f"Chat Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"AI Response: {resp.json()['response'].encode('ascii', 'ignore').decode('ascii')[:100]}...")

if __name__ == "__main__":
    test_flow()
