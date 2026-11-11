# Quy Tắc Cho AI Coding Agents (Codex, Antigravity, Claude, Cursor)

Tài liệu này là quy chuẩn bắt buộc cho mọi AI Agent khi làm việc trong package `videos-song-generate`.

---

## 1. Quy Trình Đầu Ra Chuẩn (3 File)
Khi người dùng đưa một chủ đề bài hát/video (ví dụ: *"Nhật Minh đi tắm biển"*), AI luôn đọc [WORKFLOW.md](WORKFLOW.md) và tự động tạo đủ 3 file theo đúng thứ tự:
1. `data/briefs/<slug>.md` – Production Brief (cốt truyện, nhân vật, catalog asset, shot list, continuity map).
2. `data/songs/<slug>.md` – Song MD cho Suno (stylePrompt, metadata, lyrics phân đoạn).
3. `data/g-flow/<slug>-flow-16x9.json` – Google Flow JSON (danh sách cảnh 8s tự chứa, format 16:9, chuẩn Veo 3.1).

---

## 2. 4 Trụ Cột Kỹ Thuật Google Flow & Veo 3.1 (Bắt Buộc Tuân Thủ)

### 🎯 Trụ cột 1: Quy trình Image-to-Video (Khắc phục lỗi nhân vật không giống ảnh)
- **Vấn đề:** Text-to-Video với tag `@Tag` khiến Veo 3.1 tự vẽ lại nhân vật từ latent space, gây biến dạng mặt (face drift), lệch tuổi và đổi trang phục.
- **Giải pháp:**
  1. Chuyển sang **Image-to-Video (Frames-to-Video / Starting Frame)**: Frame đầu tiên của video là 100% pixel gốc từ ảnh. Veo chỉ animate tự nhiên mà không vẽ lại mặt.
  2. Mỗi scene trong JSON bổ sung `keyframe_prompt` (prompt tiếng Anh tỷ lệ 16:9 tạo ảnh mốc chuẩn cho scene) và `start_frame`.
  3. **Chaining Last Frame:** Trong cùng bối cảnh, lấy frame thứ 8s (Last Frame) của Cảnh N làm First Frame cho Cảnh N+1. Toàn bộ chuỗi cảnh sẽ liền mạch 100% pixel.

### 🎬 Trụ cột 2: Liền mạch & Hấp dẫn với Dynamic 3-Phase Motion (Khắc phục video đơ, thiếu hấp dẫn)
Mỗi cảnh 8 giây tuân thủ 3 pha:
- **Pha 1 (0.0s – 2.0s) Lead-in:** Chuyển động bắt nhịp ngay từ frame đầu (bước đi, vung tay nhảy múa theo phách trống đầu tiên của câu hát, không để đơ 1s đầu).
- **Pha 2 (2.0s – 6.5s) Core Hook:** Diễn xuất vũ đạo sinh động, nụ cười rạng rỡ, tương tác mắt với camera (phá vỡ bức tường thứ 4) tạo sự gắn kết và lôi cuốn khán giả nhí.
- **Pha 3 (6.5s – 8.0s) Dynamic Settle:** Nhân vật giảm tốc mượt mà về một tư thế rõ ràng (Readable Settle Pose, nụ cười rạng rỡ, nhịp thở tự nhiên, không đóng băng đơ cứng).
- Tận dụng tính năng **Extend Video (+4s/+8s)** trong Flow khi có trường đoạn vũ đạo/hành động kéo dài mượt mà.

### 👥 Trụ cột 3: Quản lý ngân sách 3 Ingredients (Google Flow 3-Slot Limit)
- Google Flow chỉ cho phép **tối đa 3 reference images (ingredients)** cho một lần sinh video.
- Mỗi cảnh bắt buộc `s.ingredients.length <= 3`. Phân bổ:
  * `Slot 1:` `@MainCharacter` (nhân vật chính)
  * `Slot 2:` `@SupportingCharacter` hoặc `@KeyProp` tương tác chính
  * `Slot 3:` `@Background` (hoặc nhân vật phụ thứ 2)
- Khi cảnh cần nhiều nhân vật (cả gia đình, nhóm bạn): **Ghép các nhân vật vào 1 ảnh Keyframe Start Frame trước (Composite Frame)**! Nạp ảnh này vào Flow làm First Frame -> tiêu tốn 0 ingredient slot mà vẫn hiển thị đầy đủ nhân vật.

### 🛡️ Trụ cột 4: Phòng tránh vi phạm chính sách Google Child Safety
- **TẮT "Enhance Prompt" trong Google Flow:** Không để LLM tự động chèn từ ngữ nhạy cảm về cơ thể.
- **CẤM từ ngữ giải phẫu/cơ thể:** Tuyệt đối KHÔNG dùng `chubby`, `plump`, `skin texture`, `soft skin`, `rosy lips`, `cheeks`, `bare skin`, `little 5-year-old kid/toddler`. Thay bằng tag định danh `@NhatMinh` hoặc `the young explorer`.
- **Trang phục bãi biển/nước bắt buộc:** `sun-protective long-sleeve UV rashguard swim shirt, knee-length swim shorts, bright child life vest, sun hat`. CẤM `swimsuit`, `bikini`, `shirtless`, `bare chest`, `bathing`.
- **Bối cảnh an toàn:** Không dùng `sleeping alone in bed`. Chủ đề Halloween/đêm dùng `cheerful festive illuminated celebration`, CẤM `horror`, `creepy`.

---

## 3. Lệnh Kiểm Tra Bắt Buộc Trước Khi Hoàn Tất
Sau khi tạo hoặc chỉnh sửa file Flow JSON:
```bash
npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:assemble -- data/g-flow/<slug>-flow-16x9.json
npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:validate -- data/g-flow/<slug>-flow-16x9.json
npm --prefix D:\projects\nextjs\packages\videos-song-generate run song:validate
```
Kết quả `flow:validate` phải đạt **0 error**. Mọi cảnh báo về giới hạn 3 ingredients và an toàn trẻ em phải được xử lý triệt để.

