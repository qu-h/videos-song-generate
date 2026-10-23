'use client';

import React, { useState } from 'react';
import type { YouTubePublishInfo } from '../types';
import { getYouTubeEmbedUrl, extractYouTubeId } from '../core/youtube-helper';

export interface YouTubeEmbedProps {
  youtube: YouTubePublishInfo;
  className?: string;
  autoPlay?: boolean;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  youtube,
  className = '',
  autoPlay = false,
}) => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(autoPlay);
  const videoId = youtube.videoId || extractYouTubeId(youtube.publishedUrl);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : undefined;
  const targetUrl = youtube.publishedUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined);

  if (!videoId && !targetUrl) {
    return (
      <div className={`vsg-yt-empty ${className}`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
        <span>Chưa có link YouTube đã publish cho bài hát này. Hãy thêm <code>publishedUrl</code> vào file markdown sau khi đăng tải video.</span>
      </div>
    );
  }

  const thumbUrl =
    youtube.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined);

  return (
    <div className={`vsg-yt-card ${className}`}>
      <div className="vsg-yt-player-wrapper">
        {isIframeLoaded && embedUrl ? (
          <iframe
            src={`${embedUrl}&autoplay=1`}
            title={youtube.title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="vsg-yt-iframe"
          />
        ) : (
          <div
            className="vsg-yt-thumbnail-poster"
            style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : undefined }}
            onClick={() => setIsIframeLoaded(true)}
          >
            <div className="vsg-yt-play-overlay">
              <button
                type="button"
                className="vsg-yt-large-play-btn"
                aria-label="Phát video YouTube"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            </div>
            {youtube.isShort && <span className="vsg-badge-shorts">Shorts</span>}
          </div>
        )}
      </div>

      <div className="vsg-yt-info-bar">
        <div className="vsg-yt-meta">
          <div className="vsg-yt-title-row">
            <h4 className="vsg-yt-title">{youtube.title || 'Video YouTube'}</h4>
            <span className={`vsg-badge vsg-badge-${youtube.status === 'public' ? 'green' : 'slate'}`}>
              {youtube.status || 'public'}
            </span>
          </div>

          <div className="vsg-yt-stats-row">
            {youtube.publishedAt && (
              <span className="vsg-yt-date">
                📅 Đăng ngày: {new Date(youtube.publishedAt).toLocaleDateString('vi-VN')}
              </span>
            )}
            {typeof youtube.views === 'number' && (
              <span className="vsg-yt-views">
                👁️ {youtube.views.toLocaleString('vi-VN')} lượt xem
              </span>
            )}
            {videoId && <span className="vsg-yt-id">ID: <code>{videoId}</code></span>}
          </div>
        </div>

        {targetUrl && (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vsg-yt-open-link"
          >
            <span>Mở trên YouTube</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>

      {youtube.description && (
        <div className="vsg-yt-desc">
          <p>{youtube.description}</p>
        </div>
      )}
    </div>
  );
};

