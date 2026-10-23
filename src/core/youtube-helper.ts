/**
 * Trích xuất YouTube Video ID từ nhiều định dạng URL khác nhau
 * Hỗ trợ:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (đã là ID 11 ký tự)
 */
export function extractYouTubeId(urlOrId?: string): string | undefined {
  if (!urlOrId) return undefined;
  const trimmed = urlOrId.trim();

  // Đã là ID 11 ký tự chuẩn
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex nhận diện các dạng link YouTube
  const patterns = [
    /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/)([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Tạo link embed xem YouTube trong iframe
 */
export function getYouTubeEmbedUrl(urlOrId?: string): string | undefined {
  const id = extractYouTubeId(urlOrId);
  if (!id) return undefined;
  return `https://www.youtube.com/embed/${id}?rel=0`;
}

/**
 * Lấy link ảnh thumbnail của YouTube video
 */
export function getYouTubeThumbnail(
  urlOrId?: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'maxresdefault' = 'hqdefault'
): string | undefined {
  const id = extractYouTubeId(urlOrId);
  if (!id) return undefined;
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

/**
 * Chuyển đổi số giây thành định dạng chuỗi mm:ss hoặc hh:mm:ss
 */
export function formatSecondsToDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const hh = hrs.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Chuyển chuỗi định dạng mm:ss hoặc hh:mm:ss thành số giây
 */
export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map((p) => parseInt(p.trim(), 10));
  if (parts.some((p) => isNaN(p))) return 0;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

