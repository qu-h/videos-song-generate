import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const songsDir = path.join(rootDir, 'data/songs');

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const args = process.argv.slice(2);
const titleArg = args.find((a) => !a.startsWith('--'));

if (!titleArg) {
  console.log(`
Hướng dẫn sử dụng lệnh tạo bài hát mới:
  node scripts/new-song.mjs "Tên bài hát" [--genre="Acoustic Pop"] [--model="v3.5"]

Ví dụ:
  node scripts/new-song.mjs "Chiều Thu Kỷ Niệm" --genre="Ballad"
`);
  process.exit(1);
}

const title = titleArg;
const slug = toSlug(title);
const targetPath = path.join(songsDir, `${slug}.md`);

if (fs.existsSync(targetPath)) {
  console.error(`❌ Lỗi: File đã tồn tại tại ${targetPath}`);
  process.exit(1);
}

const genre = args.find((a) => a.startsWith('--genre='))?.split('=')[1] || 'Acoustic Pop Ballad';
const model = args.find((a) => a.startsWith('--model='))?.split('=')[1] || 'v3.5';
const today = new Date().toISOString().split('T')[0];

const template = `---
id: "song-${Date.now().toString().slice(-6)}"
slug: "${slug}"
title: "${title}"
artist: "Quân & Suno AI"
genre: "${genre}"
tags: ["#${toSlug(genre)}", "#vietnamese", "#suno-ai"]
status: "draft"
createdAt: "${today}"

suno:
  model: "${model}"
  stylePrompt: "Vietnamese ${genre.toLowerCase()}, acoustic instruments, warm vocal, emotional melody, 80 bpm"
  lyricsPrompt: "Viết lời bài hát ${title} đầy cảm xúc và ý nghĩa"
  taskStatus: "submitted"
  tempo: "80 bpm"
  vocalType: "male"

audio:
  fileName: "${slug}.mp3"
  filePath: "public/audio/${slug}.mp3"
  duration: "03:30"
  durationSeconds: 210
  bitrate: "192kbps"
  takeVersion: "Take 1"

youtube:
  status: "draft"
  title: "${title} | Official Audio Lyric Video | Suno AI"
  description: "Bài hát ${title} - Sáng tác cùng Suno AI. Đăng ký kênh để đón nghe nhiều bài hát mới nhất."
---

# ${title}

## 🎵 Suno Prompt & Cấu hình
- **Model**: Suno ${model}
- **Style of Music**: Vietnamese ${genre.toLowerCase()}, acoustic instruments, warm vocal, emotional melody, 80 bpm
- **Vocal**: Giọng nam truyền cảm
- **Tempo**: 80 BPM

## 📝 Lời bài hát (Lyrics)

[Intro]
(Tiếng dạo nhạc mở đầu nhẹ nhàng)

[Verse 1]
(Nhập câu hát thứ nhất ở đây...)
(Nhập câu hát thứ hai ở đây...)

[Pre-Chorus]
(Đoạn dẫn dắt trước khi bùng nổ...)

[Chorus]
(Điệp khúc cao trào bài hát...)
(Lặp lại câu hát điểm nhấn...)

[Verse 2]
(Phần lời thứ hai phát triển nội dung...)

[Bridge]
(Đoạn chuyển tiếp tạo bất ngờ...)

[Chorus]
(Điệp khúc cao trào bài hát...)

[Outro]
(Lời kết thúc nhẹ nhàng lắng đọng...)
[Fade Out]
[End]

## 📌 Ghi chú sản xuất
- Đang thử nghiệm prompt phong cách ${genre}.
- Mục tiêu: Chọn ra bản thu tốt nhất để làm video YouTube.
`;

fs.writeFileSync(targetPath, template, 'utf-8');
console.log(`✅ Đã tạo bài hát mới thành công!`);
console.log(`📁 File: ${path.relative(rootDir, targetPath)}`);
console.log(`\nSau khi chỉnh sửa xong, hãy chạy: npm run sync`);

