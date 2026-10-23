'use client';

import React, { useState } from 'react';
import type { LyricSection } from '../types';

export interface LyricsViewerProps {
  lyrics: string;
  sections?: LyricSection[];
  className?: string;
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({
  lyrics,
  sections = [],
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!lyrics) return;
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!lyrics) {
    return (
      <div className={`vsg-lyrics-empty ${className}`}>
        <p>Chưa có lời bài hát (Lyrics). Bạn có thể thêm lời bài hát vào file markdown.</p>
      </div>
    );
  }

  // Phân loại màu cho từng loại thẻ Suno
  const getTagColorClass = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('chorus') || t.includes('điệp khúc')) return 'vsg-tag-chorus';
    if (t.includes('intro')) return 'vsg-tag-intro';
    if (t.includes('outro') || t.includes('fade')) return 'vsg-tag-outro';
    if (t.includes('bridge')) return 'vsg-tag-bridge';
    if (t.includes('solo') || t.includes('instrumental')) return 'vsg-tag-solo';
    return 'vsg-tag-verse';
  };

  return (
    <div className={`vsg-lyrics-container ${className}`}>
      <div className="vsg-lyrics-header">
        <div className="vsg-lyrics-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span>Lời bài hát & Metatags Suno</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`vsg-btn-copy ${copied ? 'copied' : ''}`}
          title="Sao chép toàn bộ lời bài hát để dán vào Suno"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Đã copy lời!</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Full Lyrics</span>
            </>
          )}
        </button>
      </div>

      <div className="vsg-lyrics-body">
        {sections && sections.length > 0 ? (
          sections.map((sec, idx) => (
            <div key={idx} className="vsg-lyrics-section">
              <span className={`vsg-lyrics-tag ${getTagColorClass(sec.tag)}`}>
                {sec.tag}
              </span>
              <div className="vsg-lyrics-text">
                {sec.content.split('\n').map((line, lIdx) => (
                  <p key={lIdx} className={line.startsWith('(') && line.endsWith(')') ? 'vsg-lyric-cue' : ''}>
                    {line || <span className="vsg-empty-line">&nbsp;</span>}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <pre className="vsg-lyrics-raw">{lyrics}</pre>
        )}
      </div>
    </div>
  );
};

