import React, { useRef, useState } from 'react';

const AudioPlayer = ({ src, className = '' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setIsPlaying(false)}
      />
      <button onClick={togglePlay}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
    </div>
  );
};

export default AudioPlayer;
