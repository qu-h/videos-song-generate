# @quan/videos-song-generate

Hệ thống quản lý bài hát sáng tác với **Suno AI** và kênh phát hành **YouTube**, được tổ chức bằng các file **Markdown (`.md`) trực tiếp trên source code**.

---

## 🎯 Mục đích sử dụng

1. **Quản lý nội dung Prompt Suno AI**:
   - Lưu trữ `stylePrompt`, mô hình AI (`v3.5`, `v4`), nhịp điệu (tempo), giọng hát (vocal), nhạc cụ, clip ID và link bài hát trên Suno.
   - Nút **Sao chép Prompt 1 chạm** để dán ngay vào Suno.

2. **Quản lý File MP3 Suno**:
   - Quản lý tên file MP3, đường dẫn lưu trữ, link tải từ Suno CDN, thời lượng, bitrate, phiên bản thu (`Take 1`, `Take 2`).
   - Tích hợp **Audio Player** nghe thử bài hát trực tiếp trên web với thanh tua và chỉnh âm lượng.

3. **Quản lý Link YouTube đã publish**:
   - Quản lý URL video YouTube, YouTube Video ID, ngày đăng, trạng thái hiển thị (`public`, `unlisted`, `draft`), số lượt xem, ảnh thumbnail và mô tả video.
   - Tích hợp **YouTube Embed Player** xem video trực tiếp trong modal.

4. **Quản lý Lời bài hát & Metatags Suno**:
   - Trực quan hóa các thẻ phân đoạn Suno: `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Solo]`, `[Outro]`.
   - Nút **Copy Full Lyrics** nhanh chóng.

5. **Lưu trữ chuẩn Markdown (`.md`) trên source code**:
   - Mỗi bài hát là một file `.md` độc lập trong thư mục `data/songs/`.
   - Dễ dàng commit lên Git, theo dõi lịch sử chỉnh sửa (version control) và đọc viết tự nhiên bằng bất kỳ editor nào.

---

## 📁 Cấu trúc thư mục package

```text
packages/videos-song-generate/
├── package.json
├── tsconfig.json
├── README.md
├── scripts/
│   ├── build-songs-data.mjs     # Quét toàn bộ file .md, sinh ra bundle TS/JSON tĩnh
│   ├── new-song.mjs              # CLI tạo file .md bài hát mới từ mẫu
│   └── validate-songs.mjs        # CLI kiểm tra tính hợp lệ của tất cả bài hát
├── data/
│   └── songs/                    # Kho lưu trữ file Markdown của các bài hát
│       ├── ngay-mai-nang-len.md
│       ├── dem-thanh-pho-mua.md
│       ├── giac-mo-dong-bang.md
│       ├── thanh-xuan-ruc-ro.md
│       └── giot-ca-phe-chieu.md
├── src/
│   ├── index.ts                  # Export toàn bộ types, core, data, react
│   ├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
│   ├── core/                     # Parser YAML/Markdown, YouTube helper, Filter & Stats
│   ├── data/                     # Bundle dữ liệu tĩnh và các helper query
│   ├── node/                     # Node.js dynamic loader đọc trực tiếp từ disk
│   ├── react/                    # Components UI (SongManager, Card, Modal, AudioPlayer, etc.)
│   ├── next/                     # Next.js App Router Page ready-to-use
│   └── styles/                   # songs.css hiện đại, responsive
```

---

## 📝 Định dạng một file bài hát `.md` mẫu

Mỗi bài hát được lưu trữ trong thư mục `data/songs/<slug>.md`:

