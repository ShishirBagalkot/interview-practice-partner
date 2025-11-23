from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from stt.whisper_service import WhisperService
from stt.audio_processor import AudioProcessor
from tts.piper_service import PiperService

app = Flask(__name__)
CORS(app)

# Initialize services
whisper_service = None
piper_service = None

def init_services():
    global whisper_service, piper_service
    
    # Initialize Whisper STT
    model_size = os.getenv('WHISPER_MODEL_SIZE', 'medium.en')
    whisper_service = WhisperService(model_size=model_size)
    
    # Initialize Piper TTS
    piper_service = PiperService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'services': {
            'stt': whisper_service is not None,
            'tts': piper_service is not None
        }
    })

@app.route('/api/stt/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save temporary file
        temp_path = os.path.join('/tmp', audio_file.filename)
        audio_file.save(temp_path)
        
        # Transcribe
        transcription = whisper_service.transcribe(temp_path)
        
        # Clean up
        os.remove(temp_path)
        
        return jsonify({'transcription': transcription})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.get_json()
        
        if 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        speaker_id = data.get('speaker_id', 0)
        
        # Generate audio bytes
        audio_bytes = piper_service.synthesize_to_bytes(text, speaker_id)
        
        # Return audio file
        import io
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype='audio/wav',
            as_attachment=False
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_services()
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
