import type { SongItem, SongStats } from '../types';
import { formatSecondsToDuration } from './youtube-helper';

/**
 * Tính toán số liệu thống kê tổng thể từ danh sách bài hát
 */
export function calculateSongStats(songs: SongItem[]): SongStats {
  let published = 0;
  let mp3Ready = 0;
  let sunoGenerated = 0;
  let draft = 0;
  let totalDurationSeconds = 0;
  const genres: Record<string, number> = {};

  for (const song of songs) {
    // Trạng thái xuất bản
    if (song.status === 'published' || song.youtube.publishedUrl || song.youtube.videoId) {
      published++;
    } else if (song.status === 'mp3_ready' || song.audio.audioUrl || song.audio.filePath) {
      mp3Ready++;
    } else if (song.status === 'suno_generated' || song.suno.clipId) {
      sunoGenerated++;
    } else {
      draft++;
    }

    // Thời lượng
    if (song.audio.durationSeconds && song.audio.durationSeconds > 0) {
      totalDurationSeconds += song.audio.durationSeconds;
    }

    // Thể loại
    const g = song.genre || 'Chưa phân loại';
    genres[g] = (genres[g] || 0) + 1;
  }

  return {
    total: songs.length,
    published,
    mp3Ready,
    sunoGenerated,
    draft,
    totalDurationSeconds,
    totalDurationFormatted: formatSecondsToDuration(totalDurationSeconds),
    genres,
  };
}

