# System Architecture

## Overview

Interview Practice Partner is a three-tier application that provides AI-powered interview practice with optional voice interaction.

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │ ───> │   Backend   │ ───> │ Voice Agent  │
│   (React)   │ <─── │ (Node/Expr) │ <─── │   (Python)   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │                      │
                            v                      v
                     ┌─────────────┐      ┌──────────────┐
                     │   Ollama    │      │  faster-     │
                     │  (Mistral)  │      │  whisper     │
                     └─────────────┘      │  + Piper     │
                            │             └──────────────┘
                            v
                     ┌─────────────┐
                     │   SQLite    │
                     │  Database   │
                     └─────────────┘
```

## Components

### 1. Frontend (React + Vite)

**Responsibilities:**
- User interface and interaction
- Chat interface with message display
- Audio recording and playback
- Session management
- History and replay views

**Key Technologies:**
- React 18 with hooks
- React Router for navigation
- Axios for HTTP requests
- Socket.IO client for real-time updates
- Web Speech API (optional fallback)

**Component Structure:**
```
src/
├── components/
│   ├── chat/          # Chat interface components
│   ├── interview/     # Interview-specific components
│   ├── history/       # History and replay
│   └── common/        # Reusable components
├── hooks/             # Custom React hooks
├── services/          # API and WebSocket services
├── context/           # React Context providers
└── utils/             # Utility functions
```

### 2. Backend (Node.js + Express)

**Responsibilities:**
- API endpoint management
- Session lifecycle management
- Database operations
- LLM orchestration
- WebSocket communication
- Audio file storage

**Key Technologies:**
- Express.js for REST API
- Socket.IO for WebSockets
- SQLite3 for database
- Multer for file uploads
- Axios for HTTP requests

**Architecture Layers:**
```
Routes (HTTP endpoints)
    ↓
Controllers (Request handling)
    ↓
Services (Business logic)
    ↓
Models (Data access)
    ↓
Database (SQLite)
```

**Service Layer:**
- **LLM Service**: Ollama API integration
- **Prompt Templates**: Interview conversation prompts
- **Evaluation Service**: Response scoring and feedback
- **Voice Services**: STT/TTS integration
- **Scoring Service**: Performance calculation

### 3. Voice Agent (Python + Flask)

**Responsibilities:**
- Speech-to-Text (faster-whisper)
- Text-to-Speech (Piper)
- Audio processing and normalization

**Key Technologies:**
- Flask for HTTP API
- faster-whisper for STT
- Piper for TTS
- PyDub for audio processing

**API Endpoints:**
- `/api/stt/transcribe` - Audio → Text
- `/api/tts/synthesize` - Text → Audio
- `/health` - Service health check

### 4. LLM Layer (Ollama + Mistral)

**Responsibilities:**
- Generate interview questions
- Understand candidate responses
- Provide contextual follow-ups
- Evaluate performance
- Generate feedback

**Integration:**
- Backend communicates via Ollama HTTP API
- Maintains conversation context
- Uses custom prompt templates
- Handles streaming and non-streaming responses

### 5. Database (SQLite)

**Schema:**

**sessions**
```sql
id TEXT PRIMARY KEY
role_id TEXT
voice_enabled INTEGER
created_at DATETIME
ended_at DATETIME
duration INTEGER
score INTEGER
```

**transcripts**
```sql
id INTEGER PRIMARY KEY
session_id TEXT
role TEXT (user/interviewer)
content TEXT
audio_url TEXT
timestamp DATETIME
```

**role_templates**
```sql
id TEXT PRIMARY KEY
title TEXT
description TEXT
difficulty TEXT
questions_pool TEXT (JSON)
```

**evaluations**
```sql
id INTEGER PRIMARY KEY
session_id TEXT
overall_score INTEGER
strengths TEXT (JSON)
areas_for_improvement TEXT (JSON)
detailed_feedback TEXT
```

## Data Flow

### Text Interview Flow

```
1. User selects role and starts session
   Frontend → Backend: POST /api/session/create
   
