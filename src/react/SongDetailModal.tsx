'use client';

import React, { useState, useEffect } from 'react';
import type { SongItem } from '../types';
import { PromptBox } from './PromptBox';
import { AudioPlayer } from './AudioPlayer';
import { YouTubeEmbed } from './YouTubeEmbed';
import { LyricsViewer } from './LyricsViewer';
import { formatSongToMarkdown } from '../core/markdown-parser';

export interface SongDetailModalProps {
  song: SongItem | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export type ModalTab = 'suno' | 'lyrics' | 'mp3' | 'youtube' | 'markdown';

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  isOpen,
  onClose,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('suno');
  const [copiedMd, setCopiedMd] = useState(false);

  useEffect(() => {
    // Esc để đóng modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !song) return null;

  const rawMarkdownContent = song.rawMarkdown || formatSongToMarkdown(song);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className={`vsg-modal-backdrop ${className}`} onClick={onClose}>
      <div
        className="vsg-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="vsg-modal-header">
          <div className="vsg-modal-title-box">
            <div className="vsg-modal-badges">
              <span className="vsg-badge vsg-badge-blue">{song.genre || 'Music'}</span>
              <span className="vsg-badge vsg-badge-purple">Suno {song.suno.model || 'v3.5'}</span>
              {song.status === 'published' && (
                <span className="vsg-badge vsg-badge-red">YouTube Published</span>
              )}
              {song.status === 'mp3_ready' && (
                <span className="vsg-badge vsg-badge-green">MP3 Ready</span>
              )}
            </div>
            <h2 className="vsg-modal-title">{song.title}</h2>
            <p className="vsg-modal-subtitle">
              Sáng tác: <strong>{song.artist || 'Suno AI & Quan'}</strong> • Ngày tạo: {song.createdAt}
              {song.filePath && <span> • File: <code>{song.filePath}</code></span>}
            </p>
          </div>

          <button
            type="button"
            className="vsg-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="vsg-modal-nav">
          <button
            type="button"
            className={`vsg-tab-btn ${activeTab === 'suno' ? 'active' : ''}`}
            onClick={() => setActiveTab('suno')}
          >
            <span className="vsg-tab-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </span>
            <span>Suno Prompt</span>
          </button>

          <button
            type="button"
            className={`vsg-tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            <span className="vsg-tab-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            </span>
            <span>Lời bài hát</span>
          </button>

          <button
            type="button"
            className={`vsg-tab-btn ${activeTab === 'mp3' ? 'active' : ''}`}
            onClick={() => setActiveTab('mp3')}
          >
            <span className="vsg-tab-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </span>
            <span>File MP3 Suno</span>
            {(song.audio.audioUrl || song.audio.filePath) && (
              <span className="vsg-tab-dot green" />
            )}
          </button>

          <button
            type="button"
            className={`vsg-tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
            onClick={() => setActiveTab('youtube')}
          >
            <span className="vsg-tab-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0f172a"></polygon>
              </svg>
            </span>
            <span>YouTube Video</span>
            {song.youtube.publishedUrl && <span className="vsg-tab-dot red" />}
          </button>

          <button
            type="button"
            className={`vsg-tab-btn ${activeTab === 'markdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('markdown')}
          >
            <span className="vsg-tab-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </span>
            <span>Markdown File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="vsg-modal-body">
          {/* TAB 1: SUNO PROMPT */}
          {activeTab === 'suno' && (
            <div className="vsg-tab-content">
              <div className="vsg-section-desc">
                Nội dung Style Prompt và tham số đã gửi lên Suno AI để sinh ra bài hát này:
              </div>

              <PromptBox suno={song.suno} />

              <div className="vsg-info-grid">
                <div className="vsg-info-cell">
                  <span className="vsg-cell-label">Mô hình Suno</span>
                  <span className="vsg-cell-val">Suno {song.suno.model || 'v3.5'}</span>
                </div>
                <div className="vsg-info-cell">
                  <span className="vsg-cell-label">Nhịp điệu (Tempo)</span>
                  <span className="vsg-cell-val">{song.suno.tempo || 'Mặc định'}</span>
                </div>
                <div className="vsg-info-cell">
                  <span className="vsg-cell-label">Giọng ca (Vocal)</span>
                  <span className="vsg-cell-val">{song.suno.vocalType || 'Mặc định'}</span>
                </div>
                <div className="vsg-info-cell">
                  <span className="vsg-cell-label">Trạng thái Suno</span>
                  <span className="vsg-cell-val">{song.suno.taskStatus || 'completed'}</span>
                </div>
              </div>

              {song.tags && song.tags.length > 0 && (
                <div className="vsg-tags-section">
                  <span className="vsg-tags-title">Tags bài hát:</span>
                  <div className="vsg-tags-list">
                    {song.tags.map((t, idx) => (
                      <span key={idx} className="vsg-tag-badge">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {song.productionNotes && (
                <div className="vsg-notes-box">
                  <h4 className="vsg-notes-title">📌 Ghi chú sản xuất:</h4>
                  <p>{song.productionNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LYRICS */}
          {activeTab === 'lyrics' && (
            <div className="vsg-tab-content">
              <LyricsViewer lyrics={song.lyrics} sections={song.lyricsSections} />
            </div>
          )}

          {/* TAB 3: MP3 AUDIO */}
          {activeTab === 'mp3' && (
            <div className="vsg-tab-content">
              <div className="vsg-section-desc">
                Nghe và quản lý file âm thanh MP3 xuất ra từ Suno AI:
              </div>

              <AudioPlayer audio={song.audio} title={song.title} />

              <div className="vsg-audio-specs-card">
                <h4 className="vsg-specs-title">Thông tin file âm thanh:</h4>
                <div className="vsg-specs-list">
                  <div className="vsg-spec-item">
                    <span className="vsg-spec-key">Tên file lưu:</span>
                    <span className="vsg-spec-val">{song.audio.fileName || `${song.slug}.mp3`}</span>
                  </div>
                  <div className="vsg-spec-item">
                    <span className="vsg-spec-key">Đường dẫn nội bộ:</span>
                    <span className="vsg-spec-val">{song.audio.filePath || 'Chưa lưu local'}</span>
                  </div>
                  <div className="vsg-spec-item">
                    <span className="vsg-spec-key">Thời lượng:</span>
                    <span className="vsg-spec-val">{song.audio.duration || 'N/A'}</span>
                  </div>
                  <div className="vsg-spec-item">
                    <span className="vsg-spec-key">Chất lượng Bitrate:</span>
                    <span className="vsg-spec-val">{song.audio.bitrate || '192kbps'}</span>
                  </div>
                  <div className="vsg-spec-item">
                    <span className="vsg-spec-key">Phiên bản tạo:</span>
                    <span className="vsg-spec-val">{song.audio.takeVersion || 'Bản chính thức'}</span>
                  </div>
                  {song.audio.audioUrl && (
                    <div className="vsg-spec-item full">
                      <span className="vsg-spec-key">Suno Audio CDN Link:</span>
                      <a
                        href={song.audio.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vsg-spec-link"
                      >
                        {song.audio.audioUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: YOUTUBE */}
          {activeTab === 'youtube' && (
            <div className="vsg-tab-content">
              <div className="vsg-section-desc">
                Video bài hát đã dựng và publish lên kênh YouTube:
              </div>

              <YouTubeEmbed youtube={song.youtube} />
            </div>
          )}

          {/* TAB 5: MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="vsg-tab-content">
              <div className="vsg-markdown-header">
                <span className="vsg-section-desc">
                  Nội dung file Markdown gốc quản lý trên source code (<code>{song.filePath || `data/songs/${song.slug}.md`}</code>):
                </span>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className={`vsg-btn-copy ${copiedMd ? 'copied' : ''}`}
                >
                  {copiedMd ? '✓ Đã copy Markdown!' : 'Copy Toàn bộ Markdown'}
                </button>
              </div>

              <pre className="vsg-raw-md-view">
                <code>{rawMarkdownContent}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="vsg-modal-footer">
          <div className="vsg-modal-footer-left">
            <span>Slug: <code>{song.slug}</code></span>
          </div>
          <button type="button" className="vsg-btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

