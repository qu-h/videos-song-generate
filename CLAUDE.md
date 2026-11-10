# videos-song-generate

Khi người dùng đưa một **chủ đề bài hát/video** (ví dụ: "tạo bài hát về ...", "chủ đề: ..."), luôn đọc và làm theo [WORKFLOW.md](WORKFLOW.md) để tạo đủ 3 file:

1. `data/briefs/<slug>.md` – Production Brief (nội dung, nhân vật, cấu trúc cảnh và ảnh reference; chapter chỉ khi được yêu cầu)
2. `data/songs/<slug>.md` – Song MD cho Suno (style + lyrics)
3. `data/g-flow/<slug>-flow-16x9.json` – danh sách cảnh cho Google Flow, có catalog asset phẳng theo tag `@...`; thêm `chapters` chỉ khi người dùng yêu cầu chapter

## Liền mạch giữa các cảnh (bắt buộc cho file 3)

- Trước khi viết `scenes`, đọc skill [.claude/skills/flow-scene-continuity/SKILL.md](.claude/skills/flow-scene-continuity/SKILL.md) và dùng câu chữ trong [references/prompt-templates.md](.claude/skills/flow-scene-continuity/references/prompt-templates.md).
- Trước khi tạo/sửa Flow JSON, trích xuất nhân vật, trang phục, bối cảnh, đạo cụ và beat thành input manifest phẳng. Không tự tạo chapter nếu người dùng không yêu cầu. Nếu input có chapter breakdown hoặc người dùng yêu cầu chapter, giữ nguyên thứ tự và đối chiếu mọi cảnh với manifest đó.
- Nhân vật phải bám ảnh reference thật được chỉ định: dùng đúng ảnh/preset và mô tả nhận diện, tóc, trang phục nhìn thấy trong ảnh; không thay bằng chi tiết suy ra từ lời bài hát hay Brief cũ. Nếu không truy cập được ảnh thì không tự nhận đã đối chiếu ảnh; giữ ảnh/tag nguồn và ghi rõ cần xác minh.
- Trước khi hoàn tất, đối chiếu catalog `tag | type | asset_file | used_in_scenes` và mọi beat đầu vào với scene. Chỉ kiểm bảng/tổng chapter nếu người dùng chọn chapter mode.
- Chỉ điền các trường (`start_state`, `scene_action`, `camera_move`, `end_state`, `transition_in`, `energy`, `prompt_blocks`, anchors). **Không viết tay `prompt`** – chạy `npm run flow:assemble -- <file>`.
- Chạy `npm run flow:validate -- <file>` và sửa đến khi **0 error**; dán kết quả vào câu trả lời.
- Mẫu chuẩn đã pass validator: [data/g-flow/examples/continuity-sample-4-scenes.json](data/g-flow/examples/continuity-sample-4-scenes.json).
- Không bao giờ viết `previous scene` / `previous clip` / `direct continuation` / `continue as` trong prompt – Veo sinh từng clip độc lập, liền mạch đến từ cặp `end_state` → `start_state` chép nguyên văn.
