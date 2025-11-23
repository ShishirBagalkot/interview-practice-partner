from faster_whisper import WhisperModel
import os

class WhisperService:
    def __init__(self, model_size="medium.en"):
        """
        Initialize Faster Whisper model
        :param model_size: Model size (tiny, base, small, medium, large)
        """
        self.model_size = model_size
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the Whisper model"""
        print(f"Loading Whisper model: {self.model_size}")
        self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
        print("Whisper model loaded successfully")
    
    def transcribe(self, audio_path, language="en"):
        """
        Transcribe audio file to text
        :param audio_path: Path to audio file
        :param language: Language code (default: en)
        :return: Transcribed text
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        segments, info = self.model.transcribe(audio_path, language=language)
        
        # Combine all segments into full transcription
        transcription = " ".join([segment.text for segment in segments])
        
        return transcription.strip()
    
    def transcribe_with_timestamps(self, audio_path, language="en"):
        """
        Transcribe audio with timestamps
        :param audio_path: Path to audio file
        :param language: Language code
        :return: List of segments with timestamps
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        segments, info = self.model.transcribe(audio_path, language=language)
        
        result = []
        for segment in segments:
            result.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
        
        return result
