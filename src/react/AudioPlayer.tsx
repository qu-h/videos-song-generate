'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { SunoAudioInfo } from '../types';
import { formatSecondsToDuration } from '../core/youtube-helper';

export interface AudioPlayerProps {
  audio: SunoAudioInfo;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  title,
  autoPlay = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds || 0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const audioSrc = audio.audioUrl || (audio.filePath ? `/${audio.filePath}` : undefined);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => {
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio play error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  if (!audioSrc) {
    return (
      <div className={`vsg-audio-empty ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Chưa có file hoặc link MP3 cho bài hát này. Hãy thêm <code>audioUrl</code> hoặc <code>filePath</code> vào file markdown.</span>
      </div>
    );
  }

  return (
    <div className={`vsg-audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        autoPlay={autoPlay}
      />

      <div className="vsg-audio-main-row">
        <button
          type="button"
          onClick={togglePlay}
          className="vsg-audio-play-btn"
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>

        <div className="vsg-audio-track-info">
          <div className="vsg-audio-title-line">
            <span className="vsg-audio-track-name">{title || audio.fileName || 'Suno Audio Track'}</span>
            {audio.takeVersion && (
              <span className="vsg-badge vsg-badge-blue">{audio.takeVersion}</span>
            )}
            {audio.bitrate && (
              <span className="vsg-badge vsg-badge-slate">{audio.bitrate}</span>
            )}
          </div>

          <div className="vsg-audio-slider-container">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="vsg-audio-seek-slider"
            />
            <div className="vsg-audio-time-row">
              <span className="vsg-time-current">{formatSecondsToDuration(currentTime)}</span>
              <span className="vsg-time-duration">
                {audio.duration || formatSecondsToDuration(duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="vsg-audio-controls-right">
          <button
            type="button"
            onClick={toggleMute}
            className="vsg-btn-icon"
            title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="vsg-audio-vol-slider"
            title="Âm lượng"
          />

          <a
            href={audioSrc}
            download={audio.fileName || 'suno-song.mp3'}
            target="_blank"
            rel="noopener noreferrer"
            className="vsg-btn-icon"
            title="Tải MP3 về máy"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

