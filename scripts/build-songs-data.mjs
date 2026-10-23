import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const songsDir = path.join(rootDir, 'data/songs');
const outputTsFile = path.join(rootDir, 'src/data/songs-bundle.ts');
const outputJsonFile = path.join(rootDir, 'src/data/songs-bundle.json');

function cleanYamlValue(val) {
  let trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num)) return num;
  }
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

function parseYamlFrontmatter(frontmatterText) {
  const result = {};
  if (!frontmatterText) return result;

  const lines = frontmatterText.split('\n');
  let currentParentKey = null;
  let currentListKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const listMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (listMatch) {
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

    const kvMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      const indent = kvMatch[1].length;
      const key = kvMatch[2].trim();
      const rawVal = kvMatch[3].trim();

      if (indent === 0) {
        currentListKey = null;
        if (rawVal === '') {
          currentParentKey = key;
          result[key] = {};
          currentListKey = key;
        } else {
          currentParentKey = null;
          result[key] = cleanYamlValue(rawVal);
          if (Array.isArray(result[key])) {
            currentListKey = key;
          }
        }
      } else {
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

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return undefined;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/)([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m && m[1]) return m[1];
  }
  return undefined;
}

function parseLyricSections(lyrics) {
  if (!lyrics) return [];
  const normalized = lyrics.replace(/\r\n/g, '\n');
  const tagRegex = /\[([^\]]+)\]/g;
  const sections = [];
  const matches = [...normalized.matchAll(tagRegex)];

  if (matches.length === 0) {
    return [{ tag: '[Full Lyrics]', content: normalized.trim() }];
  }

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const tag = `[${currentMatch[1]}]`;
    const startIndex = currentMatch.index + currentMatch[0].length;
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
    const content = normalized.slice(startIndex, nextIndex).trim();
    sections.push({ tag, content });
  }

  return sections;
}

function parseSongFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  const frontmatterText = match ? match[1] : '';
  const bodyText = (match ? match[2] : normalized).trim();

  const data = parseYamlFrontmatter(frontmatterText);

  // Parse Sections in Body
  let title = data.title;
  let lyrics = data.lyrics || '';
  let productionNotes = data.productionNotes || '';

  const h1Match = bodyText.match(/^#\s+(.+)$/m);
  if (!title && h1Match) {
    title = h1Match[1].trim();
  }

  const h2Regex = /^##\s+(.+)$/gm;
  const h2Matches = [...bodyText.matchAll(h2Regex)];
  for (let i = 0; i < h2Matches.length; i++) {
    const heading = h2Matches[i][1].trim().toLowerCase();
    const startIndex = h2Matches[i].index + h2Matches[i][0].length;
    const nextIndex = i + 1 < h2Matches.length ? h2Matches[i + 1].index : bodyText.length;
    const sectionContent = bodyText.slice(startIndex, nextIndex).trim();

    if (heading.includes('lời') || heading.includes('lyrics')) {
      lyrics = sectionContent;
    } else if (heading.includes('ghi chú') || heading.includes('notes') || heading.includes('sản xuất')) {
      productionNotes = sectionContent;
    }
  }

  const fallbackSlug = path.basename(filePath, '.md');
  const slug = (data.slug || fallbackSlug).toString().trim();
  const id = (data.id || `song-${slug}`).toString().trim();

  const rawSuno = data.suno || {};
  const rawAudio = data.audio || {};
  const rawYoutube = data.youtube || {};

  const ytPublishedUrl = rawYoutube.publishedUrl || rawYoutube.url;
  const ytVideoId = rawYoutube.videoId || extractYouTubeId(ytPublishedUrl);
  const ytThumbnail =
    rawYoutube.thumbnailUrl || (ytVideoId ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg` : undefined);

  let status = data.status || 'draft';
  if (!data.status) {
    if (ytPublishedUrl || ytVideoId) status = 'published';
    else if (rawAudio.audioUrl || rawAudio.filePath) status = 'mp3_ready';
    else if (rawSuno.clipId) status = 'suno_generated';
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : typeof data.tags === 'string'
    ? data.tags.split(',').map((t) => t.trim())
    : [];

  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

  return {
    id,
    slug,
    title: title || slug,
    artist: data.artist || 'Suno AI & Quan',
    genre: data.genre || 'Pop',
    tags,
    status,
    createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString().split('T')[0],
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    suno: {
      model: rawSuno.model || 'v3.5',
      stylePrompt: rawSuno.stylePrompt || rawSuno.style || '',
      lyricsPrompt: rawSuno.lyricsPrompt,
      clipId: rawSuno.clipId || rawSuno.id,
      songUrl: rawSuno.songUrl || rawSuno.url,
      taskStatus: rawSuno.taskStatus || 'completed',
      tempo: rawSuno.tempo,
      vocalType: rawSuno.vocalType,
      tags: Array.isArray(rawSuno.tags) ? rawSuno.tags : undefined,
      negativeTags: rawSuno.negativeTags,
    },
    audio: {
      fileName: rawAudio.fileName || `${slug}.mp3`,
      filePath: rawAudio.filePath,
      audioUrl: rawAudio.audioUrl || rawAudio.url,
      duration: rawAudio.duration,
      durationSeconds: typeof rawAudio.durationSeconds === 'number' ? rawAudio.durationSeconds : undefined,
      bitrate: rawAudio.bitrate || '192kbps',
      takeVersion: rawAudio.takeVersion,
      fileSize: rawAudio.fileSize,
    },
    youtube: {
      publishedUrl: ytPublishedUrl,
      videoId: ytVideoId,
      title: rawYoutube.title || title,
      publishedAt: rawYoutube.publishedAt,
      status: rawYoutube.status || (ytPublishedUrl ? 'public' : 'draft'),
      views: typeof rawYoutube.views === 'number' ? rawYoutube.views : undefined,
      thumbnailUrl: ytThumbnail,
      description: rawYoutube.description,
      channelTitle: rawYoutube.channelTitle,
      isShort: Boolean(rawYoutube.isShort),
    },
    lyrics,
    lyricsSections: parseLyricSections(lyrics),
    productionNotes: productionNotes || undefined,
    filePath: relativePath,
  };
}

console.log('🔍 Scanning songs in:', songsDir);

if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
}

const files = fs.readdirSync(songsDir).filter((f) => f.endsWith('.md'));
const songs = [];

for (const file of files) {
  const fullPath = path.join(songsDir, file);
  try {
    const song = parseSongFile(fullPath);
    songs.push(song);
    console.log(`  ✓ Loaded: [${song.status}] ${song.title} (${file})`);
  } catch (err) {
    console.error(`  ✗ Error loading ${file}:`, err.message);
  }
}

// Ensure output dirs exist
fs.mkdirSync(path.dirname(outputTsFile), { recursive: true });

// 1. Write JSON bundle
fs.writeFileSync(outputJsonFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`\n📦 Saved JSON bundle to: ${path.relative(rootDir, outputJsonFile)}`);

// 2. Write TypeScript bundle
const tsContent = `// Auto-generated by scripts/build-songs-data.mjs
// Do not edit directly. Run 'npm run sync' to refresh.

import type { SongItem } from '../types';

export const SONGS_BUNDLE: SongItem[] = ${JSON.stringify(songs, null, 2)};

export default SONGS_BUNDLE;
`;

fs.writeFileSync(outputTsFile, tsContent, 'utf-8');
console.log(`📦 Saved TypeScript bundle to: ${path.relative(rootDir, outputTsFile)}`);

console.log(`\n✨ Summary: Loaded ${songs.length} song(s) successfully!`);
const publishedCount = songs.filter((s) => s.status === 'published' || s.youtube.publishedUrl).length;
const mp3Count = songs.filter((s) => s.audio.audioUrl || s.audio.filePath).length;
console.log(`   - 🎬 YouTube Published: ${publishedCount}`);
console.log(`   - 🎧 MP3 Ready: ${mp3Count}`);

