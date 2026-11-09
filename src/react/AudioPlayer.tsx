'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { SunoAudioInfo } from '../types';
import { formatSecondsToDuration } from '../core/youtube-helper';

interface WaveformBin {
  peak: number;
  rms: number;
}

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds || 0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<WaveformBin[]>([]);

  const localAudioSrc = audio.filePath
    ? `/${audio.filePath.replace(/^public\//, '').split('/').map(encodeURIComponent).join('/')}`
    : undefined;
  const audioSrc = localAudioSrc || audio.audioUrl;

  useEffect(() => {
    if (!audioSrc || typeof window === 'undefined') return;
    let cancelled = false;
    let decodeContext: AudioContext | null = null;
    const closeDecodeContext = () => {
      if (decodeContext && decodeContext.state !== 'closed') void decodeContext.close();
    };
    setWaveformData([]);

    const loadWaveform = async () => {
      try {
        const response = await fetch(audioSrc);
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        const audioBuffer = await response.arrayBuffer();
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        decodeContext = new AudioContextClass();
        const decoded = await decodeContext.decodeAudioData(audioBuffer);
        const channel = decoded.getChannelData(0);
        const binsPerSecond = 10;
        const binCount = Math.ceil(decoded.duration * binsPerSecond);
        const samplesPerBin = Math.round(decoded.sampleRate / binsPerSecond);
        const peaks = Array.from({ length: binCount }, (_, bin) => {
          const start = bin * samplesPerBin;
          const end = Math.min(channel.length, start + samplesPerBin);
          let peak = 0;
          let squareSum = 0;
          for (let i = start; i < end; i += 1) {
            const amplitude = Math.abs(channel[i]);
            peak = Math.max(peak, amplitude);
            squareSum += amplitude * amplitude;
          }
          const sampleCount = Math.max(1, end - start);
          return { peak, rms: Math.sqrt(squareSum / sampleCount) };
        });
        if (!cancelled) setWaveformData(peaks);
      } catch {
        // Keep the generated fallback waveform if decoding is unavailable (for example, a CDN without CORS).
      } finally {
        closeDecodeContext();
      }
    };

    void loadWaveform();
    return () => { cancelled = true; closeDecodeContext(); };
  }, [audioSrc]);

  const normalizedWaveform = useMemo(() => {
    if (!waveformData.length) return [];
    const levels = waveformData.map((point) => point.rms * 0.75 + point.peak * 0.25).sort((a, b) => a - b);
    const floor = levels[Math.floor((levels.length - 1) * 0.08)] || 0;
    const ceiling = levels[Math.floor((levels.length - 1) * 0.94)] || 1;
    const range = Math.max(ceiling - floor, 0.0001);
    return waveformData.map((point) => {
      const level = point.rms * 0.75 + point.peak * 0.25;
      return Math.max(0, Math.min(1, (level - floor) / range));
    });
  }, [waveformData]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      currentTimeRef.current = el.currentTime;
      setCurrentTime(el.currentTime);
    };
    const onLoadedMetadata = () => {
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);
    el.addEventListener('pause', onPause);
    el.addEventListener('play', onPlay);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('play', onPlay);
    };
  }, [audioSrc]);

  useEffect(() => {
    let frame = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      const pixelsPerSecond = 24;
      const binsPerSecond = 10;
      const playheadX = 156;
      const centerY = 51;
      const barWidth = 1.6;
      const playbackTime = audioRef.current?.currentTime ?? currentTimeRef.current;
      currentTimeRef.current = playbackTime;

      context.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.textAlign = 'center';
      const firstVisibleBin = Math.max(0, Math.floor((playbackTime - (playheadX + pixelsPerSecond) / pixelsPerSecond) * binsPerSecond));
      const lastVisibleBin = Math.min(waveformData.length, Math.ceil((playbackTime + (width - playheadX + pixelsPerSecond) / pixelsPerSecond) * binsPerSecond));
      for (let bin = firstVisibleBin; bin < lastVisibleBin; bin += 1) {
        const binTime = bin / binsPerSecond;
        const x = playheadX + (binTime - playbackTime) * pixelsPerSecond;
        const normalized = normalizedWaveform[bin] || 0;
        const quiet = normalized < 0.08;
        const climax = normalized > 0.82;
        const amplitude = Math.pow(normalized, 1.15);
        const barHeight = quiet ? 3 : 5 + amplitude * 43;
        const played = binTime < playbackTime;

        if (bin % (binsPerSecond * 5) === 0) {
          context.strokeStyle = 'rgba(148,163,184,.34)';
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x, 18);
          context.lineTo(x, 82);
          context.stroke();
          context.fillStyle = 'rgba(148,163,184,.76)';
          context.fillText(formatSecondsToDuration(binTime), x, 12);
        }

        const gradient = context.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (quiet) {
          gradient.addColorStop(0, '#64748b');
          gradient.addColorStop(1, '#334155');
        } else if (climax) {
          gradient.addColorStop(0, '#f0abfc');
          gradient.addColorStop(1, '#a855f7');
        } else {
          gradient.addColorStop(0, '#c4b5fd');
          gradient.addColorStop(1, '#7c3aed');
        }
        context.fillStyle = gradient;
        context.globalAlpha = played ? 1 : 0.72;
        if (climax && isPlaying && played) {
          context.shadowColor = '#c084fc';
          context.shadowBlur = 10;
        }
        context.beginPath();
        context.roundRect(x - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight, 1);
        context.fill();
        context.shadowBlur = 0;
      }

      context.globalAlpha = 1;
      context.strokeStyle = 'rgba(216,180,254,.92)';
      context.shadowColor = '#a855f7';
      context.shadowBlur = 10;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(playheadX, 17);
      context.lineTo(playheadX, 84);
      context.stroke();
      context.shadowBlur = 0;
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [waveformData, normalizedWaveform]);

  const getLongestSection = (matches: (level: number) => boolean) => {
    if (!normalizedWaveform.length) return null;
    let bestStart = -1;
    let bestLength = 0;
    let start = -1;
    normalizedWaveform.forEach((level, second) => {
      if (matches(level)) {
        if (start < 0) start = second;
      } else if (start >= 0) {
        if (second - start > bestLength) { bestStart = start; bestLength = second - start; }
        start = -1;
      }
    });
    if (start >= 0 && waveformData.length - start > bestLength) {
      bestStart = start;
      bestLength = waveformData.length - start;
    }
    const minimumSectionBins = 10;
    return bestLength >= minimumSectionBins
      ? { start: bestStart / 10, end: (bestStart + bestLength) / 10 }
      : null;
  };

  const climaxSection = getLongestSection((level) => level > 0.82)
    || (normalizedWaveform.length ? (() => {
      const maxIndex = normalizedWaveform.reduce((best, level, index, levels) => level > levels[best] ? index : best, 0);
      return { start: maxIndex / 10, end: Math.min(waveformData.length, maxIndex + 10) / 10 };
    })() : null);
  const quietSection = getLongestSection((level) => level < 0.08);

  const handleWaveformClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const player = audioRef.current;
    if (!canvas || !player || waveformData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const target = Math.max(0, Math.min(duration, currentTimeRef.current + (clickX - 156) / 24));
    player.currentTime = target;
    currentTimeRef.current = target;
    setCurrentTime(target);
  };

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
    currentTimeRef.current = targetTime;
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
    <div className={`vsg-audio-player ${isPlaying ? 'is-playing' : ''} ${className}`}>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        autoPlay={autoPlay}
      />

      <div className="vsg-audio-visualizer" aria-label={isPlaying ? 'Phổ âm thanh đang phát' : 'Phổ âm thanh'}>
        <div className="vsg-audio-artwork" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none"><path d="M29 8v23.5a7 7 0 1 1-4-6.32V14l17-4v17.5a7 7 0 1 1-4-6.32V6l-9 2Z" fill="currentColor"/></svg>
        </div>
        <div className="vsg-audio-visualizer-content">
          <div className="vsg-audio-status"><span className="vsg-audio-live-dot" />{isPlaying ? 'ĐANG PHÁT' : 'SẴN SÀNG PHÁT'}<span className="vsg-audio-analyzer-label">MỖI VẠCH = 100 MS</span></div>
          <canvas
            ref={canvasRef}
            className="vsg-audio-waveform"
            width={720}
            height={96}
            onClick={handleWaveformClick}
            role="img"
            aria-label="Waveform theo từng giây, bấm để tua"
          />
          <div className="vsg-audio-insights" aria-live="polite">
            <span className="vsg-audio-insight vsg-insight-climax"><i />{climaxSection ? `Cao trào ${formatSecondsToDuration(climaxSection.start)}–${formatSecondsToDuration(climaxSection.end)}` : 'Cao trào: đang phân tích'}</span>
            <span className="vsg-audio-insight vsg-insight-quiet"><i />{quietSection ? `Yên lặng ${formatSecondsToDuration(quietSection.start)}–${formatSecondsToDuration(quietSection.end)}` : 'Không có đoạn lặng dài'}</span>
          </div>
        </div>
      </div>

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
                {formatSecondsToDuration(duration)}
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