2. Backend creates session in database
   Backend → Database: INSERT INTO sessions
   
3. User sends message
   Frontend → Backend: POST /api/interview/message
   
4. Backend saves user message
   Backend → Database: INSERT INTO transcripts
   
5. Backend requests LLM response
   Backend → Ollama: POST /api/chat
   
6. LLM generates response
   Ollama → Backend: Interview question/response
   
7. Backend saves interviewer message
   Backend → Database: INSERT INTO transcripts
   
8. Response sent to frontend
   Backend → Frontend: JSON response
   
9. Frontend displays message
```

### Voice Interview Flow

```
1. User records audio
   Frontend → AudioService: Start/Stop recording
   
2. Audio sent to backend
   Frontend → Backend: POST /api/interview/audio (multipart)
   
3. Backend forwards to voice agent
   Backend → Voice Agent: POST /api/stt/transcribe
   
4. Voice agent transcribes
   Voice Agent → faster-whisper: Process audio
   
5. Transcription returned
   Voice Agent → Backend: { transcription: "..." }
   
6. Backend processes as text (steps 4-6 from text flow)
   
7. Backend requests TTS
   Backend → Voice Agent: POST /api/tts/synthesize
   
8. Voice agent generates audio
   Voice Agent → Piper: Synthesize speech
   
9. Audio file saved and URL returned
   Backend → Frontend: { transcription, message, audioUrl }
   
10. Frontend plays audio
    Frontend → AudioPlayer: Play response
```

### Evaluation Flow

```
1. User ends session or requests evaluation
   Frontend → Backend: GET /api/interview/evaluation/:sessionId
   
2. Backend retrieves all transcripts
   Backend → Database: SELECT * FROM transcripts
   
3. Backend builds evaluation prompt
   Backend → LLM Service: evaluateInterview(transcripts)
   
4. LLM analyzes conversation
   Backend → Ollama: Evaluation prompt
   
5. LLM returns structured feedback
   Ollama → Backend: { score, strengths, improvements, feedback }
   
6. Backend saves evaluation
   Backend → Database: INSERT INTO evaluations
   
7. Evaluation returned to frontend
   Backend → Frontend: JSON evaluation
   
8. Frontend displays feedback panel
```

## Communication Patterns

### HTTP REST API
- Request/response for most operations
- Stateless communication
- JSON payloads

### WebSocket (Socket.IO)
- Real-time updates during interview
- Session-based rooms
- Event-driven communication

### File Upload
- Multipart form data for audio
- Temporary storage on backend
- Forwarded to voice agent

## Security Considerations

**Current MVP (Single User):**
- No authentication required
- Local-only deployment
- Direct database access

**Future Multi-User:**
- JWT-based authentication
- OAuth integration
- Role-based access control
- Session validation
- Rate limiting

## Scalability Considerations

**Current Architecture:**
- Single SQLite database
- Local file storage
- Synchronous processing

**Future Enhancements:**
- PostgreSQL for multi-user
- Cloud storage (S3) for audio
- Message queue for async processing
- Load balancer for multiple backends
- Redis for session management
- Caching layer for common responses

## Performance Optimization

**Frontend:**
- Code splitting
- Lazy loading components
- Memoization of expensive computations
- Debounced API calls

**Backend:**
- Database indexing
- Connection pooling
- Response caching
- Async/await patterns

**Voice Agent:**
- Model loading optimization
- Audio chunk processing
- Concurrent request handling

## Monitoring and Logging

**Backend:**
- Winston logger
- Request/response logging
- Error tracking

**Voice Agent:**
- Flask logging
- Service health checks

**Frontend:**
- Console logging (development)
- Error boundaries

## Deployment Options

### Local Development
- Individual processes
- Start script for convenience
- Hot reload enabled

### Docker Compose
- Containerized services
- Orchestrated startup
- Volume mounting for development

### Production (Future)
- Kubernetes deployment
- Auto-scaling
- Load balancing
- Cloud-native storage
