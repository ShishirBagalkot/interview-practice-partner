# Ollama Chat Backend

A Python FastAPI backend that accepts user input via API and communicates with Ollama running locally.

## Features

- **FastAPI backend** with automatic API documentation
- **Two endpoints** for different use cases:
  - `/chat` - Full chat interface with message history
  - `/simple-chat` - Simplified single message interface
- **Health check** endpoint to verify Ollama connectivity
- **Error handling** for connection issues and timeouts
- **Async support** for better performance

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure Ollama is running locally:**
   ```bash
   # Start Ollama (if not already running)
   ollama serve
   ```

3. **Verify you have the mistral model (or change the default model):**
   ```bash
   ollama pull mistral
   ```

## Usage

1. **Start the server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API:**
   - API will be available at: `http://localhost:8000`
   - Interactive API docs at: `http://localhost:8000/docs`
   - Alternative docs at: `http://localhost:8000/redoc`

## API Endpoints

### 1. Health Check
```
GET /health
```
Check if the backend and Ollama are accessible.

### 2. Simple Chat (Recommended for Postman testing)
```
POST /simple-chat
```
**Request body:**
```json
{
  "message": "Write me a short poem, anything you like",
  "model": "mistral"
}
```

**Response:**
```json
{
  "message": "Write me a short poem, anything you like",
  "model": "mistral", 
  "response": "Here's a short poem for you...",
  "full_response": { ... }
}
```

### 3. Full Chat Interface
```
POST /chat
```
**Request body:**
```json
{
  "model": "mistral",
  "messages": [
    {
      "role": "user",
      "content": "Write me a short poem, anything you like"
    }
  ],
  "stream": false
}
```

## Testing with Postman

1. **Start the backend server**
2. **Create a new POST request in Postman:**
   - URL: `http://localhost:8000/simple-chat`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "message": "Write me a short poem, anything you like",
       "model": "mistral"
     }
     ```

3. **Send the request** and you'll get a response with the AI-generated content.

## Testing with curl

### Simple Chat:
```bash
curl --location 'http://localhost:8000/simple-chat' \
--header 'Content-Type: application/json' \
--data '{
  "message": "Write me a short poem, anything you like",
  "model": "mistral"
}'
```

### Full Chat:
```bash
curl --location 'http://localhost:8000/chat' \
--header 'Content-Type: application/json' \
--data '{
  "model": "mistral",
  "messages": [
    {
      "role": "user",
      "content": "Write me a short poem, anything you like"
    }
  ],
  "stream": false
}'
```

## Error Handling

The API includes comprehensive error handling for:
- **Connection errors** when Ollama is not running
- **Timeout errors** for long-running requests
- **Invalid model** or request errors
- **General server errors**

## Configuration

- **Default port:** 8000
- **Ollama URL:** http://localhost:11434
- **Default model:** mistral
- **Request timeout:** 60 seconds

You can modify these settings in the `main.py` file as needed.