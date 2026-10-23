/**
 * Trạng thái quy trình sản xuất của bài hát
 */
export type SongStatus =
  | 'draft'            // Bản nháp ý tưởng ban đầu
  | 'prompt_ready'     // Đã chuẩn bị xong Prompt & Lyrics
  | 'suno_generated'   // Đã gửi lên Suno và tạo nhạc thành công
  | 'mp3_ready'        // Đã tải/chuẩn bị file MP3 hoàn chỉnh
  | 'video_rendered'   // Đã dựng xong video (Remotion / CapCut / Premiere)
  | 'published';       // Đã publish lên YouTube

/**
 * Trạng thái video trên YouTube
 */
export type YouTubePrivacyStatus = 'public' | 'unlisted' | 'private' | 'scheduled' | 'draft';

/**
 * Thông tin Prompt gửi lên Suno AI
 */
export interface SunoPromptInfo {
  /** Phiên bản mô hình Suno (v3.5, v4, v3, v2) */
  model: string;
  /** Style prompt mô tả thể loại, nhạc cụ, vocal, nhịp điệu (BPM) */
  stylePrompt: string;
  /** Prompt yêu cầu viết lời (nếu dùng AI tạo lyrics) */
  lyricsPrompt?: string;
  /** ID clip / bài hát trên Suno */
  clipId?: string;
  /** Link trực tiếp đến bài hát trên Suno (https://suno.com/song/...) */
  songUrl?: string;
  /** Trạng thái tạo bài trên Suno */
  taskStatus?: 'submitted' | 'processing' | 'completed' | 'failed';
  /** Nhạc cụ chính sử dụng */
  instruments?: string[];
  /** Nhịp điệu bài hát (ví dụ: "76 bpm", "120 bpm") */
  tempo?: string;
  /** Giọng ca: Nam (male), Nữ (female), Song ca (duet), Hợp xướng (choir), Không lời (instrumental) */
  vocalType?: 'male' | 'female' | 'duet' | 'choir' | 'instrumental';
  /** Thẻ gắn liền trong style prompt */
  tags?: string[];
  /** Thẻ loại trừ (Negative tags) nếu có */
  negativeTags?: string;
}

/**
 * Thông tin file MP3 thu được từ Suno
 */
export interface SunoAudioInfo {
  /** Tên file MP3 lưu trữ (ví dụ: dem-thanh-pho.mp3) */
  fileName?: string;
  /** Đường dẫn file MP3 nội bộ hoặc relative path */
  filePath?: string;
  /** Link tải / phát trực tuyến MP3 (từ Suno CDN hoặc server host) */
  audioUrl?: string;
  /** Thời lượng định dạng chuỗi: mm:ss (ví dụ: 03:45) */
  duration?: string;
  /** Thời lượng tính bằng giây */
  durationSeconds?: number;
  /** Chất lượng âm thanh (ví dụ: 192kbps, 320kbps) */
  bitrate?: string;
  /** Phiên bản tạo / lần thử (Take 1, Take 2, Extended, Remastered) */
  takeVersion?: string;
  /** Dung lượng file (ví dụ: 5.2 MB) */
  fileSize?: string;
  /** Ngày tải file về */
  downloadedAt?: string;
}

/**
 * Thông tin video đã publish lên YouTube
 */
export interface YouTubePublishInfo {
  /** Link video YouTube (https://www.youtube.com/watch?v=... hoặc /shorts/...) */
  publishedUrl?: string;
  /** Mã định danh video YouTube (11 ký tự) */
  videoId?: string;
  /** Tiêu đề video khi đăng trên YouTube */
  title?: string;
  /** Thời gian đăng video (ISO 8601 hoặc YYYY-MM-DD) */
  publishedAt?: string;
  /** Trạng thái hiển thị trên YouTube */
  status?: YouTubePrivacyStatus;
  /** Lượt xem hiện tại (ước tính) */
  views?: number;
  /** Ảnh thu nhỏ (Thumbnail) video */
  thumbnailUrl?: string;
  /** Mô tả chi tiết khi đăng YouTube (Description) */
  description?: string;
  /** Kênh YouTube đăng tải */
  channelTitle?: string;
  /** Là YouTube Shorts hay Video thường */
  isShort?: boolean;
  /** Danh sách hashtag */
  hashtags?: string[];
}

/**
 * Cấu trúc phân đoạn lời bài hát (Verse, Chorus, Bridge...)
 */
export interface LyricSection {
  /** Nhãn phân đoạn: [Intro], [Verse 1], [Chorus], [Outro], etc. */
  tag: string;
  /** Nội dung lời bài hát của đoạn đó */
  content: string;
}

/**
 * Thực thể bài hát hoàn chỉnh quản lý từ Markdown
 */
export interface SongItem {
  /** Mã định danh bài hát (ví dụ: song-001) */
  id: string;
  /** Đường dẫn tĩnh / slug định danh (ví dụ: dem-thanh-pho-mua) */
  slug: string;
  /** Tên bài hát */
  title: string;
  /** Tác giả lời / Nghệ sĩ / AI Maker */
  artist?: string;
  /** Thể loại âm nhạc chính */
  genre?: string;
  /** Các nhãn phân loại (tags) */
  tags: string[];
  /** Trạng thái hiện tại của bài hát */
  status: SongStatus;
  /** Ngày tạo bài hát (YYYY-MM-DD) */
  createdAt: string;
  /** Ngày cập nhật gần nhất */
  updatedAt?: string;

  /** Nhóm 1: Quản lý Prompt Suno */
  suno: SunoPromptInfo;

  /** Nhóm 2: Quản lý File MP3 Suno */
  audio: SunoAudioInfo;

  /** Nhóm 3: Quản lý Link YouTube đã publish */
  youtube: YouTubePublishInfo;

  /** Nội dung lời bài hát đầy đủ (Lyrics) */
  lyrics: string;
  /** Các phân đoạn lời đã được bóc tách tự động */
  lyricsSections?: LyricSection[];

  /** Ghi chú sản xuất / quy trình tạo nhạc */
  productionNotes?: string;

  /** Nội dung Markdown thô đầy đủ của file .md */
  rawMarkdown?: string;
  /** Đường dẫn file .md trên source code */
  filePath?: string;
}

/**
 * Tùy chọn lọc và tìm kiếm danh sách bài hát
 */
export interface SongFilterOptions {
  search?: string;
  status?: SongStatus | 'all';
  genre?: string | 'all';
  hasMp3?: boolean;
  hasYoutube?: boolean;
  tag?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Thống kê tổng quan kho bài hát
 */
export interface SongStats {
  total: number;
  published: number;
  mp3Ready: number;
  sunoGenerated: number;
  draft: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  genres: Record<string, number>;
}

