import wave
import struct

def validate_audio_format(audio_path):
    """
    Validate audio file format
    :param audio_path: Path to audio file
    :return: Dictionary with audio properties
    """
    try:
        with wave.open(audio_path, 'rb') as wav_file:
            return {
                'channels': wav_file.getnchannels(),
                'sample_width': wav_file.getsampwidth(),
                'frame_rate': wav_file.getframerate(),
                'frames': wav_file.getnframes(),
                'duration': wav_file.getnframes() / wav_file.getframerate()
            }
    except Exception as e:
        raise ValueError(f"Invalid audio file: {str(e)}")

def convert_sample_rate(input_path, output_path, target_rate=16000):
    """
    Convert audio sample rate
    :param input_path: Input audio file
    :param output_path: Output audio file
    :param target_rate: Target sample rate (default: 16000 Hz)
    """
    from pydub import AudioSegment
    
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(target_rate)
    audio.export(output_path, format='wav')
    
    return output_path
