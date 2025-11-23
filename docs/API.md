# API Documentation

## Backend API (Port 5000)

Base URL: `http://localhost:5000/api`

### Session Endpoints

#### Create Session
```http
POST /session/create
Content-Type: application/json

{
  "roleId": "software-engineer",
  "voiceEnabled": false
}

Response:
{
  "sessionId": "uuid",
  "roleId": "software-engineer",
  "voiceEnabled": false
}
```

#### Get Session
```http
GET /session/:sessionId

Response:
{
  "id": "uuid",
  "role_id": "software-engineer",
  "voice_enabled": 0,
  "created_at": "2025-11-23T10:00:00Z",
  "ended_at": null,
  "duration": null,
  "score": null
}
```

#### End Session
```http
POST /session/end
Content-Type: application/json

{
  "sessionId": "uuid",
  "score": 85
}

Response:
{
  "sessionId": "uuid",
  "score": 85
}
```

### Interview Endpoints

#### Get Role Templates
```http
GET /interview/roles

Response:
{
  "roles": [
    {
      "id": "software-engineer",
      "title": "Software Engineer",
      "description": "...",
      "difficulty": "mid",
      "questions_pool": "[...]"
    }
  ]
}
```

#### Send Text Message
```http
POST /interview/message
Content-Type: application/json

{
  "sessionId": "uuid",
  "message": "I have 5 years of experience..."
}

Response:
{
  "message": "That's great! Can you tell me about a challenging project..."
}
```

#### Send Audio Message
```http
POST /interview/audio
Content-Type: multipart/form-data

audio: [audio file]
sessionId: "uuid"

Response:
{
  "transcription": "I have experience with React...",
  "message": "Excellent! How do you handle state management?",
  "audioUrl": "/audio/generated/response.wav"
}
```

#### Get Evaluation
```http
GET /interview/evaluation/:sessionId

Response:
{
  "overall_score": 85,
  "strengths": [
    "Clear communication",
    "Strong technical knowledge"
  ],
  "areas_for_improvement": [
    "Could provide more specific examples"
  ],
  "detailed_feedback": "Overall excellent performance..."
}
```

### History Endpoints

#### Get All Sessions
```http
GET /history/sessions

Response:
{
  "sessions": [
    {
      "id": "uuid",
      "role_title": "Software Engineer",
      "created_at": "2025-11-23T10:00:00Z",
      "score": 85
    }
  ]
}
```

#### Get Session Details
```http
GET /history/session/:sessionId

Response:
{
  "id": "uuid",
  "role_title": "Software Engineer",
  "created_at": "2025-11-23T10:00:00Z",
  "duration": 30,
  "score": 85,
  "messages": [
    {
      "role": "interviewer",
      "content": "Tell me about yourself",
      "timestamp": "2025-11-23T10:00:00Z"
    }
  ],
  "evaluation": { ... }
}
```

## Voice Agent API (Port 5001)

Base URL: `http://localhost:5001/api`

### STT Endpoint

#### Transcribe Audio
```http
POST /stt/transcribe
Content-Type: multipart/form-data

audio: [audio file]

Response:
{
  "transcription": "This is the transcribed text"
}
```

### TTS Endpoint

#### Synthesize Speech
```http
POST /tts/synthesize
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "speaker_id": 0
}

Response: [audio/wav binary data]
```

### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "services": {
    "stt": true,
    "tts": true
  }
}
```

## WebSocket Events

Connect to: `ws://localhost:5000`

### Client -> Server Events
- `join-session` - Join a session room
  ```json
  { "sessionId": "uuid" }
  ```

### Server -> Client Events
- `message` - New message in session
- `evaluation-ready` - Evaluation is ready
- `session-ended` - Session has ended

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": ["Additional detail 1", "Additional detail 2"]
}
```

Common HTTP status codes:
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
