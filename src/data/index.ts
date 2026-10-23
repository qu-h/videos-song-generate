import { SONGS_BUNDLE } from './songs-bundle';
import type { SongItem } from '../types';

/**
 * Danh sách toàn bộ bài hát từ bundle tĩnh
 */
export const SONGS_LIST: SongItem[] = SONGS_BUNDLE;

/**
 * Lấy tất cả bài hát
 */
export function getAllSongs(): SongItem[] {
  return SONGS_LIST;
}

/**
 * Tìm bài hát theo slug
 */
export function getSongBySlug(slug: string): SongItem | undefined {
  return SONGS_LIST.find((s) => s.slug === slug);
}

/**
 * Tìm bài hát theo ID
 */
export function getSongById(id: string): SongItem | undefined {
  return SONGS_LIST.find((s) => s.id === id);
}

/**
 * Lấy danh sách các bài hát đã publish lên YouTube
 */
export function getPublishedSongs(): SongItem[] {
  return SONGS_LIST.filter(
    (s) => s.status === 'published' || Boolean(s.youtube.publishedUrl || s.youtube.videoId)
  );
}

/**
 * Lấy danh sách các bài hát đã có file MP3 từ Suno
 */
export function getSongsWithAudio(): SongItem[] {
  return SONGS_LIST.filter((s) => Boolean(s.audio.audioUrl || s.audio.filePath));
}

export * from './songs-bundle';

