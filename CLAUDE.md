# videos-song-generate

Khi người dùng đưa một **chủ đề bài hát/video** (ví dụ: "tạo bài hát về ...", "chủ đề: ..."), luôn đọc và làm theo [WORKFLOW.md](WORKFLOW.md) để tạo đủ 3 file:

1. `data/briefs/<slug>.md` – Production Brief (nội dung, nhân vật, cấu trúc cảnh và ảnh reference; chapter chỉ khi được yêu cầu)
2. `data/songs/<slug>.md` – Song MD cho Suno (style + lyrics)
3. `data/g-flow/<slug>-flow-16x9.json` – danh sách cảnh cho Google Flow, có catalog asset phẳng theo tag `@...`; thêm `chapters` chỉ khi người dùng yêu cầu chapter

## Liền mạch giữa các cảnh & 4 Trụ Cột Kỹ Thuật (bắt buộc cho file 3)

- **Đọc kỹ quy trình & kỹ thuật mới:** Trước khi viết `scenes`, đọc skill [.claude/skills/flow-scene-continuity/SKILL.md](.claude/skills/flow-scene-continuity/SKILL.md) và dùng câu chữ trong [references/prompt-templates.md](.claude/skills/flow-scene-continuity/references/prompt-templates.md).
- **Quy trình keyframe-first:** Quy trình keyframe-first (`project.generation_pipeline: "keyframe-first"`): chỉ viết trường nguồn (state, camera, locks, `label` cho mọi tag); `npm run flow:assemble` sinh riêng `scenes[].keyframe` (bước 1 — Flow tạo ẢNH, `keyframe.ingredients` ≤ 3, `keyframe.prompt` = ảnh tĩnh đúng start_state, ảnh duyệt lưu ở `keyframe.output_file`) và `scenes[].video` (bước 2 — Frames to Video, `video.first_frame` = ảnh keyframe, `video.prompt` chỉ mô tả chuyển động tới end_state, không @tag, không ingredients; object `video` có sẵn `cameraDirection`, `cameraLensAndAngle`, `start_state`, `scene_action`, `camera_move`, `end_state`). Không có trường `status`; không tạo video khi keyframe của cảnh đó chưa được duyệt. Extension `google-flow-scenes/chrome-extension` chạy đúng thứ tự Keyframe N → duyệt → Video N.
- **Giới hạn 3 Ingredients:** Google Flow chỉ có 3 slots reference images. Mọi cảnh bắt buộc `ingredients.length <= 3`. Cảnh đông nhân vật dùng Composite Keyframe Start Frame.
- **Dynamic 3-Phase Motion:** Mỗi cảnh 8s có 3 pha rõ ràng: Lead-in (0-2s) -> Core Hook (2-6.5s) -> Dynamic Settle (6.5-8s), tránh freeze đơ cứng. Tận dụng Extend Video cho vũ đạo dài.
- **Phòng chống vi phạm chính sách trẻ em:** TẮT Enhance Prompt; CẤM mô tả giải phẫu/da/cơ thể trẻ em; bãi biển/nước BẮT BUỘC dùng `sun-protective long-sleeve UV rashguard swim shirt + knee-length swim shorts + life vest`; Halloween dùng `cheerful festive illuminated celebration`.
- **Không chạm / không cận mặt trẻ em (lỗi thật: be-gai-gap-cua-bien scene 8 bị chặn "harmful content related to minors"):**
  - CẤM mọi từ chỉ tiếp xúc cơ thể khi có trẻ em, **kể cả trong `negativePrompt`**: `touch`/`touching`/`no touching`, `hand(s) inside`, `tickle`, `kiss`, `cuddle`, `caress`, `on her/his lap`, `undress`. Negative `child touching the crab` cũng bị đọc như prompt.
  - Thay bằng hành vi nhìn/khoảng cách: `just watches`, `looks from a safe distance`, `stays beside her mother`, `wags one finger side to side as a cheerful "we just look" sign`; negative chỉ ghi kết quả cần tránh về đạo cụ (`crab outside the basin`), không ghi hành động của trẻ.
  - CẤM camera nhắm vào mặt trẻ em: `push-in onto the girl's face`, `close-up on @X's face`. Khi có trẻ em, `camera_move` không chứa chữ `face`; ưu tiên `medium` / `medium-wide` giữ cả trẻ, người lớn và đạo cụ trong khung; cần cận thì cận **đạo cụ/hành động** (`on the crab in the basin, with the girl and the mother visible behind it`).
  - Khi bị chặn: đọc lại cả prompt **và** negativePrompt của cảnh đó, sửa trong generator `scripts/flows/<slug>.mjs` (không sửa tay JSON), chạy lại `flow:assemble` + `flow:validate`.
  - `npm run flow:validate` báo **error** cho các trường hợp trên (`checkChildSafety` trong `scripts/validate-flow.mjs`).
- Trước khi tạo/sửa Flow JSON, trích xuất nhân vật, trang phục, bối cảnh, đạo cụ và beat thành input manifest phẳng. Không tự tạo chapter nếu người dùng không yêu cầu.
- Nhân vật phải bám ảnh reference thật được chỉ định: dùng đúng ảnh/preset và mô tả nhận diện, tóc, trang phục nhìn thấy trong ảnh.
- Chỉ điền các trường (`start_state`, `scene_action`, `camera_move`, `end_state`, `transition_in`, `energy`, `prompt_blocks`, anchors, `label` cho mọi tag). **Không viết tay `prompt` / `keyframe` / `video`** – chạy `npm run flow:assemble -- <file>`.
- Chạy `npm run flow:validate -- <file>` và sửa đến khi **0 error**; dán kết quả vào câu trả lời.
- Không bao giờ viết `previous scene` / `previous clip` / `direct continuation` / `continue as` trong prompt – Veo sinh từng clip độc lập, liền mạch đến từ cặp `end_state` → `start_state` chép nguyên văn.
