'use client';

import React from 'react';
import type { SongItem } from '../types';

export interface SongCardProps {
  song: SongItem;
  isPlaying?: boolean;
  onPlayToggle?: (song: SongItem) => void;
  onSelect: (song: SongItem) => void;
  className?: string;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isPlaying = false,
  onPlayToggle,
  onSelect,
  className = '',
}) => {
  const hasAudio = Boolean(song.audio.audioUrl || song.audio.filePath);
  const hasYouTube = Boolean(song.youtube.publishedUrl || song.youtube.videoId);
  const thumbUrl = song.youtube.thumbnailUrl;

  const getStatusBadge = () => {
    switch (song.status) {
      case 'published':
        return <span className="vsg-badge vsg-badge-red">YouTube Published</span>;
      case 'mp3_ready':
        return <span className="vsg-badge vsg-badge-green">MP3 Ready</span>;
      case 'suno_generated':
        return <span className="vsg-badge vsg-badge-purple">Suno Created</span>;
      case 'prompt_ready':
        return <span className="vsg-badge vsg-badge-blue">Prompt Ready</span>;
      default:
        return <span className="vsg-badge vsg-badge-slate">Draft</span>;
    }
  };

  return (
    <div className={`vsg-song-card ${isPlaying ? 'is-playing' : ''} ${className}`}>
      {/* Artwork Header */}
      <div className="vsg-card-artwork" onClick={() => onSelect(song)}>
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={song.title}
            className="vsg-card-img"
            loading="lazy"
          />
        ) : (
          <div className="vsg-card-artwork-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
        )}

        <div className="vsg-card-status-pill">{getStatusBadge()}</div>

        {song.audio.duration && (
          <span className="vsg-card-duration-badge">{song.audio.duration}</span>
        )}

        {/* Play button overlay */}
        {hasAudio && (
          <button
            type="button"
            className="vsg-card-play-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle?.(song);
            }}
            aria-label={isPlaying ? 'Dừng phát' : 'Phát nhanh MP3'}
            title={isPlaying ? 'Dừng phát' : 'Nghe thử bản thu MP3'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                <rect x="14" y="4" width="4" height="16" rx="1"></rect>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="vsg-card-content">
        <div className="vsg-card-meta-top">
          <span className="vsg-card-genre">{song.genre || 'Music'}</span>
          <span className="vsg-card-model">Suno {song.suno.model || 'v3.5'}</span>
        </div>

        <h3 className="vsg-card-title" onClick={() => onSelect(song)} title={song.title}>
          {song.title}
        </h3>

        <p className="vsg-card-artist">{song.artist || 'Suno AI'}</p>

        <p className="vsg-card-prompt-snip" title={song.suno.stylePrompt}>
          <strong>Style:</strong> {song.suno.stylePrompt}
        </p>

        {/* Tags */}
        {song.tags && song.tags.length > 0 && (
          <div className="vsg-card-tags">
            {song.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="vsg-tag-chip">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
            {song.tags.length > 3 && (
              <span className="vsg-tag-more">+{song.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="vsg-card-footer">
          <button
            type="button"
            className="vsg-btn-detail"
            onClick={() => onSelect(song)}
          >
            Chi tiết &rarr;
          </button>

          <div className="vsg-card-badges-row">
            {hasAudio && (
              <span className="vsg-mini-pill vsg-pill-audio" title="Có file MP3 Suno">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                </svg>
                <span>MP3</span>
              </span>
            )}
            {hasYouTube && (
              <a
                href={song.youtube.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vsg-mini-pill vsg-pill-yt"
                title="Xem trên YouTube"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>YouTube</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

