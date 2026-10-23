import type {
  SongItem,
  SongStatus,
  SunoPromptInfo,
  SunoAudioInfo,
  YouTubePublishInfo,
  LyricSection,
} from '../types';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  parseDurationToSeconds,
  formatSecondsToDuration,
} from './youtube-helper';

/**
 * Hàm phân tích an toàn một chuỗi giá trị YAML đơn giản
 */
function cleanYamlValue(val: string): any {
  let trimmed = val.trim();
  // Bỏ dấu nháy kép hoặc nháy đơn bao bọc
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }

  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num)) return num;
  }

  // Array dạng inline: ["a", "b", "c"]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(',')
      .map((item) => cleanYamlValue(item.trim()))
      .filter((item) => item !== undefined && item !== '');
  }

  return trimmed;
}

/**
 * Trích xuất Frontmatter thô và phần thân Markdown
 */
export function extractFrontmatterAndBody(rawContent: string): {
  frontmatterText: string;
  bodyText: string;
} {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return { frontmatterText: '', bodyText: normalized.trim() };
  }

  return {
    frontmatterText: match[1],
    bodyText: match[2].trim(),
  };
}

/**
 * Parse chuỗi YAML Frontmatter thành Record lồng nhau không phụ thuộc thư viện
 */
export function parseYamlFrontmatter(frontmatterText: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!frontmatterText) return result;

  const lines = frontmatterText.split('\n');
  let currentParentKey: string | null = null;
  let currentListKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Bỏ qua dòng trống hoặc comment thuần
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Kiểm tra dòng con của danh sách (ví dụ: - tag1)
    const listMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const value = cleanYamlValue(listMatch[2]);
      if (currentListKey) {
        if (currentParentKey && result[currentParentKey]) {
          if (!Array.isArray(result[currentParentKey][currentListKey])) {
            result[currentParentKey][currentListKey] = [];
          }
          result[currentParentKey][currentListKey].push(value);
        } else {
          if (!Array.isArray(result[currentListKey])) {
            result[currentListKey] = [];
          }
          result[currentListKey].push(value);
        }
      }
      continue;
    }

    // Kiểm tra dòng thuộc tính cấp 1 hoặc cấp 2
    const kvMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      const indent = kvMatch[1].length;
      const key = kvMatch[2].trim();
      const rawVal = kvMatch[3].trim();

      // Cấp 1 (không có thụt dòng)
      if (indent === 0) {
        currentListKey = null;
        if (rawVal === '') {
          // Bắt đầu 1 object lồng nhau hoặc list
          currentParentKey = key;
          result[key] = {};
          currentListKey = key; // có thể là danh sách
        } else {
          currentParentKey = null;
          result[key] = cleanYamlValue(rawVal);
          if (Array.isArray(result[key])) {
            currentListKey = key;
          }
        }
      } else {
        // Cấp 2 (thụt dòng thuộc object cha)
        if (currentParentKey) {
          if (!result[currentParentKey] || typeof result[currentParentKey] !== 'object') {
            result[currentParentKey] = {};
          }

          if (rawVal === '') {
            result[currentParentKey][key] = [];
            currentListKey = key;
          } else {
            result[currentParentKey][key] = cleanYamlValue(rawVal);
            currentListKey = null;
          }
        }
      }
    }
  }

  return result;
}

/**
 * Phân tích các phân đoạn trong lời bài hát (Suno Metatags như [Verse], [Chorus], [Bridge]...)
 */
export function parseLyricSections(lyrics: string): LyricSection[] {
  if (!lyrics) return [];
  const normalized = lyrics.replace(/\r\n/g, '\n');
  const tagRegex = /\[([^\]]+)\]/g;
  const sections: LyricSection[] = [];

  const matches = [...normalized.matchAll(tagRegex)];

  if (matches.length === 0) {
    return [{ tag: '[Full Lyrics]', content: normalized.trim() }];
  }

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const tag = `[${currentMatch[1]}]`;
    const startIndex = currentMatch.index! + currentMatch[0].length;
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index! : normalized.length;

    const content = normalized.slice(startIndex, nextIndex).trim();
    sections.push({ tag, content });
  }

  return sections;
}

