# videos-song-generate

Khi người dùng đưa một **chủ đề bài hát/video** (ví dụ: "tạo bài hát về ...", "chủ đề: ..."), luôn đọc và làm theo [WORKFLOW.md](WORKFLOW.md) để tạo đủ 3 file:

1. `data/briefs/<slug>.md` – Production Brief (nội dung, nhân vật, chapter, ảnh reference, shot list)
2. `data/songs/<slug>.md` – Song MD cho Suno (style + lyrics)
3. `data/g-flow/<slug>-flow-16x9.json` – danh sách cảnh cho Google Flow, có `chapters` và tag ảnh `@...` đúng chapter
