import requests
import json

def test_simple_chat():
    """Test the simple chat endpoint"""
    url = "http://localhost:8000/simple-chat"
    
    payload = {
        "message": "Write me a short poem about technology",
        "model": "mistral"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing simple chat endpoint...")
        print(f"Sending request to: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        print(f"\nResponse Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            print(f"\nAI Response: {result.get('response', 'No response content')}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the backend. Make sure the server is running on localhost:8000")
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_full_chat():
    """Test the full chat endpoint"""
    url = "http://localhost:8000/chat"
    
    payload = {
        "model": "mistral",
        "messages": [
            {
                "role": "user",
                "content": "Hello! How are you today?"
            }
        ],
        "stream": False
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("\n" + "="*50)
        print("Testing full chat endpoint...")
        print(f"Sending request to: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        print(f"\nResponse Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the backend. Make sure the server is running on localhost:8000")
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_health():
    """Test the health endpoint"""
    url = "http://localhost:8000/health"
    
    try:
        print("\n" + "="*50)
        print("Testing health endpoint...")
        print(f"Sending request to: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"\nResponse Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Health Status: {json.dumps(result, indent=2)}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the backend. Make sure the server is running on localhost:8000")
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Backend API Test Script")
    print("Make sure your backend is running on localhost:8000")
    print("And Ollama is running on localhost:11434 with the mistral model")
    
    # Test health first
    test_health()
    
    # Test simple chat
    test_simple_chat()
    
    # Test full chat
    test_full_chat()
    
    print("\n" + "="*50)
    print("Test completed!")