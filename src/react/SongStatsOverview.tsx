import React from 'react';
import type { SongStats } from '../types';

export interface SongStatsOverviewProps {
  stats: SongStats;
  className?: string;
}

export const SongStatsOverview: React.FC<SongStatsOverviewProps> = ({
  stats,
  className = '',
}) => {
  return (
    <div className={`vsg-stats-grid ${className}`}>
      <div className="vsg-stat-card">
        <div className="vsg-stat-icon vsg-icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div className="vsg-stat-info">
          <span className="vsg-stat-label">Tổng số bài hát</span>
          <span className="vsg-stat-value">{stats.total}</span>
        </div>
      </div>

      <div className="vsg-stat-card">
        <div className="vsg-stat-icon vsg-icon-red">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        </div>
        <div className="vsg-stat-info">
          <span className="vsg-stat-label">Đã lên YouTube</span>
          <span className="vsg-stat-value">{stats.published}</span>
        </div>
      </div>

      <div className="vsg-stat-card">
        <div className="vsg-stat-icon vsg-icon-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        </div>
        <div className="vsg-stat-info">
          <span className="vsg-stat-label">Đã có MP3</span>
          <span className="vsg-stat-value">{stats.mp3Ready}</span>
        </div>
      </div>

      <div className="vsg-stat-card">
        <div className="vsg-stat-icon vsg-icon-purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className="vsg-stat-info">
          <span className="vsg-stat-label">Tổng thời lượng</span>
          <span className="vsg-stat-value">{stats.totalDurationFormatted}</span>
        </div>
      </div>
    </div>
  );
};

