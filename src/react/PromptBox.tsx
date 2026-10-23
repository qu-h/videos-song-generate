'use client';

import React, { useState } from 'react';
import type { SunoPromptInfo } from '../types';

export interface PromptBoxProps {
  suno: SunoPromptInfo;
  className?: string;
}

export const PromptBox: React.FC<PromptBoxProps> = ({ suno, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!suno.stylePrompt) return;
    navigator.clipboard.writeText(suno.stylePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`vsg-prompt-box ${className}`}>
      <div className="vsg-prompt-header">
        <div className="vsg-prompt-meta">
          <span className="vsg-badge vsg-badge-purple">Suno {suno.model || 'v3.5'}</span>
          {suno.tempo && <span className="vsg-badge vsg-badge-slate">{suno.tempo}</span>}
          {suno.vocalType && (
            <span className="vsg-badge vsg-badge-slate">Vocal: {suno.vocalType}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`vsg-btn-copy ${copied ? 'copied' : ''}`}
          title="Sao chép style prompt cho Suno"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Đã copy!</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Style Prompt</span>
            </>
          )}
        </button>
      </div>

      <div className="vsg-prompt-content">
        <code>{suno.stylePrompt || '(Chưa cấu hình style prompt)'}</code>
      </div>

      {suno.lyricsPrompt && (
        <div className="vsg-prompt-lyrics-sub">
          <span className="vsg-label">Prompt tạo lời:</span> {suno.lyricsPrompt}
        </div>
      )}

      {suno.clipId && (
        <div className="vsg-prompt-footer">
          <span className="vsg-clip-id">Clip ID: <code>{suno.clipId}</code></span>
          {suno.songUrl && (
            <a
              href={suno.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="vsg-suno-link"
            >
              Mở trên Suno.com &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
};

