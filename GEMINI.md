# Antigravity & Gemini Rules for videos-song-generate

Tài liệu cấu hình và quy tắc cho **Antigravity** khi làm việc trong package `videos-song-generate`.

---

## 1. Mục Tiêu & Quy Trình 3 File
Khi nhận yêu cầu tạo video/bài hát:
1. Đọc kỹ [WORKFLOW.md](WORKFLOW.md) và skill `.agents/skills/flow-scene-continuity/SKILL.md`.
2. Tạo đủ 3 file:
   - `data/briefs/<slug>.md`
   - `data/songs/<slug>.md`
   - `data/g-flow/<slug>-flow-16x9.json`

---

## 2. Kỹ Thuật Google Flow / Veo 3.1 Cốt Lõi

1. **Image-to-Video First:**
   - Để nhân vật giống 100% ảnh reference, sử dụng kỹ thuật **Frames-to-Video (Start Frame)**.
   - Thêm `keyframe_prompt` (16:9, cinematic photoreal, plain background hoặc context) trong từng scene để người dùng tạo ảnh mốc.
   - Sử dụng **Chaining Last Frame** (frame 8s của cảnh trước là frame 0s của cảnh sau) để liền mạch pixel.
2. **3-Slot Ingredient Limit:**
   - Mỗi cảnh **tối đa 3 tags `@` trong `ingredients`**. Không bao giờ vượt quá 3 tags vì Flow chỉ có 3 slots.
   - Cảnh có > 3 nhân vật: Dùng **Composite Keyframe** (ghép cả nhóm vào 1 ảnh Start Frame).
3. **Dynamic 3-Phase Motion:**
   - Pha 1 (0-2s): Lead-in bắt nhịp câu hát ngay lập tức.
   - Pha 2 (2-6.5s): Diễn xuất, vũ đạo, nụ cười, eye-contact thân thiện với camera.
   - Pha 3 (6.5-8s): Dynamic Settle mượt mà (không freeze đơ).
4. **Child Safety Compliance (Chống chặn chính sách):**
   - Hướng dẫn người dùng TẮT toggle "Enhance Prompt" trong Google Flow UI.
   - CẤM mô tả giải phẫu, cơ thể trẻ em (`chubby`, `plump`, `skin texture`, `rosy lips`, `cheeks`, `bare skin`).
   - Cảnh biển/bơi: Luôn dùng `sun-protective long-sleeve UV rashguard swim shirt, knee-length swim shorts, bright child life vest`. CẤM `swimsuit`, `bikini`, `shirtless`, `bare chest`, `bathing`.
   - Cảnh Halloween/đêm: Dùng `cheerful festive illuminated celebration`, CẤM `horror`, `creepy`.

---

## 3. Công Cụ & Kiểm Tra
- Assemble prompt: `npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:assemble -- data/g-flow/<slug>-flow-16x9.json`
- Kiểm tra tính hợp lệ: `npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:validate -- data/g-flow/<slug>-flow-16x9.json` (bắt buộc 0 error).

