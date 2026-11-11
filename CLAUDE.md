# videos-song-generate

Khi người dùng đưa một **chủ đề bài hát/video** (ví dụ: "tạo bài hát về ...", "chủ đề: ..."), luôn đọc và làm theo [WORKFLOW.md](WORKFLOW.md) để tạo đủ 3 file:

1. `data/briefs/<slug>.md` – Production Brief (nội dung, nhân vật, cấu trúc cảnh và ảnh reference; chapter chỉ khi được yêu cầu)
2. `data/songs/<slug>.md` – Song MD cho Suno (style + lyrics)
3. `data/g-flow/<slug>-flow-16x9.json` – danh sách cảnh cho Google Flow, có catalog asset phẳng theo tag `@...`; thêm `chapters` chỉ khi người dùng yêu cầu chapter

## Liền mạch giữa các cảnh & 4 Trụ Cột Kỹ Thuật (bắt buộc cho file 3)

- **Đọc kỹ quy trình & kỹ thuật mới:** Trước khi viết `scenes`, đọc skill [.claude/skills/flow-scene-continuity/SKILL.md](.claude/skills/flow-scene-continuity/SKILL.md) và dùng câu chữ trong [references/prompt-templates.md](.claude/skills/flow-scene-continuity/references/prompt-templates.md).
- **Quy trình Image-to-Video (First Frame):** Khắc phục lỗi lệch nhân vật bằng cách cung cấp `keyframe_prompt` và áp dụng Chaining Last Frame (frame 8s của cảnh trước là frame 0s của cảnh sau).
- **Giới hạn 3 Ingredients:** Google Flow chỉ có 3 slots reference images. Mọi cảnh bắt buộc `ingredients.length <= 3`. Cảnh đông nhân vật dùng Composite Keyframe Start Frame.
- **Dynamic 3-Phase Motion:** Mỗi cảnh 8s có 3 pha rõ ràng: Lead-in (0-2s) -> Core Hook (2-6.5s) -> Dynamic Settle (6.5-8s), tránh freeze đơ cứng. Tận dụng Extend Video cho vũ đạo dài.
- **Phòng chống vi phạm chính sách trẻ em:** TẮT Enhance Prompt; CẤM mô tả giải phẫu/da/cơ thể trẻ em; bãi biển/nước BẮT BUỘC dùng `sun-protective long-sleeve UV rashguard swim shirt + knee-length swim shorts + life vest`; Halloween dùng `cheerful festive illuminated celebration`.
- Trước khi tạo/sửa Flow JSON, trích xuất nhân vật, trang phục, bối cảnh, đạo cụ và beat thành input manifest phẳng. Không tự tạo chapter nếu người dùng không yêu cầu.
- Nhân vật phải bám ảnh reference thật được chỉ định: dùng đúng ảnh/preset và mô tả nhận diện, tóc, trang phục nhìn thấy trong ảnh.
- Chỉ điền các trường (`start_state`, `scene_action`, `camera_move`, `end_state`, `transition_in`, `energy`, `prompt_blocks`, anchors, `keyframe_prompt`). **Không viết tay `prompt`** – chạy `npm run flow:assemble -- <file>`.
- Chạy `npm run flow:validate -- <file>` và sửa đến khi **0 error**; dán kết quả vào câu trả lời.
- Không bao giờ viết `previous scene` / `previous clip` / `direct continuation` / `continue as` trong prompt – Veo sinh từng clip độc lập, liền mạch đến từ cặp `end_state` → `start_state` chép nguyên văn.
