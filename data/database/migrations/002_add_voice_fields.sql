-- Add fields for voice-specific features

-- Add language preference to sessions
ALTER TABLE sessions ADD COLUMN language TEXT DEFAULT 'en';

-- Add audio metadata to transcripts
ALTER TABLE transcripts ADD COLUMN audio_duration REAL;
ALTER TABLE transcripts ADD COLUMN audio_format TEXT DEFAULT 'wav';
