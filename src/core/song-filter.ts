import type { SongItem, SongFilterOptions } from '../types';

/**
 * Lọc và sắp xếp danh sách bài hát theo các tiêu chí
 */
export function filterSongs(songs: SongItem[], options: SongFilterOptions = {}): SongItem[] {
  const {
    search,
    status = 'all',
    genre = 'all',
    hasMp3,
    hasYoutube,
    tag,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  let filtered = [...songs];

  // 1. Tìm kiếm theo từ khóa
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((song) => {
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchArtist = song.artist?.toLowerCase().includes(q);
      const matchGenre = song.genre?.toLowerCase().includes(q);
      const matchPrompt = song.suno.stylePrompt.toLowerCase().includes(q);
      const matchLyrics = song.lyrics.toLowerCase().includes(q);
      const matchTags = song.tags.some((t) => t.toLowerCase().includes(q));
      const matchYt = song.youtube.title?.toLowerCase().includes(q);
      const matchYtId = song.youtube.videoId?.toLowerCase().includes(q);

      return (
        matchTitle ||
        matchArtist ||
        matchGenre ||
        matchPrompt ||
        matchLyrics ||
        matchTags ||
        matchYt ||
        matchYtId
      );
    });
  }

  // 2. Lọc theo trạng thái
  if (status && status !== 'all') {
    filtered = filtered.filter((s) => s.status === status);
  }

  // 3. Lọc theo thể loại
  if (genre && genre !== 'all') {
    filtered = filtered.filter(
      (s) => s.genre?.toLowerCase() === genre.toLowerCase()
    );
  }

  // 4. Lọc bài đã có MP3
  if (hasMp3 !== undefined) {
    filtered = filtered.filter((s) => {
      const exists = Boolean(s.audio.audioUrl || s.audio.filePath || s.audio.fileName);
      return hasMp3 ? exists : !exists;
    });
  }

  // 5. Lọc bài đã lên YouTube
  if (hasYoutube !== undefined) {
    filtered = filtered.filter((s) => {
      const exists = Boolean(s.youtube.publishedUrl || s.youtube.videoId);
      return hasYoutube ? exists : !exists;
    });
  }

  // 6. Lọc theo Tag
  if (tag) {
    const targetTag = tag.toLowerCase();
    filtered = filtered.filter((s) =>
      s.tags.some((t) => t.toLowerCase() === targetTag || `#${t.toLowerCase()}` === targetTag)
    );
  }

  // 7. Sắp xếp
  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'title') {
      comp = a.title.localeCompare(b.title, 'vi');
    } else if (sortBy === 'duration') {
      const durA = a.audio.durationSeconds || 0;
      const durB = b.audio.durationSeconds || 0;
      comp = durA - durB;
    } else if (sortBy === 'updatedAt') {
      const dateA = a.updatedAt || a.createdAt;
      const dateB = b.updatedAt || b.createdAt;
      comp = dateA.localeCompare(dateB);
    } else {
      // Mặc định: createdAt
      comp = a.createdAt.localeCompare(b.createdAt);
    }

    return sortOrder === 'asc' ? comp : -comp;
  });

  return filtered;
}

/**
 * Lấy danh sách các thể loại duy nhất từ kho bài hát
 */
export function getAvailableGenres(songs: SongItem[]): string[] {
  const genres = new Set<string>();
  for (const s of songs) {
    if (s.genre) genres.add(s.genre);
  }
  return Array.from(genres).sort();
}

/**
 * Lấy danh sách các tags duy nhất
 */
export function getAvailableTags(songs: SongItem[]): string[] {
  const tags = new Set<string>();
  for (const s of songs) {
    for (const t of s.tags) {
      tags.add(t);
    }
  }
  return Array.from(tags).sort();
}

