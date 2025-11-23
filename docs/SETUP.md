# Setup Guide

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.9 or higher)
   - Download from: https://python.org/
   - Verify: `python --version`

3. **Ollama**
   - Download from: https://ollama.ai/
   - Verify: `ollama --version`

4. **FFmpeg** (for audio processing)
   - Windows: Download from https://ffmpeg.org/
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
   - Verify: `ffmpeg -version`

5. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### 1. Install Ollama and Download Mistral

```bash
# After installing Ollama, pull the Mistral model
ollama pull mistral

# Verify it's installed
ollama list
```

Start Ollama server:
```bash
ollama serve
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and configure as needed
# Ensure OLLAMA_URL points to your Ollama instance
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed
```

### 4. Setup Voice Agent

```bash
cd voice-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 5. Download Piper Voice Model

1. Visit: https://github.com/rhasspy/piper/releases
2. Download a voice model (recommended: `en_US-lessac-medium`)
3. Extract the `.onnx` and `.onnx.json` files
4. Place them in: `voice-agent/tts/voice_models/`
5. Update `voice-agent/.env`:
   ```
   PIPER_MODEL_PATH=./tts/voice_models/en_US-lessac-medium.onnx
   PIPER_CONFIG_PATH=./tts/voice_models/en_US-lessac-medium.onnx.json
   ```

### 6. Initialize Database

```bash
# From project root
node scripts/setup-db.js
```

This will:
- Create the SQLite database
- Run migrations
- Seed role templates

### 7. Verify Setup

**Check Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:5000
# Visit http://localhost:5000/health
```

**Check Voice Agent:**
```bash
cd voice-agent
python api/flask_app.py
# Should start on http://localhost:5001
# Visit http://localhost:5001/health
```

**Check Frontend:**
```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

## Running the Application

### Development Mode

**Option 1: Individual terminals**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Voice Agent):
```bash
cd voice-agent
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python api/flask_app.py
```

Terminal 3 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Start script (Windows)**
```bash
scripts\start-dev.bat
```

### Using Docker (Optional)

```bash
# Build and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Voice Agent: http://localhost:5001
```

## Configuration

### Backend Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_PATH=../data/database/interview.db
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
VOICE_AGENT_URL=http://localhost:5001
AUDIO_STORAGE_PATH=../data/audio
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_ENABLE_VOICE=true
```

### Voice Agent Environment Variables

```env
PORT=5001
FLASK_ENV=development
WHISPER_MODEL_SIZE=medium.en
PIPER_EXECUTABLE=piper
PIPER_MODEL_PATH=./tts/voice_models/en_US-lessac-medium.onnx
PIPER_CONFIG_PATH=./tts/voice_models/en_US-lessac-medium.onnx.json
```

## Troubleshooting

### Ollama Issues

**Problem:** Ollama not responding
**Solution:**
- Check if Ollama is running: `ollama serve`
- Verify model is downloaded: `ollama list`
- Check OLLAMA_URL in backend .env

### Voice Agent Issues

**Problem:** STT not working
**Solution:**
- Ensure FFmpeg is installed
- Check audio file format (should be WAV)
- Verify faster-whisper is installed: `pip list | grep faster-whisper`

**Problem:** TTS not working
**Solution:**
- Verify Piper model files exist in voice_models/
- Check file paths in .env
- Test Piper directly: `echo "Hello" | piper --model <path>`

### Database Issues

**Problem:** Database not found
**Solution:**
```bash
node scripts/setup-db.js
```

**Problem:** Tables not created
**Solution:**
- Delete `data/database/interview.db`
- Run setup script again

### Port Conflicts

**Problem:** Port already in use
**Solution:**
- Change ports in respective .env files
- Update VITE_API_URL in frontend if backend port changes

## Next Steps

After successful setup:

1. Open http://localhost:3000
2. Select an interview role
3. Choose voice or text mode
4. Start practicing!

## Additional Resources

- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Piper TTS](https://github.com/rhasspy/piper)
- [faster-whisper](https://github.com/guillaumekln/faster-whisper)
