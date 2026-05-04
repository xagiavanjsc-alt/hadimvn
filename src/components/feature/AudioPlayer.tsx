import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  onEnd?: () => void;
  autoPlay?: boolean;
  showSpeedControl?: boolean;
  showDownload?: boolean;
}

export function AudioPlayer({
  src,
  onEnd,
  autoPlay = false,
  showSpeedControl = true,
  showDownload = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play();
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-app-card/50 rounded-xl p-3 border border-app-border">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onEnd?.();
        }}
      />

      {/* Progress Bar */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-accent-primary"
        />
        <div className="flex justify-between text-xs text-app-text-muted mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-app-accent-primary text-black flex items-center justify-center hover:bg-[#d4b43a] transition-colors"
          >
            <i className={`ri-${isPlaying ? "pause" : "play"}-fill text-lg`} />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <i className="ri-volume-up-line text-app-text-muted" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-accent-primary"
            />
          </div>
        </div>

        {/* Speed Control */}
        {showSpeedControl && (
          <div className="flex items-center gap-1">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  speed === s
                    ? "bg-app-accent-primary text-black"
                    : "bg-app-card/50 text-app-text-muted hover:bg-app-card"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}

        {/* Download */}
        {showDownload && (
          <a
            href={src}
            download
            className="w-10 h-10 rounded-full bg-app-card/50 text-app-text-muted flex items-center justify-center hover:bg-app-card transition-colors"
          >
            <i className="ri-download-line text-lg" />
          </a>
        )}
      </div>
    </div>
  );
}