/**
 * Tách nội dung các section từ phần thân Markdown (Lyrics, Notes...)
 */
export function extractMarkdownSections(bodyText: string): {
  title?: string;
  lyrics: string;
  productionNotes: string;
} {
  const result = {
    title: undefined as string | undefined,
    lyrics: '',
    productionNotes: '',
  };

  if (!bodyText) return result;

  const normalized = bodyText.replace(/\r\n/g, '\n');

  // Trích xuất H1 làm title nếu chưa có
  const h1Match = normalized.match(/^#\s+(.+)$/m);
  if (h1Match) {
    result.title = h1Match[1].trim();
  }

  // Tách các đoạn H2
  const h2Regex = /^##\s+(.+)$/gm;
  const matches = [...normalized.matchAll(h2Regex)];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim().toLowerCase();
    const startIndex = matches[i].index! + matches[i][0].length;
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index! : normalized.length;
    const sectionContent = normalized.slice(startIndex, nextIndex).trim();

    if (heading.includes('lời') || heading.includes('lyrics')) {
      result.lyrics = sectionContent;
    } else if (heading.includes('ghi chú') || heading.includes('notes') || heading.includes('sản xuất')) {
      result.productionNotes = sectionContent;
    }
  }

  // Nếu không thấy section Lyrics riêng bằng H2, lấy toàn bộ phần thân nếu có metatags
  if (!result.lyrics && normalized.includes('[')) {
    result.lyrics = normalized;
  }

  return result;
}

/**
 * Hàm phân tích toàn bộ một file Markdown thành đối tượng SongItem
 */
