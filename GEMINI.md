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
   - Quy trình keyframe-first (`project.generation_pipeline: "keyframe-first"`): chỉ viết trường nguồn (state, camera, locks, `label` cho mọi tag); `npm run flow:assemble` sinh riêng `scenes[].keyframe` (bước 1 — Flow tạo ẢNH, `keyframe.ingredients` ≤ 3, `keyframe.prompt` = ảnh tĩnh đúng start_state, ảnh duyệt lưu ở `keyframe.output_file`) và `scenes[].video` (bước 2 — Frames to Video, `video.first_frame` = ảnh keyframe, `video.prompt` chỉ mô tả chuyển động tới end_state, không @tag, không ingredients; object `video` có sẵn `cameraDirection`, `cameraLensAndAngle`, `start_state`, `scene_action`, `camera_move`, `end_state`). Không có trường `status`; không tạo video khi keyframe của cảnh đó chưa được duyệt. Extension `google-flow-scenes/chrome-extension` chạy đúng thứ tự Keyframe N → duyệt → Video N.
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
   - **Không chạm / không cận mặt trẻ em (lỗi thật: be-gai-gap-cua-bien scene 8 bị chặn "harmful content related to minors"):**
     - CẤM mọi từ chỉ tiếp xúc cơ thể khi có trẻ em, **kể cả trong `negativePrompt`**: `touch`/`touching`/`no touching`, `hand(s) inside`, `tickle`, `kiss`, `cuddle`, `caress`, `on her/his lap`, `undress`. Negative `child touching the crab` cũng bị đọc như prompt.
     - Thay bằng hành vi nhìn/khoảng cách: `just watches`, `looks from a safe distance`, `stays beside her mother`, `wags one finger side to side as a cheerful "we just look" sign`; negative chỉ ghi kết quả cần tránh về đạo cụ (`crab outside the basin`), không ghi hành động của trẻ.
     - CẤM camera nhắm vào mặt trẻ em: `push-in onto the girl's face`, `close-up on @X's face`. Khi có trẻ em, `camera_move` không chứa chữ `face`; ưu tiên `medium` / `medium-wide` giữ cả trẻ, người lớn và đạo cụ trong khung; cần cận thì cận **đạo cụ/hành động** (`on the crab in the basin, with the girl and the mother visible behind it`).
     - Khi bị chặn: đọc lại cả prompt **và** negativePrompt của cảnh đó, sửa trong generator `scripts/flows/<slug>.mjs` (không sửa tay JSON), chạy lại `flow:assemble` + `flow:validate`.
     - `npm run flow:validate` báo **error** cho các trường hợp trên (`checkChildSafety` trong `scripts/validate-flow.mjs`).

---

## 3. Công Cụ & Kiểm Tra
- Assemble prompt: `npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:assemble -- data/g-flow/<slug>-flow-16x9.json`
- Kiểm tra tính hợp lệ: `npm --prefix D:\projects\nextjs\packages\videos-song-generate run flow:validate -- data/g-flow/<slug>-flow-16x9.json` (bắt buộc 0 error).