```markdown
---
id: "song-001"
slug: "ngay-mai-nang-len"
title: "Ngày Mai Nắng Lên"
artist: "Quân & Suno AI"
genre: "Acoustic Pop Ballad"
tags: ["#acoustic", "#ballad", "#vietnamese", "#healing"]
status: "published" # draft | prompt_ready | suno_generated | mp3_ready | published
createdAt: "2026-10-15"
updatedAt: "2026-10-22"

suno:
  model: "v3.5"
  stylePrompt: "Vietnamese acoustic ballad, warm male vocal, gentle acoustic guitar, emotional piano, optimistic, healing vibe, 76 bpm"
  lyricsPrompt: "Viết lời bài hát ballad Việt Nam về niềm tin ngày mai nắng lên..."
  clipId: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
  songUrl: "https://suno.com/song/a1b2c3d4-5678-90ab-cdef-1234567890ab"
  taskStatus: "completed"
  tempo: "76 bpm"
  vocalType: "male"

audio:
  fileName: "ngay-mai-nang-len.mp3"
  filePath: "public/audio/ngay-mai-nang-len.mp3"
  audioUrl: "https://cdn1.suno.ai/a1b2c3d4-5678-90ab-cdef-1234567890ab.mp3"
  duration: "03:32"
  durationSeconds: 212
  bitrate: "192kbps"
  takeVersion: "Take 2 (Best Warm Vocal)"

youtube:
  publishedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  videoId: "dQw4w9WgXcQ"
  title: "Ngày Mai Nắng Lên | Official Audio Lyric Video | Suno AI Music"
  publishedAt: "2026-10-18T20:00:00Z"
  status: "public"
  views: 1240
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  description: "Bài hát Ngày Mai Nắng Lên do Suno AI sáng tác..."
---

# Ngày Mai Nắng Lên

## 🎵 Suno Prompt & Cấu hình
- **Model**: Suno v3.5
- **Style of Music**: Vietnamese acoustic ballad, warm male vocal...
- **Tempo**: 76 BPM

## 📝 Lời bài hát (Lyrics)

[Intro]
(Tiếng guitar mộc nhẹ nhàng rải nốt...)

[Verse 1]
Bước qua những ngày giông bão ngập tràn lối đi...

[Chorus]
Ngày mai nắng sẽ lên, xua tan đi màn mây tối...

[Outro]
Ngày mai nắng lên...
[End]

## 📌 Ghi chú sản xuất
- Bản Suno gen lần 2 (Take 2) vocal ấm và khớp nhịp nhất.
```

---

## ⚡ Các lệnh CLI hỗ trợ

Trong thư mục package `packages/videos-song-generate`:

### 1. Tạo bài hát mới từ template
```bash
node scripts/new-song.mjs "Tên Bài Hát Của Bạn" --genre="Lofi R&B" --model="v3.5"
```
Lệnh sẽ tự động sinh file `data/songs/<slug>.md` với template chuẩn đầy đủ cấu trúc prompt Suno, audio, YouTube và lyrics.

### 2. Đồng bộ & đóng gói dữ liệu
```bash
npm run sync
# hoặc: node scripts/build-songs-data.mjs
```
Script sẽ tự động đọc tất cả file `.md`, phân tích frontmatter, trích xuất lyrics và sinh ra:
- `src/data/songs-bundle.ts`: Module TypeScript tĩnh để import ở Client Component Next.js mà không cần `fs`.
- `src/data/songs-bundle.json`: Dữ liệu JSON tiện lợi.

### 3. Kiểm tra tính hợp lệ của các file Markdown
```bash
npm run song:validate
# hoặc: node scripts/validate-songs.mjs
```
Kiểm tra xem các bài hát có đủ prompt Suno, lyrics, link MP3, và link YouTube (nếu đã publish) hay không.

---

## 💻 Sử dụng trong Next.js / React Application

### 1. Sử dụng Component Dashboard hoàn chỉnh

```tsx
import { SongManager } from '@quan/videos-song-generate';
import '@quan/videos-song-generate/styles.css';

export default function SongsStudioPage() {
  return <SongManager title="Suno Studio" />;
}
```

### 2. Sử dụng từng Component riêng lẻ

```tsx
import {
  AudioPlayer,
  YouTubeEmbed,
  PromptBox,
  LyricsViewer,
  SongCard,
} from '@quan/videos-song-generate';
import { getSongBySlug } from '@quan/videos-song-generate/data';

const song = getSongBySlug('dem-thanh-pho-mua');

// Phát MP3
<AudioPlayer audio={song.audio} title={song.title} />

// Xem video YouTube
<YouTubeEmbed youtube={song.youtube} />

// Khung Prompt Suno với nút copy
<PromptBox suno={song.suno} />

// Khung Lyrics Suno
<LyricsViewer lyrics={song.lyrics} sections={song.lyricsSections} />
```

### 3. Đọc dữ liệu trong Server Components / Node.js (Real-time từ disk)

```tsx
import { loadSongsFromDisk } from '@quan/videos-song-generate/node';

export default async function ServerPage() {
  const songs = loadSongsFromDisk();
  return <div>Tổng số bài: {songs.length}</div>;
}
```

