import os
import subprocess
import wave
import tempfile

class PiperService:
    def __init__(self, model_path=None, config_path=None):
        """
        Initialize Piper TTS service
        Note: Piper must be installed separately from https://github.com/rhasspy/piper/releases
        :param model_path: Path to Piper model file (.onnx)
        :param config_path: Path to model config file (.json)
        """
        self.model_path = model_path or os.getenv('PIPER_MODEL_PATH')
        self.config_path = config_path or os.getenv('PIPER_CONFIG_PATH')
        self.piper_executable = os.getenv('PIPER_EXECUTABLE', 'piper')
        
        # For development without Piper, we can use a fallback
        self.use_fallback = not self._check_piper_available()
        if self.use_fallback:
            print("WARNING: Piper not found. Using fallback TTS (silent audio)")
    
    def _check_piper_available(self):
        """Check if Piper is available"""
        try:
            result = subprocess.run(
                [self.piper_executable, '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    def _generate_fallback_audio(self, output_path):
        """Generate a silent WAV file as fallback"""
        import wave
        import struct
        
        sample_rate = 22050
        duration = 1  # 1 second of silence
        num_samples = sample_rate * duration
        
        with wave.open(output_path, 'w') as wav_file:
            wav_file.setnchannels(1)  # mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            
            # Write silence
            for _ in range(num_samples):
                wav_file.writeframes(struct.pack('h', 0))
        
        return output_path
    
    def synthesize(self, text, output_path, speaker_id=0):
        """
        Synthesize speech from text using Piper
        :param text: Text to synthesize
        :param output_path: Output audio file path
        :param speaker_id: Speaker ID for multi-speaker models
        :return: Path to generated audio file
        """
        # Use fallback if Piper not available
        if self.use_fallback:
            print(f"Fallback TTS for: {text}")
            return self._generate_fallback_audio(output_path)
        
        try:
            # Prepare command
            cmd = [
                self.piper_executable,
                '--model', self.model_path,
                '--output_file', output_path
            ]
            
            if self.config_path:
                cmd.extend(['--config', self.config_path])
            
            if speaker_id > 0:
                cmd.extend(['--speaker', str(speaker_id)])
            
            # Run Piper
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(input=text)
            
            if process.returncode != 0:
                raise RuntimeError(f"Piper TTS failed: {stderr}")
            
            return output_path
        
        except Exception as e:
            raise RuntimeError(f"Error synthesizing speech: {str(e)}")
    
    def synthesize_to_bytes(self, text, speaker_id=0):
        """
        Synthesize speech and return audio bytes
        :param text: Text to synthesize
        :param speaker_id: Speaker ID
        :return: Audio bytes
        """
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            output_path = tmp_file.name
        
        try:
            self.synthesize(text, output_path, speaker_id)
            
            with open(output_path, 'rb') as f:
                audio_bytes = f.read()
            
            return audio_bytes
        
        finally:
            if os.path.exists(output_path):
                os.remove(output_path)
    
    def get_available_speakers(self):
        """
        Get list of available speakers for multi-speaker models
        :return: List of speaker IDs
        """
        # This would depend on the specific model configuration
        # For now, return a default single speaker
        return [0]
