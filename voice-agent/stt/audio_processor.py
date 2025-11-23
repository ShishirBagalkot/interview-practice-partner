import os
from pydub import AudioSegment
from pydub.effects import normalize

class AudioProcessor:
    @staticmethod
    def convert_to_wav(input_path, output_path=None):
        """
        Convert audio file to WAV format
        :param input_path: Input audio file path
        :param output_path: Output WAV file path (optional)
        :return: Path to WAV file
        """
        if output_path is None:
            base = os.path.splitext(input_path)[0]
            output_path = f"{base}.wav"
        
        audio = AudioSegment.from_file(input_path)
        audio.export(output_path, format="wav")
        
        return output_path
    
    @staticmethod
    def normalize_audio(input_path, output_path=None):
        """
        Normalize audio volume
        :param input_path: Input audio file path
        :param output_path: Output file path (optional)
        :return: Path to normalized audio
        """
        if output_path is None:
            output_path = input_path
        
        audio = AudioSegment.from_file(input_path)
        normalized = normalize(audio)
        normalized.export(output_path, format="wav")
        
        return output_path
    
    @staticmethod
    def get_audio_duration(audio_path):
        """
        Get audio duration in seconds
        :param audio_path: Path to audio file
        :return: Duration in seconds
        """
        audio = AudioSegment.from_file(audio_path)
        return len(audio) / 1000.0
    
    @staticmethod
    def trim_silence(audio_path, output_path=None, silence_thresh=-40):
        """
        Remove silence from beginning and end of audio
        :param audio_path: Input audio file path
        :param output_path: Output file path (optional)
        :param silence_thresh: Silence threshold in dB
        :return: Path to trimmed audio
        """
        if output_path is None:
            output_path = audio_path
        
        audio = AudioSegment.from_file(audio_path)
        
        # Detect non-silent chunks
        from pydub.silence import detect_nonsilent
        nonsilent_ranges = detect_nonsilent(audio, min_silence_len=100, silence_thresh=silence_thresh)
        
        if nonsilent_ranges:
            start = nonsilent_ranges[0][0]
            end = nonsilent_ranges[-1][1]
            trimmed = audio[start:end]
            trimmed.export(output_path, format="wav")
        
        return output_path