export function parseSongMarkdown(rawContent: string, filePath?: string): SongItem {
  const { frontmatterText, bodyText } = extractFrontmatterAndBody(rawContent);
  const data = parseYamlFrontmatter(frontmatterText);
  const { title: bodyTitle, lyrics: bodyLyrics, productionNotes: bodyNotes } =
    extractMarkdownSections(bodyText);

  const rawSuno = data.suno || {};
  const rawAudio = data.audio || {};
  const rawYoutube = data.youtube || {};

  // Xác định ID và Slug
  const fallbackSlug = filePath
    ? filePath.replace(/\\/g, '/').split('/').pop()?.replace(/\.md$/, '') || 'song-untitled'
    : 'song-untitled';
  const slug = (data.slug || fallbackSlug).toString().trim();
  const id = (data.id || `song-${slug}`).toString().trim();
  const title = (data.title || bodyTitle || slug.replace(/-/g, ' ')).toString().trim();

  // Xác định Suno Info
  const suno: SunoPromptInfo = {
    model: rawSuno.model || 'v3.5',
    stylePrompt: rawSuno.stylePrompt || rawSuno.style || '',
    lyricsPrompt: rawSuno.lyricsPrompt,
    clipId: rawSuno.clipId || rawSuno.id,
    songUrl: rawSuno.songUrl || rawSuno.url,
    taskStatus: rawSuno.taskStatus || 'completed',
    instruments: Array.isArray(rawSuno.instruments) ? rawSuno.instruments : undefined,
    tempo: rawSuno.tempo,
    vocalType: rawSuno.vocalType,
    tags: Array.isArray(rawSuno.tags) ? rawSuno.tags : undefined,
    negativeTags: rawSuno.negativeTags,
  };

  // Xác định Audio Info
  const audioDurationSec =
    typeof rawAudio.durationSeconds === 'number'
      ? rawAudio.durationSeconds
      : parseDurationToSeconds(rawAudio.duration);

  const audio: SunoAudioInfo = {
    fileName: rawAudio.fileName || (slug ? `${slug}.mp3` : undefined),
    filePath: rawAudio.filePath,
    audioUrl: rawAudio.audioUrl || rawAudio.url,
    duration: rawAudio.duration || (audioDurationSec ? formatSecondsToDuration(audioDurationSec) : undefined),
    durationSeconds: audioDurationSec || undefined,
    bitrate: rawAudio.bitrate || '192kbps',
    takeVersion: rawAudio.takeVersion,
    fileSize: rawAudio.fileSize,
    downloadedAt: rawAudio.downloadedAt,
  };

  // Xác định YouTube Info
  const ytPublishedUrl = rawYoutube.publishedUrl || rawYoutube.url;
  const ytVideoId = rawYoutube.videoId || extractYouTubeId(ytPublishedUrl);
  const ytThumbnail =
    rawYoutube.thumbnailUrl || (ytVideoId ? getYouTubeThumbnail(ytVideoId) : undefined);

  const youtube: YouTubePublishInfo = {
    publishedUrl: ytPublishedUrl,
    videoId: ytVideoId,
    title: rawYoutube.title || title,
    publishedAt: rawYoutube.publishedAt,
    status: rawYoutube.status || (ytPublishedUrl ? 'public' : 'draft'),
    views: typeof rawYoutube.views === 'number' ? rawYoutube.views : undefined,
    thumbnailUrl: ytThumbnail,
    description: rawYoutube.description,
    channelTitle: rawYoutube.channelTitle,
    isShort: typeof rawYoutube.isShort === 'boolean' ? rawYoutube.isShort : false,
    hashtags: Array.isArray(rawYoutube.hashtags) ? rawYoutube.hashtags : undefined,
  };

  // Xác định trạng thái tự động nếu chưa có
  let status: SongStatus = (data.status as SongStatus) || 'draft';
  if (!data.status) {
    if (youtube.publishedUrl || youtube.videoId) {
      status = 'published';
    } else if (audio.audioUrl || audio.filePath) {
      status = 'mp3_ready';
    } else if (suno.clipId || suno.stylePrompt) {
      status = 'suno_generated';
    } else {
      status = 'draft';
    }
  }

  // Lời bài hát & Sections
  const lyrics = (data.lyrics || bodyLyrics || '').trim();
  const lyricsSections = lyrics ? parseLyricSections(lyrics) : [];

  const productionNotes = (data.productionNotes || bodyNotes || '').trim();

  // Tags xử lý mảng
  const tags: string[] = Array.isArray(data.tags)
    ? data.tags.map(String)
    : typeof data.tags === 'string'
    ? data.tags.split(',').map((t: string) => t.trim())
    : [];

  return {
    id,
    slug,
    title,
    artist: data.artist || 'Suno AI & Quan',
    genre: data.genre || 'Pop',
    tags,
    status,
    createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString().split('T')[0],
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    suno,
    audio,
    youtube,
    lyrics,
    lyricsSections,
    productionNotes: productionNotes || undefined,
    rawMarkdown: rawContent,
    filePath,
  };
}

/**
 * Format đối tượng SongItem thành chuỗi Markdown chuẩn với YAML frontmatter
 */
