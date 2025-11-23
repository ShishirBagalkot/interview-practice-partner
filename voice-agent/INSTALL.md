# Voice Agent Installation Guide

## Quick Start (Development Mode)

The voice agent can run in **fallback mode** for development without installing Piper TTS. It will generate silent audio files but still work for testing the application flow.

### Step 1: Create Virtual Environment

```bash
cd voice-agent
python -m venv venv
```

### Step 2: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Copy Environment File

```bash
cp .env.example .env
```

### Step 5: Start the Service

```bash
python api/flask_app.py
```

The service will start on http://localhost:5001

---

## Optional: Install Piper TTS (for real voice synthesis)

### Windows

1. Download Piper from: https://github.com/rhasspy/piper/releases
2. Extract `piper.exe` to a folder (e.g., `C:\Tools\piper\`)
3. Add to PATH or update `.env`:
   ```
   PIPER_EXECUTABLE=C:\Tools\piper\piper.exe
   ```

### Download Voice Model

1. Visit: https://github.com/rhasspy/piper/releases
2. Download a voice (recommended: `en_US-lessac-medium`)
3. Extract `.onnx` and `.onnx.json` files to `tts/voice_models/`
4. Update `.env`:
   ```
   PIPER_MODEL_PATH=./tts/voice_models/en_US-lessac-medium.onnx
   PIPER_CONFIG_PATH=./tts/voice_models/en_US-lessac-medium.onnx.json
   ```

---

## Troubleshooting

### Error: No module named 'faster_whisper'

```bash
pip install faster-whisper
```

### Error: ffmpeg not found

**Windows:**
- Download from: https://ffmpeg.org/download.html
- Extract and add to PATH

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### Numpy compatibility issues

If you get numpy errors:
```bash
pip install --upgrade numpy
```

### Python version issues

Ensure you're using Python 3.9 or higher:
```bash
python --version
```

---

## Testing the Service

Once running, test with:

```bash
curl http://localhost:5001/health
```

Should return:
```json
{
  "status": "ok",
  "services": {
    "stt": true,
    "tts": true
  }
}
```

---

## Production Setup

For production, you should:
1. Install Piper TTS properly
2. Download appropriate voice models
3. Configure FFmpeg
4. Use gunicorn instead of Flask dev server:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 api.flask_app:app
   ```
