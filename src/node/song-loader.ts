import fs from 'fs';
import path from 'path';
import type { SongItem } from '../types';
import { parseSongMarkdown } from '../core/markdown-parser';

/**
 * Đọc toàn bộ các file bài hát Markdown từ thư mục data/songs
 */
export function loadSongsFromDisk(customDir?: string): SongItem[] {
  const songsDir =
    customDir ||
    path.resolve(process.cwd(), 'data/songs');

  if (!fs.existsSync(songsDir)) {
    // Thử fallback từ packages/videos-song-generate/data/songs
    const fallback = path.resolve(__dirname, '../../data/songs');
    if (fs.existsSync(fallback)) {
      return readSongsInDir(fallback);
    }
    return [];
  }

  return readSongsInDir(songsDir);
}

function readSongsInDir(dirPath: string): SongItem[] {
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
  const songs: SongItem[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const song = parseSongMarkdown(content, fullPath);
      songs.push(song);
    } catch (err) {
      console.error(`Lỗi khi đọc file bài hát ${file}:`, err);
    }
  }

  return songs;
}

/**
 * Đọc trực tiếp một bài hát từ file markdown
 */
export function loadSongFile(filePath: string): SongItem {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSongMarkdown(content, filePath);
}