export function formatSongToMarkdown(song: SongItem): string {
  const lines: string[] = ['---'];
  lines.push(`id: "${song.id}"`);
  lines.push(`slug: "${song.slug}"`);
  lines.push(`title: "${song.title.replace(/"/g, '\\"')}"`);
  if (song.artist) lines.push(`artist: "${song.artist.replace(/"/g, '\\"')}"`);
  if (song.genre) lines.push(`genre: "${song.genre.replace(/"/g, '\\"')}"`);
  lines.push(`status: "${song.status}"`);
  lines.push(`createdAt: "${song.createdAt}"`);
  if (song.updatedAt) lines.push(`updatedAt: "${song.updatedAt}"`);

  if (song.tags && song.tags.length > 0) {
    lines.push(`tags: [${song.tags.map((t) => `"${t}"`).join(', ')}]`);
  }

  // Suno section
  lines.push('');
  lines.push('suno:');
  lines.push(`  model: "${song.suno.model || 'v3.5'}"`);
  lines.push(`  stylePrompt: "${(song.suno.stylePrompt || '').replace(/"/g, '\\"')}"`);
  if (song.suno.lyricsPrompt) {
    lines.push(`  lyricsPrompt: "${song.suno.lyricsPrompt.replace(/"/g, '\\"')}"`);
  }
  if (song.suno.clipId) lines.push(`  clipId: "${song.suno.clipId}"`);
  if (song.suno.songUrl) lines.push(`  songUrl: "${song.suno.songUrl}"`);
  if (song.suno.taskStatus) lines.push(`  taskStatus: "${song.suno.taskStatus}"`);
  if (song.suno.tempo) lines.push(`  tempo: "${song.suno.tempo}"`);
  if (song.suno.vocalType) lines.push(`  vocalType: "${song.suno.vocalType}"`);
  if (song.suno.negativeTags) lines.push(`  negativeTags: "${song.suno.negativeTags}"`);

  // Audio section
  lines.push('');
  lines.push('audio:');
  if (song.audio.fileName) lines.push(`  fileName: "${song.audio.fileName}"`);
  if (song.audio.filePath) lines.push(`  filePath: "${song.audio.filePath}"`);
  if (song.audio.audioUrl) lines.push(`  audioUrl: "${song.audio.audioUrl}"`);
  if (song.audio.duration) lines.push(`  duration: "${song.audio.duration}"`);
  if (song.audio.durationSeconds) lines.push(`  durationSeconds: ${song.audio.durationSeconds}`);
  if (song.audio.bitrate) lines.push(`  bitrate: "${song.audio.bitrate}"`);
  if (song.audio.takeVersion) lines.push(`  takeVersion: "${song.audio.takeVersion}"`);

  // YouTube section
  lines.push('');
  lines.push('youtube:');
  if (song.youtube.publishedUrl) lines.push(`  publishedUrl: "${song.youtube.publishedUrl}"`);
  if (song.youtube.videoId) lines.push(`  videoId: "${song.youtube.videoId}"`);
  if (song.youtube.title) lines.push(`  title: "${song.youtube.title.replace(/"/g, '\\"')}"`);
  if (song.youtube.publishedAt) lines.push(`  publishedAt: "${song.youtube.publishedAt}"`);
  if (song.youtube.status) lines.push(`  status: "${song.youtube.status}"`);
  if (typeof song.youtube.views === 'number') lines.push(`  views: ${song.youtube.views}`);
  if (song.youtube.thumbnailUrl) lines.push(`  thumbnailUrl: "${song.youtube.thumbnailUrl}"`);
  if (song.youtube.isShort) lines.push(`  isShort: true`);

  lines.push('---');
  lines.push('');
  lines.push(`# ${song.title}`);
  lines.push('');
  lines.push('## 🎵 Suno Prompt & Cấu hình');
  lines.push(`- **Model**: Suno ${song.suno.model || 'v3.5'}`);
  lines.push(`- **Style of Music**: ${song.suno.stylePrompt}`);
  if (song.suno.vocalType) lines.push(`- **Vocal**: ${song.suno.vocalType}`);
  if (song.suno.tempo) lines.push(`- **Tempo**: ${song.suno.tempo}`);
  lines.push('');

  lines.push('## 📝 Lời bài hát (Lyrics)');
  lines.push('');
  lines.push(song.lyrics || '(Chưa có lời bài hát)');
  lines.push('');

  if (song.productionNotes) {
    lines.push('## 📌 Ghi chú sản xuất');
    lines.push(song.productionNotes);
    lines.push('');
  }

  return lines.join('\n');
}

