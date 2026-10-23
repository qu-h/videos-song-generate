import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const songsDir = path.join(rootDir, 'data/songs');

console.log('🔍 Kiểm tra tính hợp lệ của tất cả file Markdown bài hát...\n');

if (!fs.existsSync(songsDir)) {
  console.error('❌ Thư mục data/songs không tồn tại!');
  process.exit(1);
}

const files = fs.readdirSync(songsDir).filter((f) => f.endsWith('.md'));
let errorsCount = 0;
let warningsCount = 0;

for (const file of files) {
  const filePath = path.join(songsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  const issues = [];
  const warnings = [];

  // 1. Kiểm tra frontmatter
  if (!content.startsWith('---')) {
    issues.push('Thiếu dấu mở Frontmatter (---) ở đầu file');
  }

  // 2. Kiểm tra Style prompt
  if (!content.includes('stylePrompt:') && !content.includes('style:')) {
    issues.push('Thiếu cấu hình suno.stylePrompt');
  }

  // 3. Kiểm tra Lyrics
  if (!content.includes('[Verse') && !content.includes('[Chorus') && !content.includes('## 📝 Lời bài hát')) {
    warnings.push('Chưa có lời bài hát (Lyrics) hoặc thiếu thẻ phân đoạn [Verse]/[Chorus]');
  }

  // 4. Kiểm tra MP3
  if (!content.includes('audioUrl:') && !content.includes('filePath:')) {
    warnings.push('Chưa có link hoặc đường dẫn file MP3');
  }

  // 5. Kiểm tra YouTube nếu status là published
  if (content.includes('status: "published"') || content.includes("status: 'published'")) {
    if (!content.includes('publishedUrl:') && !content.includes('videoId:')) {
      issues.push('Trạng thái là "published" nhưng thiếu publishedUrl hoặc videoId của YouTube');
    }
  }

  if (issues.length > 0) {
    errorsCount += issues.length;
    console.error(`❌ [LỖI] ${file}:`);
    issues.forEach((err) => console.error(`    - ${err}`));
  } else if (warnings.length > 0) {
    warningsCount += warnings.length;
    console.warn(`⚠️ [CẢNH BÁO] ${file}:`);
    warnings.forEach((w) => console.warn(`    - ${w}`));
  } else {
    console.log(`✅ [HỢP LỆ] ${file}`);
  }
}

console.log('\n----------------------------------------');
console.log(`Tổng kết: Đã kiểm tra ${files.length} file.`);
if (errorsCount === 0 && warningsCount === 0) {
  console.log('🎉 Tất cả file bài hát đều đạt chuẩn và hợp lệ 100%!');
} else {
  console.log(`⚠️ Có ${errorsCount} lỗi và ${warningsCount} cảnh báo.`);
}

