'use client';

import React, { useState, useMemo } from 'react';
import type { SongItem, SongStatus, SongFilterOptions } from '../types';
import { SONGS_LIST } from '../data';
import { filterSongs, getAvailableGenres } from '../core/song-filter';
import { calculateSongStats } from '../core/song-stats';
import { SongStatsOverview } from './SongStatsOverview';
import { SongCard } from './SongCard';
import { SongDetailModal } from './SongDetailModal';
import { AudioPlayer } from './AudioPlayer';

export interface SongManagerProps {
  initialSongs?: SongItem[];
  title?: string;
  description?: string;
  className?: string;
  glassPreset?: 'aurora' | 'frost';
  glassScenery?: 'northwest' | 'ha-long' | 'tuan-chau' | 'phu-quoc' | 'hai-van';
}

export const SongManager: React.FC<SongManagerProps> = ({
  initialSongs = SONGS_LIST,
  title = 'Quản lý Bài hát Suno AI & YouTube',
  description = 'Quản lý tập trung Prompt Suno, File MP3 âm thanh, Link YouTube đã publish và lời bài hát dạng Markdown trên source code.',
  className = '',
  glassPreset = 'aurora',
  glassScenery = 'northwest',
}) => {
  const [songs] = useState<SongItem[]>(initialSongs);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SongStatus | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [filterMp3Only, setFilterMp3Only] = useState<boolean>(false);
  const [filterYoutubeOnly, setFilterYoutubeOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'duration'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal State
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global Audio Playback State
  const [playingSong, setPlayingSong] = useState<SongItem | null>(null);

  // Thống kê
  const stats = useMemo(() => calculateSongStats(songs), [songs]);

  // Thể loại có sẵn
  const availableGenres = useMemo(() => getAvailableGenres(songs), [songs]);

  // Danh sách đã lọc
  const filteredSongs = useMemo(() => {
    const opts: SongFilterOptions = {
      search,
      status: selectedStatus,
      genre: selectedGenre,
      hasMp3: filterMp3Only ? true : undefined,
      hasYoutube: filterYoutubeOnly ? true : undefined,
      sortBy,
      sortOrder,
    };
    return filterSongs(songs, opts);
  }, [
    songs,
    search,
    selectedStatus,
    selectedGenre,
    filterMp3Only,
    filterYoutubeOnly,
    sortBy,
    sortOrder,
  ]);

  const handleSelectSong = (song: SongItem) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const handlePlayToggle = (song: SongItem) => {
    if (playingSong?.id === song.id) {
      setPlayingSong(null);
    } else {
      setPlayingSong(song);
    }
  };

  return (
    <div className={`vsg-container theme-glassmorphism ${className}`} data-glass-preset={glassPreset} data-glass-scenery={glassScenery}>
      {/* Top Banner Header */}
      <header className="vsg-header">
        <div className="vsg-header-left">
          <div className="vsg-brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div>
            <h1 className="vsg-main-title">{title}</h1>
            <p className="vsg-main-desc">{description}</p>
          </div>
        </div>

        <div className="vsg-header-actions">
          <div className="vsg-cli-tip" title="Tạo bài hát mới bằng dòng lệnh CLI">
            <span className="vsg-cli-label">Lệnh tạo bài mới:</span>
            <code>node scripts/new-song.mjs "Tên bài"</code>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <SongStatsOverview stats={stats} />

      {/* Search & Filters Bar */}
      <div className="vsg-filter-toolbar">
        <div className="vsg-search-box">
          <svg className="vsg-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bài hát, lời bài hát, prompt Suno, nghệ sĩ..."
            className="vsg-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="vsg-search-clear"
              aria-label="Xóa tìm kiếm"
            >
              &times;
            </button>
          )}
        </div>

        <div className="vsg-filters-row">
          {/* Status Tabs */}
          <div className="vsg-status-filter-pills">
            <button
              type="button"
              className={`vsg-pill-btn ${selectedStatus === 'all' && !filterMp3Only && !filterYoutubeOnly ? 'active' : ''}`}
              onClick={() => {
                setSelectedStatus('all');
                setFilterMp3Only(false);
                setFilterYoutubeOnly(false);
              }}
            >
              Tất cả ({stats.total})
            </button>
            <button
              type="button"
              className={`vsg-pill-btn ${filterYoutubeOnly ? 'active' : ''}`}
              onClick={() => {
                setFilterYoutubeOnly(!filterYoutubeOnly);
                setFilterMp3Only(false);
                setSelectedStatus('all');
              }}
            >
              🎬 Đã lên YouTube ({stats.published})
            </button>
            <button
              type="button"
              className={`vsg-pill-btn ${filterMp3Only ? 'active' : ''}`}
              onClick={() => {
                setFilterMp3Only(!filterMp3Only);
                setFilterYoutubeOnly(false);
                setSelectedStatus('all');
              }}
            >
              🎧 Có MP3 ({stats.mp3Ready})
            </button>
          </div>

          <div className="vsg-select-group">
            {/* Genre Select */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="vsg-select"
            >
              <option value="all">Tất cả thể loại ({availableGenres.length})</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="vsg-select"
            >
              <option value="createdAt-desc">Mới nhất trước</option>
              <option value="createdAt-asc">Cũ nhất trước</option>
              <option value="title-asc">Tên bài hát (A-Z)</option>
              <option value="duration-desc">Thời lượng dài nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="vsg-content-area">
        {filteredSongs.length > 0 ? (
          <div className="vsg-songs-grid">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={playingSong?.id === song.id}
                onPlayToggle={handlePlayToggle}
                onSelect={handleSelectSong}
              />
            ))}
          </div>
        ) : (
          <div className="vsg-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <h3>Không tìm thấy bài hát nào</h3>
            <p>Hãy thử tìm với từ khóa khác hoặc bỏ các bộ lọc đang chọn.</p>
            <button
              type="button"
              className="vsg-btn-secondary"
              onClick={() => {
                setSearch('');
                setSelectedStatus('all');
                setSelectedGenre('all');
                setFilterMp3Only(false);
                setFilterYoutubeOnly(false);
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Audio Player */}
      {playingSong && (
        <div className="vsg-floating-player">
          <div className="vsg-floating-header">
            <span className="vsg-floating-label">Đang phát:</span>
            <strong className="vsg-floating-title">{playingSong.title}</strong>
            <button
              type="button"
              onClick={() => setPlayingSong(null)}
              className="vsg-floating-close"
              aria-label="Đóng thanh phát nhạc"
            >
              &times;
            </button>
          </div>
          <AudioPlayer
            audio={playingSong.audio}
            title={playingSong.title}
            autoPlay={true}
          />
        </div>
      )}

      {/* Song Detail Modal */}
      <SongDetailModal
        song={selectedSong}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

