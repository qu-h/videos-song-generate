# 🎬 WORKFLOW: Chủ đề → Bài hát Suno → Video Google Flow

> File này là **quy trình chuẩn cho AI**. Khi người dùng chỉ đưa một **chủ đề** (ví dụ: *"Nhật Minh đi tắm biển"*), AI phải đọc file này và tự tạo **đủ 3 file đầu ra** theo đúng thứ tự, đúng định dạng bên dưới — không hỏi lại trừ khi chủ đề thực sự mơ hồ.

---

## 0. Tổng quan đầu ra

| # | File | Đường dẫn | Dùng cho |
|---|------|-----------|----------|
| 1 | **Production Brief** – mô tả nội dung, danh sách nhân vật/asset, bối cảnh và cảnh quay (chapter nếu được yêu cầu) | `data/briefs/<slug>.md` | Người dùng duyệt + tạo ảnh reference |
| 2 | **Song MD** – chủ đề, style, lời bài hát cho Suno | `data/songs/<slug>.md` | Dán vào Suno |
| 3 | **Google Flow JSON** – danh sách cảnh để Flow tạo video tự động | `data/g-flow/<slug>-flow-16x9.json` | Nạp vào Google Flow |

`<slug>` = tên bài hát viết thường, bỏ dấu, nối bằng `-` (giống `toSlug()` trong [scripts/new-song.mjs](scripts/new-song.mjs)). Ví dụ: *"Nhật Minh đi tắm biển"* → `nhat-minh-di-tam-bien`.

---

## 0b. 4 NGUYÊN TẮC CỐT LÕI GOOGLE FLOW & VEO 3.1 (GIẢI QUYẾT 4 VẤN ĐỀ LỚN)

### 🎯 Nguyên Tắc 1: Tạo Video Từ Ảnh (Image-to-Video / Keyframe-First) Để Giữ Nhân Vật Giống 100%
- **Bản chất vấn đề:** Khi dùng Text-to-Video thuần với tag `@NhatMinh`, mô hình Veo 3.1 chỉ coi ảnh upload như một gợi ý phong cách (semantic guidance) và tự vẽ lại nhân vật từ không gian tiềm ẩn (latent noise). Hậu quả: mặt bé bị trôi danh tính (face drift), lệch tuổi, biến đổi kiểu tóc hoặc trang phục.
- **Giải pháp:** **Chuyển dịch sang quy trình Image-to-Video (Frames-to-Video / Starting Frame)**:
  1. Mỗi cảnh (hoặc ít nhất cảnh mở đầu mỗi bối cảnh/chuỗi hành động) được cung cấp một **Keyframe Image (Start Frame)** được sinh từ mô hình tạo ảnh (Midjourney, Flux, Imagen 3, Nano Banana, InstantID...) khớp 100% nhân vật gốc.
  2. Nạp ảnh Keyframe này vào ô **First Frame** trong Google Flow. Khung hình đầu tiên (Frame 0s) của video được khoá cứng 100% pixel gốc, Veo chỉ animate (tạo chuyển động) mà không vẽ lại mặt, triệt tiêu hoàn toàn lỗi lệch nhân vật!
  3. Quy trình keyframe-first (`project.generation_pipeline: "keyframe-first"`): chỉ viết trường nguồn (state, camera, locks, `label` cho mọi tag); `npm run flow:assemble` sinh riêng `scenes[].keyframe` (bước 1 — Flow tạo ẢNH, `keyframe.ingredients` ≤ 3, `keyframe.prompt` = ảnh tĩnh đúng start_state, ảnh duyệt lưu ở `keyframe.output_file`) và `scenes[].video` (bước 2 — Frames to Video, `video.first_frame` = ảnh keyframe, `video.prompt` chỉ mô tả chuyển động tới end_state, không @tag, không ingredients; object `video` có sẵn `cameraDirection`, `cameraLensAndAngle`, `start_state`, `scene_action`, `camera_move`, `end_state`). Không có trường `status`; không tạo video khi keyframe của cảnh đó chưa được duyệt. Extension `google-flow-scenes/chrome-extension` chạy đúng thứ tự Keyframe N → duyệt → Video N.

### 🎬 Nguyên Tắc 2: Liền Mạch Tuyệt Đối & Tăng Tính Hấp Dẫn (Dynamic Engagement & Last-Frame Chaining)
- **Bản chất vấn đề:** Video AI ghép lại thường bị đơ, giật cục, thiếu nhịp điệu sinh động ("không hấp dẫn") hoặc bị đơ 1-2 giây cuối do lạm dụng đóng băng tư thế.
- **Giải pháp:**
  1. **Chaining Last Frame (Pixel-Level Continuity):** Trong cùng một bối cảnh (cùng chapter/setting), sau khi render Cảnh N, tải/chụp **Last Frame (khung hình thứ 8s)** của take đẹp nhất làm **First Frame** cho Cảnh N+1. Chuỗi video sẽ liền mạch tuyệt đối từng pixel.
  2. **Quy tắc 3 Pha Hành Động Sinh Động (Dynamic 3-Phase Motion):**
     - **Pha 1 (0.0s – 2.0s) Lead-in:** Chuyển động bắt nhịp ngay từ frame đầu (bước đi, vung tay nhảy múa theo phách trống đầu tiên của câu hát, không để đơ 1s đầu).
     - **Pha 2 (2.0s – 6.5s) Core Hook:** Diễn xuất vũ đạo sinh động, nụ cười tươi tắn, tương tác mắt với camera (phá vỡ bức tường thứ 4) tạo sự gắn kết và lôi cuốn khán giả nhí.
     - **Pha 3 (6.5s – 8.0s) Dynamic Settle:** Nhân vật giảm tốc mượt mà về một tư thế rõ ràng (Readable Settle Pose, nụ cười rạng rỡ, nhịp thở tự nhiên, không đóng băng đơ cứng).
  3. **Tận dụng tính năng "Extend Video" (+4s/+8s):** Với các trường đoạn vũ đạo/hành động kéo dài, ưu tiên dùng Extend trực tiếp trên Google Flow thay vì cắt clip mới.

### 👥 Nguyên Tắc 3: Quản Lý Ngân Sách 3 Ingredients (Strict 3-Slot Budget & Composite Keyframe)
- **Bản chất vấn đề:** Google Flow / Veo 3.1 có giới hạn cứng: **tối đa 3 reference images (ingredients)** cho một lần sinh video. Nếu một cảnh tag 4-5 items (`@NhatMinh`, `@Bo`, `@Me`, `@Beach`, `@RedBucket`), Flow sẽ từ chối hoặc bỏ sót ảnh tham chiếu.
- **Giải pháp:**
  1. **Quy tắc 3-Slot Budget nghiêm ngặt:** Bất kỳ scene nào cũng chỉ được chứa tối đa 3 tags `@` trong `ingredients`:
     - `Slot 1:` `@MainCharacter` (nhân vật chính)
     - `Slot 2:` `@SupportingCharacter` hoặc `@KeyProp` tương tác trong cảnh
     - `Slot 3:` `@Background` (hoặc nhân vật phụ thứ 2)
  2. **Chiến lược Composite Keyframe (Start Frame đa nhân vật):** Khi cảnh cần cả gia đình (Bố, Mẹ, Bé) hoặc nhóm đông bạn bè, hãy **ghép các nhân vật vào 1 ảnh Keyframe Start Frame trước** bằng AI tạo ảnh! Nạp ảnh tổng hợp này vào Flow làm First Frame (Image-to-Video). Lúc này Flow xem toàn bộ nhóm là 1 ảnh nguồn duy nhất -> Không tốn slot ingredient nào và không bị giới hạn 3 references!
  3. **Luân phiên phân cảnh (Shot Rotation):** Chia nhỏ các câu hát để quay cặp đôi (Bé & Bố -> Bé & Mẹ -> Bé cận cảnh) thay vì nhồi nhét tất cả vào mọi cảnh.

### 🛡️ Nguyên Tắc 4: Phòng Tránh Vi Phạm Chính Sách An Toàn Trẻ Em (Minors Policy Guard)
- **Bản chất vấn đề:** Google áp dụng bộ lọc bảo vệ trẻ em cực kỳ khắt khe (Zero Tolerance for Child Risk, False-Positive rất cao). Các từ ngữ về cơ thể trẻ em, trang phục tắm, phòng ngủ một mình dễ kích hoạt lỗi *"This generation might violate our policies"*.
- **Giải pháp an toàn tuyệt đối:**
  1. **TẮT tính năng "Enhance Prompt" trong Google Flow:** Tính năng này tự động gọi LLM viết thêm mô tả hoa mỹ (như `delicate skin`, `tight outfit`) làm kích hoạt ngay lập tức bộ lọc vi phạm.
  2. **CẤM mô tả giải phẫu, da thịt, tuổi tác:**
     - Tuyệt đối KHÔNG dùng: `chubby`, `plump`, `skin texture`, `bare skin`, `rosy lips`, `cheeks`, `little 5-year-old kid/toddler`.
     - Thay bằng tên định danh: `@NhatMinh`, `@NhatAnh` hoặc danh xưng trung tính: `the young explorer`, `the hero`, `the student`.
     - Chỉ tập trung miêu tả **kiểu tóc, trang phục và biểu cảm nụ cười**.
  3. **Chuẩn hóa trang phục an toàn (Đặc biệt chủ đề Biển / Nước):**
     - Tuyệt đối KHÔNG viết: `swimsuit`, `bikini`, `swimwear`, `shirtless`, `bare chest`, `bathing`.
     - LUÔN quy định trang phục biển chuẩn: `sun-protective long-sleeve UV rashguard swim shirt, knee-length swim shorts, bright child life vest, sun hat`. Kín đáo, văn minh và hoàn toàn miễn nhiễm với bộ lọc an toàn.
  4. **Bối cảnh an toàn:** Tránh cảnh trẻ em ngủ một mình trên giường trong phòng tối (`sleeping alone in bed`). Với Halloween/ban đêm, luôn mô tả là `cheerful festive evening street illuminated with glowing warm lanterns, family-friendly celebration`.

---

**Thứ tự bắt buộc:** Brief (1) → Song (2) → Flow JSON (3). File sau phải dùng đúng tên nhân vật, tag và lời bài hát của file trước. Không tự tạo chapter nếu người dùng không yêu cầu.

**Công cụ bắt buộc cho bước 3 (Flow JSON):**

| Lệnh | Việc |
|---|---|
| Skill [.claude/skills/flow-scene-continuity/SKILL.md](.claude/skills/flow-scene-continuity/SKILL.md) | Bộ rule liền mạch 5 lớp + [prompt templates](.claude/skills/flow-scene-continuity/references/prompt-templates.md) tiếng Anh dùng nguyên văn. **Đọc trước khi viết `scenes`.** |
| `npm run flow:assemble -- data/g-flow/<slug>-flow-16x9.json` | Ghép máy `scenes[].prompt` từ các khối lock + state theo đúng thứ tự, tự điền `ingredients`. AI **không tự tay viết `prompt`**. |
| `npm run flow:validate -- data/g-flow/<slug>-flow-16x9.json` | Kiểm tra liền mạch (handoff, cụm cấm, anchor, cut grammar, timecode, tag). Phải **0 error** mới được coi là xong. |

File mẫu đã pass validator 0 error / 0 warning: [data/g-flow/examples/continuity-sample-4-scenes.json](data/g-flow/examples/continuity-sample-4-scenes.json) — bắt chước cấu trúc và cách viết state của file này.

---

## 1. Đầu vào từ người dùng

Tối thiểu chỉ cần **chủ đề**. Các tham số còn lại dùng mặc định nếu người dùng không nói:

| Tham số | Mặc định |
|---------|----------|
| Nhân vật chính | `@NhatMinh` – bé trai Nhật Minh (ảnh reference đã có sẵn trong Flow) |
| Khán giả | Thiếu nhi 3–8 tuổi |
| Thể loại nhạc | Tự chọn theo chủ đề (vui → pop/EDM thiếu nhi; nhẹ nhàng → acoustic/lofi) |
| Thời lượng bài hát dự kiến | ~3:00–3:30 |
| Mô hình video | **Veo 3.1** trong Google Flow (tài khoản Google AI Pro) — cố định |
| Thời lượng mỗi cảnh | **8 giây — cố định** (mức tối đa của Veo 3.1 mỗi lần tạo). Không dùng 10 giây |
| Khung hình | 16:9 landscape, 1920×1080 |
| Phong cách hình ảnh | Photorealistic cinematic live-action children's music video |
| Cấu trúc Flow | Manifest phẳng theo asset là mặc định; chỉ dùng chapter khi người dùng yêu cầu hoặc input chỉ định rõ |

Nếu người dùng đưa thêm nhân vật phụ (ví dụ `@NhatAnh`, `@GoldenCat`), thêm vào bảng nhân vật.

---

## 2. Cấu trúc asset và Chapter trong Google Flow

Mặc định, người dùng cần **danh sách nhân vật/ảnh reference để upload**, không cần tạo chapter. Dùng manifest phẳng:

- `project.manifest_mode: "flat"` và `project.reference_assets[]` là catalog duy nhất, mỗi tag có một record với `tag`, `type`, file (`asset_file`/`source_file`), `render_style`, `appearance_lock` nếu là character/prop, và `used_in_scenes`.
- Chia catalog thành `project.characters[]`, `project.props[]`, `project.backgrounds[]` để người dùng nhìn và upload dễ dàng. `project.upload_instructions[]` nêu file nào dùng chung nhiều cảnh.
- Scene phẳng không có `chapter_id`, `flow_chapter_name`, `bridge_in/out` hoặc `chapters[]`. Scene tự khai báo `background_reference`, ingredients, state và prompt đầy đủ.
- `npm run flow:assemble` ở flat mode giữ nguyên prompt tự chứa, đồng bộ ingredients từ tag prompt; validator đối chiếu tag với catalog và kiểm tra continuity/timecode.
- Không chuyển scene thành chapter chỉ vì thay bối cảnh. Mỗi bối cảnh vẫn là một background asset riêng trong catalog.

Chỉ áp dụng các quy tắc chapter dưới đây khi người dùng yêu cầu chapter hoặc nguồn đã có chapter breakdown cần giữ nguyên.

Google Flow hiện có **Chapter**. Quy ước trong dự án này:

- **1 chapter = 1 nhóm cảnh liên tiếp dùng chung bối cảnh + trang phục + bộ ảnh reference (ingredients).**
- **Nguồn chapter là chỉ dẫn chapter của người dùng.** Nếu người dùng gửi chapter/scene breakdown thì giữ nguyên số lượng, thứ tự và ranh giới ý nghĩa; không tự gộp chapter vì cùng bối cảnh. Nếu chỉ gửi chủ đề, suy ra chapter theo các lần đổi bối cảnh/trang phục và liệt kê rõ trong Brief trước khi viết scene. Không để số chapter mặc định 3–6 ghi đè danh sách thực tế.
- Mỗi scene phải được gắn với beat/câu hát cụ thể từ input manifest. Scene không được chuyển sang chapter khác chỉ để cân số lượng. Trước khi bàn giao, so từng cảnh với bối cảnh, trang phục, nhân vật và đạo cụ đúng chapter.
- Mỗi chapter có **danh sách ảnh reference riêng**, mỗi ảnh có một **tag `@Ten`** (PascalCase, không dấu, không khoảng trắng).
- Ảnh nhân vật chính (`@NhatMinh`) là **ảnh dùng chung (global)** – được tag ở mọi chapter.
- Ảnh bối cảnh / đạo cụ / trang phục đặc biệt là **ảnh của chapter** – chỉ được tag trong các cảnh thuộc chapter đó.

### Quy tắc tag ảnh (bắt buộc)

1. Mỗi cảnh có trường `chapter_id` trỏ đúng chapter chứa nó.
2. Trường `ingredients` của cảnh **chỉ được chứa** tag global + tag khai báo trong `chapters[].ingredients` của chính chapter đó. **Không** tag ảnh của chapter khác.
3. Gọi nhân vật / bối cảnh / đạo cụ trong prompt **bằng tag `@`** (ví dụ `@NhatMinh`, `@GoldenCat`, `@CozyFloorRoom`) — Flow nhận diện ảnh reference qua tag này. Câu đầu tiên của `prompt` luôn là:
   `Use the approved uploaded character reference for @NhatMinh.`
   và câu bối cảnh luôn nêu tag + chapter: `@Beach is the fixed approved background reference of Chương 2 – Bãi biển.`
4. Mọi tag xuất hiện trong `prompt` phải có trong `ingredients` của cảnh, và ngược lại.
5. Tag viết **giống hệt** tên ảnh đã đặt trong Flow (phân biệt hoa thường), không thêm dấu chấm/dấu phẩy dính liền sau tag nếu Flow không nhận (an toàn nhất: `@NhatMinh ` có khoảng trắng phía sau).
6. Cảnh đầu tiên của mỗi chapter có `start_state` riêng mô tả việc nhân vật "đến" bối cảnh mới (bước qua cửa, xuất hiện từ mép trái khung hình…) — không copy `end_state` của chapter trước vì bối cảnh đã đổi, nhưng phải giữ nguyên trang phục/đạo cụ đang cầm nếu chưa có lý do đổi.
7. Tên chapter trong JSON phải **giống y hệt** tên chapter người dùng tạo trong Flow: `"Chương <số> – <Tên ngắn>"`.

---

## 3. BƯỚC 1 – Tạo Production Brief `data/briefs/<slug>.md`

Mục đích: mô tả đầy đủ để người dùng duyệt và **tạo ảnh reference trước** khi sinh video.

### Template

````markdown
---
slug: "<slug>"
title: "<Tên bài hát>"
topic: "<chủ đề người dùng đưa>"
audience: "Thiếu nhi 3–8 tuổi"
mood: "<vui nhộn / ấm áp / phiêu lưu ...>"
estimatedDuration: "03:20"
sceneDurationSeconds: 8
totalScenes: 25
aspectRatio: "16:9"
visualStyle: "photorealistic cinematic live-action children's music video"
createdAt: "<YYYY-MM-DD>"
files:
  song: "data/songs/<slug>.md"
  flow: "data/g-flow/<slug>-flow-16x9.json"
---

# <Tên bài hát> – Production Brief

## 1. Ý tưởng & thông điệp
- **Logline (1 câu):** ...
- **Thông điệp cho bé:** ... (bài học nhẹ nhàng, tích cực)
- **Mạch cảm xúc:** tò mò → hào hứng → thử thách nhỏ → vượt qua → ăn mừng

## 2. Cốt truyện theo cấu trúc bài hát
| Phần nhạc | Nội dung câu chuyện |
|-----------|--------------------|
| Intro | ... |
| Verse 1 | ... |
| Pre-Chorus | ... |
| Chorus | ... |
| Verse 2 | ... |
| Bridge | ... |
| Final Chorus / Outro | ... |

## 3. Nhân vật (Character Bible)
### @NhatMinh (global – dùng mọi chapter)
- **Mô tả:** bé trai Việt Nam ~5 tuổi, ... (khuôn mặt, tóc, dáng)
- **Trang phục chính:** ...
- **Tính cách thể hiện trên hình:** ...
- **Ảnh reference:** dùng ảnh có sẵn trong Flow, tag `@NhatMinh`

### @<NhânVậtPhụ> (nếu có)
- **Mô tả chi tiết ngoại hình (màu, kích thước, đặc điểm nhận dạng không đổi):** ...
- **Prompt tạo ảnh reference:**
  ```text
  <English image prompt, plain background, full body, front 3/4 view, photorealistic, 16:9>
  ```

## 4. Chapter & ảnh reference (Ingredients)
| Chapter | Tên chapter trong Flow | Cảnh | Bối cảnh | Trang phục | Tag ảnh |
|---------|------------------------|------|----------|-----------|---------|
| ch1 | Chương 1 – Phòng ngủ | 1–5 | ... | ... | @NhatMinh, @Bedroom |
| ch2 | Chương 2 – ... | 6–12 | ... | ... | @NhatMinh, @Beach, @RedBucket |

### Ảnh cần tạo trước (theo chapter)
#### Chương 1 – <Tên>
- `@Bedroom` – mô tả: ...
  ```text
  <English image prompt cho bối cảnh: wide establishing shot, no people, 16:9, layout cố định trái/phải/giữa>
  ```
#### Chương 2 – <Tên>
- `@Beach` – ...
- `@RedBucket` (đạo cụ) – ...

## 5. Bảng phân cảnh (Shot List)
| # | Chapter | Thời gian | Lời hát tương ứng | Hành động | Shot / Camera | Tag |
|---|---------|-----------|-------------------|-----------|---------------|-----|
| 1 | ch1 | 00:00–00:08 | [Intro] | ... | wide, dolly-in | @NhatMinh @Bedroom |
| 2 | ch1 | 00:08–00:16 | "Câu hát..." | ... | medium, slide L→R | @NhatMinh @Bedroom |

## 5b. Continuity Map (duyệt TRƯỚC khi viết prompt)
> Bảng này quyết định độ liền mạch. Kiểm tra theo skill `flow-scene-continuity` mục 3–4: shot đổi 1–2 nấc, không 2 cảnh liền cùng shot + máy, energy đổi ≤ 1 nấc (+2 khi vào Chorus), cảnh cuối chapter hướng về screen-right, cảnh đầu chapter `exit-enter` / `match-pose`.

| # | Ch | Energy | Shot | Camera | transition_in | Frame cuối (tóm tắt) | Đạo cụ trong khung |
|---|----|--------|------|--------|---------------|----------------------|--------------------|
| 1 | ch1 | 2 | WS→MS | dolly push-in | hold | đứng center-right, facing camera, cầm @RedBucket 2 tay | @RedBucket |
| 2 | ch1 | 3 | MW | static | hold | đi ra khỏi khung bên phải, khung trống 1 s (**bridge_out**) | @RedBucket (mang theo) |
| 3 | ch2 | 3 | WS | tracking L→R | exit-enter | đứng center, 3/4 camera, xô ở tay phải (**bridge_in**) | @RedBucket |
| 4 | ch2 | 4 | MS | static | hold | facing camera, giơ xô lên cao, 2 s cuối đứng yên | @RedBucket |

## 6. Bảng màu & âm hưởng hình ảnh (neo toàn video)
- **Palette (`palette_anchor`):** 3 màu chủ đạo + 1 màu nhấn, dùng cho mọi chapter: ...
- **Hướng sáng (`light_direction_anchor`):** key light luôn từ screen-left; từng chapter chỉ đổi màu/độ ấm: ch1 ..., ch2 ...
- **Chất hình (`style_anchor`):** ống kính, grade, grain – một câu duy nhất, chép vào mọi cảnh.
- **Đạo cụ xuyên suốt (`anchor_props`):** 1–2 món đi theo nhân vật qua mọi chapter: ...
- **Hiệu ứng vui cho bé:** bong bóng, confetti, lấp lánh … (tiết chế, không rối khung)

## 7. An toàn nội dung
- Không: hành động nguy hiểm, máu, sợ hãi, khóc lóc kéo dài, vũ khí, chữ/logo trong hình.
- Các lưu ý riêng theo chủ đề: ... (ví dụ chủ đề biển: luôn có phao/người lớn ở xa, nước nông)

## 8. Checklist cho người dùng
- [ ] Duyệt cốt truyện & lời bài hát
- [ ] Tạo ảnh reference theo mục 4, đặt đúng tag
- [ ] Tạo chapter trong Flow đúng tên, upload ảnh vào chapter tương ứng
- [ ] Tạo nhạc Suno → cập nhật `audio.duration` → chỉnh số cảnh nếu lệch
- [ ] Nạp JSON vào Flow, sinh video theo từng chapter
````

### Quy tắc khi viết Brief
- Số cảnh = `ceil(thời lượng dự kiến / sceneDurationSeconds)`. Ví dụ 3:20 = 200s, cảnh 8s → 25 cảnh.
- Mỗi chapter 3–8 cảnh. Đổi chapter khi đổi bối cảnh hoặc trang phục.
- Mỗi cảnh **một hành động chính**, dễ đọc với trẻ nhỏ, và **kết thúc ở một tư thế tĩnh dễ tả lại** (đứng thẳng, ngồi xuống, giơ tay…) để cảnh sau bắt đầu đúng từ tư thế đó — đây là khớp nối giữa các cảnh.
- Chorus lặp lại → hình ảnh có **motif lặp** (cùng động tác/vũ đạo) nhưng đổi góc máy.
- Bối cảnh mô tả bố cục cố định (cái gì bên trái/phải/giữa) để không bị lật gương giữa các cảnh.
- Thêm mục `Input Coverage`: liệt kê nguyên thứ tự chapter nguồn và map tất cả beat/chi tiết bắt buộc tới `chapter_id` + scene number. Nếu đầu vào chỉ là chủ đề, ghi đây là chapter breakdown do AI đề xuất.
- Thêm mục `Reference Audit`: ghi ảnh/preset đã dùng cho từng nhân vật và xác nhận mô tả costume/kiểu tóc lấy từ ảnh. Không truy cập được ảnh thì ghi rõ chưa xác minh; không bịa chi tiết.
- Trước khi xuất JSON, so lại `setting`, `costume`, character appearance lock, `scene_action`, ingredient tags ở từng scene với chapter manifest. Không dùng tag/costume/background chapter khác nếu chapter hiện tại không khai báo dùng chung.

---

## 4. BƯỚC 2 – Tạo Song MD `data/songs/<slug>.md`

Theo đúng định dạng file mẫu [data/songs/bay-cung-co-lau.md](data/songs/bay-cung-co-lau.md) để pass `npm run validate` ([scripts/validate-songs.mjs](scripts/validate-songs.mjs)).

### Template

````markdown
---
title: "<Tên bài hát>"
slug: "<slug>"
artist: "Quân & Suno AI"
genre: "<Thể loại>"
tags: ["#thieu-nhi", "#nhatminh", "#<chu-de>", "#vietnamese-kids-song"]
status: "prompt_ready"
createdAt: "<YYYY-MM-DD>"
updatedAt: "<YYYY-MM-DD>"
brief: "data/briefs/<slug>.md"
flow: "data/g-flow/<slug>-flow-16x9.json"

suno:
  model: "v4.5"
  stylePrompt: "<style prompt – xem quy tắc bên dưới>"
  lyricsPrompt: "<1–2 câu tóm tắt chủ đề, dùng khi cần Suno tự viết lại lời>"
  clipId: ""
  songUrl: ""
  taskStatus: "pending"
  tempo: "<số> bpm"
  vocalType: "<child / female / male / duet>"

audio:
  audioUrl: ""
  duration: ""
  durationSeconds: 0
  takeVersion: ""

youtube:
  videoId: ""
  title: "<Tên bài hát> | Nhật Minh | Nhạc thiếu nhi"
  status: "draft"
  description: "<mô tả ngắn + hashtag>"
---

## 🎯 Chủ đề
<2–3 câu mô tả chủ đề, thông điệp, cảm xúc>

## 🎵 Style (dán vào ô "Style of Music" của Suno)
```text
<stylePrompt – giống frontmatter>
```

## 📝 Full Lyrics (dán vào ô "Lyrics" của Suno)

[Intro]
...

[Verse 1]
...

[Pre-Chorus]
...

[Chorus]
...

[Verse 2]
...

[Pre-Chorus]
...

[Chorus]
...

[Bridge]
...

[Final Chorus]
...

[Outro]
...

## 📌 Ghi chú sản xuất
- Map lời → cảnh: xem mục 5 trong `data/briefs/<slug>.md`
- ...
````

### Thông số "More Options" của Suno (ghi vào `suno.settings` trong frontmatter)
| Thông số | Nhạc thiếu nhi (mặc định) | Ghi chú |
|---|---|---|
| Vocal Gender | Female | Giọng trẻ em mô tả thêm trong stylePrompt |
| Duration | Custom = thời lượng mục tiêu (≥ 3:00) | Tránh Auto ra bài quá ngắn |
| Max Mode | On (so sánh với Off) | |
| Weirdness | 25–35% | Giai điệu quen tai, dễ đoán |
| Style Influence | 70–80% | Bám sát style prompt |
| Variety | Normal | |
| Personalize | Off | Không lẫn gu cá nhân |

Với nhạc người lớn/thử nghiệm có thể tăng Weirdness 45–60% và giảm Style Influence 50–60%.

Thêm `excludeStyles` (ô loại trừ của Suno) cho mọi bài thiếu nhi: `horror, scary, dark, screaming, heavy metal, dubstep, deep growl`.

### Quy tắc viết Style prompt (Suno)
- **Tiếng Anh**, ≤ 200 ký tự (Suno cắt phần thừa), theo thứ tự:
  `thể loại, tempo BPM, giọng hát, nhạc cụ chính, mood, đặc điểm sản xuất`
- Ví dụ: `Vietnamese kids pop, 118 bpm, bright child vocal, ukulele, claps, glockenspiel, playful, sunny, catchy hook, clean modern mix`
- Không ghi tên ca sĩ/ban nhạc thật.

### Quy tắc viết lời (Lyrics)
- Tiếng Việt, câu ngắn 5–8 chữ, vần dễ nhớ, từ ngữ trẻ em hiểu được.
- Tên nhân vật ("Minh", "Nhật Minh") xuất hiện ở Chorus.
- Chorus 4–8 câu, **lặp nguyên văn** mỗi lần; có 1 hook ngắn dễ hát theo.
- Dùng metatag Suno trong `[ ]`: `[Intro]`, `[Verse 1]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Break]`, `[Final Chorus]`, `[Outro]`, `[End]`. Có thể thêm chỉ dẫn ngắn: `[Intro: claps and giggles]`.
- Tổng độ dài lời phù hợp ~3:00–3:30 (khoảng 2 verse + 3 chorus + bridge).
- Mỗi đoạn lời phải ứng với **một hoặc nhiều cảnh** trong shot list.

---

## 5. BƯỚC 3 – Tạo Google Flow JSON `data/g-flow/<slug>-flow-16x9.json`

Kế thừa cấu trúc prompt/state mẫu. Mặc định dùng `project.reference_assets[]` + `characters[]`/`props[]`/`backgrounds[]`; chỉ thêm `chapters[]` và `chapter_id` trong chapter mode được người dùng yêu cầu.

### 🔗 Nguyên tắc liền mạch (đọc trước khi viết `scenes` — đây là phần quan trọng nhất)

> Bản đầy đủ: skill [.claude/skills/flow-scene-continuity/SKILL.md](.claude/skills/flow-scene-continuity/SKILL.md). Tóm tắt **5 lớp neo**:
>
> | Lớp | Neo | Trường |
> |---|---|---|
> | 1. Toàn video | chất hình, **hướng sáng**, bảng màu, hướng tiến, chiều cao máy, đạo cụ xuyên suốt | `project.style_anchor`, `light_direction_anchor`, `palette_anchor`, `screen_direction`, `camera_height_anchor`, `anchor_props` |
> | 2. Chapter | bối cảnh, trang phục, màu sáng, **họ ống kính**, thời điểm trong ngày | `chapters[].prompt_blocks`, `camera_family`, `time_of_day`, `energy_range` |
> | 3. Cảnh ↔ cảnh | `end_state` → `start_state` nguyên văn, kiểu nối, thang shot, đường energy | `start_state`, `end_state`, `transition_in`, `energy`, `shotSize`, `camera_move` |
> | 4. Cầu nối chapter | "đổi một biến", cảnh cuối hướng screen-right, cảnh đầu `exit-enter` | `bridge_out`, `bridge_in` |
> | 5. Trong Flow | sinh tuần tự, Frames-to-Video từ frame cuối, chọn take theo `end_state` | `recommended_setup` |

Veo sinh mỗi cảnh **hoàn toàn độc lập, không nhìn thấy cảnh trước**. Vì vậy:

1. **CẤM mọi tham chiếu tương đối trong `prompt`**: không viết `previous scene`, `previous clip`, `previous numbered clip`, `direct continuation`, `the same as before`, `continue from…`, `continue as…`, `moments later`. Veo không có gì để "continue". Mọi thông tin phải là **mô tả tuyệt đối, tự chứa**. Validator báo lỗi khi gặp các cụm này.
2. **Liền mạch = bàn giao trạng thái tường minh.** Mỗi cảnh có 2 trường bắt buộc:
   - `start_state` – mô tả **frame đầu tiên**: nhân vật đứng/ngồi ở đâu trong bối cảnh, tư thế gì, quay mặt hướng nào (screen-left/right/camera), biểu cảm, đang cầm/đeo gì, các đạo cụ đã xuất hiện đang nằm ở vị trí nào.
   - `end_state` – mô tả **frame cuối cùng** theo đúng các mục trên, kết ở một **tư thế tĩnh, dễ tả lại** (đứng thẳng, ngồi xuống, giơ tay chữ V…), kèm câu `…and holds this pose, nearly still, for the final second.`
   - **`start_state` của cảnh N+1 = `end_state` của cảnh N chép lại nguyên văn** (bỏ câu "holds this pose"), chỉ đổi khi sang chapter mới. Đây chính là "khớp nối" làm các clip dựng cạnh nhau trông liền mạch.
3. **Luật hướng chuyển động (screen direction):** chọn một hướng tiến chính cho cả bài (mặc định trái → phải). Nhân vật đi ra khỏi khung bên phải thì cảnh sau phải đi vào từ bên trái. Không đổi phía máy quay qua "trục" nhân vật (luật 180°). Ghi hướng mặt/hướng di chuyển vào cả `start_state` lẫn `end_state`.
4. **Một "neo phong cách" duy nhất cho cả video:** `project.style_anchor` (màu phim, ống kính, độ sâu trường ảnh, grain, độ tương phản) được chép **nguyên văn** vào prompt của **mọi cảnh, mọi chapter** — ánh sáng đổi theo chapter nhưng "chất hình" không đổi, tránh cảm giác mỗi cảnh một bộ phim khác nhau.
5. **Kỹ thuật Flow (khuyến nghị mạnh, ghi vào `recommended_setup`):** với các cảnh **trong cùng chapter**, tải frame cuối của clip vừa sinh về, dùng làm **ảnh frame đầu** cho cảnh kế tiếp (tính năng Frames to Video / ảnh đầu-cuối của Flow), hoặc dùng **Extend** khi hành động nối tiếp trực tiếp. Prompt JSON vẫn phải tự chứa đầy đủ như trên để dùng được cả khi không có frame reference.
6. **Nhịp dàn dựng xen kẽ:** không đặt 2 cảnh liền nhau có shot size + góc máy giống hệt, nhưng cũng không nhảy từ extreme close-up sang extreme wide; đổi tối đa 1–2 "nấc" mỗi lần cắt (wide → medium → close-up). Sau cảnh máy chuyển động mạnh (orbit / tracking) là cảnh static hoặc push-in chậm.
7. **Kiểu nối tường minh (`transition_in`)** cho mỗi cảnh: `hold` (mặc định) · `cut-on-action` (≤ 30% số cảnh) · `exit-enter` (đổi khu vực / chapter: ra khỏi khung bên phải, vào từ mép trái) · `match-pose` (cùng tư thế, đổi góc ≥ 2 nấc – dùng cho motif Chorus) · `look-off` (nhìn ra ngoài khung → cảnh sau là thứ bé nhìn thấy) · `establishing` (khung trống, chỉ cảnh mở đầu).
8. **Đường năng lượng (`energy` 1–5)** bám theo phần nhạc (Intro 1–2, Verse 2–3, Pre-Chorus 3–4, Chorus 4–5, Bridge 2–3, Outro 1); mỗi cắt đổi ≤ 1 nấc, vào Chorus được +2.
9. **Hướng sáng không đổi cả bài** (`light_direction_anchor`, mặc định key light từ screen-left). Chapter chỉ đổi màu / độ ấm. Bóng đổ đổi phía là lỗi liền mạch dễ thấy nhất.
10. **Cầu nối chapter – "đổi một biến":** sang chapter mới chỉ đổi bối cảnh **hoặc** trang phục. Cảnh cuối chapter (`bridge_out`) kết với nhân vật hướng / đi / chỉ về screen-right và cầm theo `anchor_props`; cảnh đầu chapter mới (`bridge_in`) dùng `exit-enter` hoặc `match-pose`, cùng trang phục, cùng đạo cụ, energy lệch ≤ 1.

### Cấu trúc

```json
{
  "project": {
    "title": "<Tên bài hát>",
    "slug": "<slug>",
    "brief": "data/briefs/<slug>.md",
    "song": "data/songs/<slug>.md",
    "audio_duration": "03:20",
    "video_format": "16:9",
    "resolution": "1920x1080",
    "orientation": "landscape",
    "display_mode": "full screen",
    "video_model": "Veo 3.1",
    "scene_duration": "8 seconds",
    "total_scenes": 25,
    "visual_style": "photorealistic cinematic children's music video, ...",
    "style_anchor": "Shot on a cinematic 35mm lens look with shallow depth of field, soft warm color grade with gentle teal shadows, subtle fine film grain, soft natural contrast, clean highlights, no HDR glow. The entire music video shares this exact same photographic look in every clip.",
    "light_direction_anchor": "The main key light always comes from screen-left and slightly above, so shadows fall gently toward screen-right in every clip of the whole video. Only the color temperature and brightness of the light may change between chapters, never its direction.",
    "palette_anchor": "Color palette for the whole video: <màu 1>, <màu 2>, <màu 3>, with <màu nhấn> as the single accent. Every location, costume and prop stays inside this palette.",
    "camera_height_anchor": "Camera stays at child eye level, about 1 meter above the ground, unless the camera move explicitly says low angle or high angle.",
    "screen_direction": "Story travel direction is left-to-right. The character faces or moves toward screen-right whenever traveling. Never cross the 180-degree line relative to the main character; never mirror the layout.",
    "anchor_props": [
      { "tag": "@RedBucket", "description": "Đạo cụ xuyên suốt, đi theo nhân vật qua mọi chapter; mô tả cố định trong character_lock." }
    ],
    "main_character_reference": "@NhatMinh",
    "characters": {
      "@NhatMinh": "Nhân vật chính; ảnh reference đã upload lên Flow.",
      "@<NhanVatPhu>": "Mô tả cố định: màu, dáng, kích thước, phụ kiện nhận dạng (ví dụ vòng cổ xanh có chuông đỏ)."
    },
    "global_restrictions": [
      "Mỗi cảnh là một video liên tục đúng 8 giây (Veo 3.1).",
      "Chỉ các nhân vật được tag mới xuất hiện; không thêm người/động vật khác.",
      "Không thay đổi khuôn mặt, tóc, tuổi, tỷ lệ cơ thể, trang phục chapter của nhân vật.",
      "Không lật gương bối cảnh hoặc đổi vị trí trái/phải.",
      "Đạo cụ và vị trí nhân vật nối tiếp hợp lý từ cảnh trước.",
      "Không chữ, subtitle, logo, watermark; text overlay chỉ thêm ở hậu kỳ."
    ],
    "global_ingredients": [
      { "tag": "@NhatMinh", "type": "character", "description": "Vietnamese boy ~5 years old, ..." }
    ],
    "important_instructions": [
      "Generate every scene in landscape 16:9 widescreen.",
      "Only tag ingredients that belong to the scene's chapter plus global ingredients.",
      "Keep @NhatMinh visually consistent in every scene.",
      "Do not generate subtitles, captions, logos or text inside the video.",
      "Do not generate dialogue. The final Suno audio track will be added during editing."
    ],
    "generation_rules": {
      "realism": "...",
      "child_visual_engagement": "...",
      "character_consistency": "...",
      "camera_consistency": "...",
      "continuity": "...",
      "safety": "...",
      "frame": "Landscape 16:9 full screen. No black bars, borders, subtitles, captions or logos."
    }
  },
  "chapters": [
    {
      "chapter_id": "ch1",
      "flow_chapter_name": "Chương 1 – Phòng ngủ",
      "scene_range": [1, 5],
      "song_sections": ["Intro", "Verse 1"],
      "setting": "bright children's bedroom, morning",
      "costume": "blue t-shirt, beige shorts",
      "time_of_day": "morning",
      "camera_family": "35mm lens look at child eye level; 28mm or 50mm only when the camera move says so.",
      "energy_range": [1, 3],
      "lighting": "warm morning sunlight, key from screen-left",
      "ingredients": [
        { "tag": "@NhatMinh", "type": "character", "scope": "global" },
        {
          "tag": "@Bedroom",
          "type": "background",
          "scope": "chapter",
          "description": "Bed on the left, window center back, toy shelf on the right, light-blue walls.",
          "image_prompt": "Photorealistic bright Vietnamese children's bedroom, ... no people, 16:9"
        }
      ],
      "recommended_setup": [
        "Tạo trước ảnh chuẩn @Bedroom, upload vào Chương 1 – Phòng ngủ.",
        "Dùng đúng một ảnh @Bedroom cho mọi cảnh của chapter.",
        "Không lật gương: giường bên trái, kệ đồ chơi bên phải, cửa sổ giữa phía sau.",
        "Ưu tiên dùng khung cuối cảnh trước làm reference bổ sung cho cảnh sau."
      ],
      "prompt_blocks": {
        "character_lock": "Use the approved uploaded character reference for @NhatMinh. Keep his face and hairstyle exactly as in the reference image. Chapter costume, identical in every clip of this chapter: blue short-sleeve t-shirt, beige shorts, white sneakers. Do not redesign, recolor or restyle the costume. Only @NhatMinh may appear as a living character. @RedBucket is one fixed prop: <màu, kích thước, chất liệu, 1 chi tiết nhận dạng>. It looks identical in every clip.",
        "background_lock": "@Bedroom is the fixed approved background reference of Chương 1 – Phòng ngủ. It is the exact same bright children's bedroom: <liệt kê bố cục: vật gì ở screen-left / screen-right / rear-center, màu tường, sàn>. Preserve the exact layout, positions, scale, colors and materials. Do not mirror, rotate, redesign or randomly decorate the room. Do not add extra doors, windows, furniture, people or animals. Keep <A> on screen-left and <B> on screen-right. Never swap left and right.",
        "continuity_lock": "This clip is one shot inside a longer music video. Everything needed is described in this prompt. Keep the camera at child eye level, keep the character scale, light direction, weather, season and time of day exactly as described here. Only the props named in the first-frame description exist in the frame; do not invent extra props, people or animals. Each prop stays exactly where the first-frame description places it unless the scene action explicitly moves it. No teleporting, no sudden costume or hairstyle change, no new location interpretation.",
        "lighting_lock": "Lighting for this chapter: soft bright morning daylight through the rear-center window, key light from screen-left and slightly above, soft shadows toward screen-right, neutral-warm white balance, faces always clearly lit. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter."
      }
    }
  ],
  "format_lock": "Create one continuous 8-second video in 16:9 landscape format. Photorealistic cinematic live-action family-friendly children's music video: realistic fabrics and lighting, natural gentle movement, soft cinematic depth of field, bright clean colors. Use one camera angle or one smooth camera movement only. No abrupt cuts, montage or internal scene transition. Keep the final two seconds visually stable. Do not generate text in the image. No subtitles, captions, dialogue, speech, logo or watermark.",
  "scenes": [
    {
      "scene_number": 1,
      "chapter_id": "ch1",
      "flow_chapter_name": "Chương 1 – Phòng ngủ",
      "name": "<Tên cảnh tiếng Việt>",
      "timecode": "00:00–00:08",
      "song_section": "Intro",
      "lyrics": "<câu hát tương ứng hoặc '(instrumental)'>",
      "durationSeconds": 8,
      "aspectRatio": "16:9",
      "energy": 2,
      "transition_in": "hold",
      "ingredients": ["@NhatMinh", "@RedBucket", "@Bedroom"],
      "character_reference": "@NhatMinh",
      "background_reference": "@Bedroom",
      "keyframe_prompt": "Cinematic 35mm eye-level wide shot, 16:9, @NhatMinh wearing blue t-shirt and beige shorts standing center on light-wood floor of @Bedroom, looking curious, morning sunlight from screen-left.",
      "start_frame": "data/g-flow/assets/<slug>/scene-01-start.png",
      "start_state": "@NhatMinh stands at the center of the frame on the light-wood floor, about one meter in front of the rear-center window, facing the toy shelf on screen-right, arms relaxed at his sides, calm curious expression. @RedBucket sits on the lowest shelf of the toy shelf on screen-right. Nothing is in his hands.",
      "end_state": "@NhatMinh stands at the center-right of the frame on the light-wood floor, just in front of the toy shelf on screen-right, facing the camera, holding @RedBucket with both hands at chest height, big delighted smile, and holds this pose, nearly still, for the final second.",
      "environmentContinuity": "bedroom, morning",
      "visualStyle": "photorealistic cinematic live-action children's music video",
      "shotSize": "wide → medium",
      "cameraDirection": "slow dolly-in",
      "cameraLensAndAngle": "eye-level 35mm",
      "lighting": "warm morning sunlight from screen-left",
      "emotionAndEnergy": "curious → delighted",
      "visualFocus": "...",
      "characterConsistency": "Use @NhatMinh consistently; preserve the same face, hairstyle, age appearance and body proportions. Keep the chapter costume.",
      "motionGuidance": "Natural child movement, large readable gestures synchronized to the beat.",
      "scene_action": "@NhatMinh walks two slow steps toward screen-right, crouches, lifts @RedBucket off the lowest shelf with both hands, stands up and turns to face the camera with a big delighted smile.",
      "camera_move": "Slow dolly push-in at child eye level, 35mm, from wide to medium, no other movement.",
      "prompt": "<ĐỂ TRỐNG – sinh bằng `npm run flow:assemble`. Thứ tự: character_lock, background_lock, continuity_lock, lighting_lock, camera_family, style_anchor, light_direction_anchor, palette_anchor, camera_height_anchor, screen_direction, format_lock, 'The clip opens on exactly this first frame: ' + start_state, 'Scene action: ' + scene_action, 'Camera: ' + camera_move, 'The clip ends on exactly this final frame: ' + end_state, câu khoá bối cảnh.>",
      "voiceover": "<câu tiếng Việt mô tả cảnh – dùng cho hậu kỳ/nội dung, KHÔNG đưa vào Flow>",
      "text_overlay": "<chữ ngắn 2–5 từ chèn ở hậu kỳ, hoặc lời hát karaoke>",
      "negativePrompt": "cartoon plastic skin, uncanny face, changed identity, adult-looking child, extra fingers, deformed hands, duplicate character, mirrored layout, random text, subtitles, logo, watermark, black bars, portrait framing, camera shake"
    }
  ]
}
```

### Cách ghép `prompt` (theo mẫu đã dùng thực tế)

> Mẫu tham chiếu đã chạy tốt: [google-flow-scenes/data/nhat-anh/em_be_choi_voi_meo_vang_beo_tron_tren_san_24_canh.json](../google-flow-scenes/data/nhat-anh/em_be_choi_voi_meo_vang_beo_tron_tren_san_24_canh.json)

Mỗi lần Flow sinh video là **độc lập**, không nhớ cảnh trước → `prompt` của **mọi cảnh** phải là **bản đầy đủ, tự chứa**. **Không viết tay** `prompt`: AI chỉ điền các trường, rồi chạy

```bash
npm run flow:assemble -- data/g-flow/<slug>-flow-16x9.json   # ghép prompt + ingredients
npm run flow:validate -- data/g-flow/<slug>-flow-16x9.json   # phải 0 error
```

Script [scripts/assemble-flow-prompts.mjs](scripts/assemble-flow-prompts.mjs) ghép **nguyên văn** theo thứ tự:

```
1. character_lock          (chapter – @NhatMinh + mỗi nhân vật phụ / anchor prop một câu mô tả cố định có tag @)
2. background_lock         (chapter – @<Background>, bố cục trái/phải/giữa)
3. continuity_lock         (chapter – TỰ CHỨA, không nhắc clip khác)
4. lighting_lock           (chapter – màu sáng; hướng = light_direction_anchor)
5. camera_family           (chapter)
6. style_anchor            (toàn project – MỌI cảnh)
7. light_direction_anchor  (toàn project)
8. palette_anchor          (toàn project)
9. camera_height_anchor    (toàn project)
10. screen_direction       (toàn project)
11. format_lock            (toàn project)
12. "The clip opens on exactly this first frame: " + start_state   ← = end_state cảnh trước chép nguyên văn
13. "Scene action: " + scene_action                                 ← phần duy nhất thay đổi nhiều giữa các cảnh
14. "Camera: " + camera_move                                        ← đúng MỘT kiểu máy, có tiêu cự + chiều cao
15. "The clip ends on exactly this final frame: " + end_state       ← tư thế tĩnh + "holds this pose, nearly still, for the final second"
16. "The location must remain recognizable as the exact same @<Background> reference from the first frame to the last frame. Do not generate a new location interpretation."
```

- Khối 1–5 **copy y hệt** giữa các cảnh cùng chapter; khối 6–11 **không bao giờ đổi** trong cả video. Lặp nguyên văn là có chủ ý: Flow giữ nhân vật / bối cảnh ổn định hơn khi câu chữ giống hệt.
- Prompt ghép xong dài ~700–800 từ là bình thường với Veo 3.1; phần thay đổi (12–15) nằm cuối để mô hình đọc hành động sau khi đã "khoá" mọi thứ.
- **Tuyệt đối không** dùng các cụm `previous scene`, `previous clip`, `same as before`, `continue from` trong prompt — Veo không nhìn thấy cảnh trước; sự liền mạch đến từ cặp `end_state` → `start_state` mô tả tuyệt đối.
- Nhân vật phụ: mô tả cố định một lần trong `characters`, rồi lặp nguyên văn trong `character_lock`, ví dụ: `@GoldenCat is one fixed character: a small chubby round golden-orange cat ... green collar with one small red bell. Keep ... identical in every clip.`
- Câu khẳng định số nhân vật: `Only @NhatMinh and @<X> may appear as living characters.`

### ⚠️ Tránh lỗi "This generation might violate our policies" (Chính Sách An Toàn Google Veo)

Google Veo và Google Flow có bộ lọc an toàn trẻ em (Minors Safety Policy) được thiết lập cực kỳ nhạy (False-Positive rất cao). Để đảm bảo không bị chặn video:

1. **TẮT "Enhance Prompt" trong giao diện Google Flow:** LLM tối ưu tự động của Flow thường tự ý bơm các tính từ cơ thể nhạy cảm (như `delicate skin`, `tender`, `tight fitting`) làm kích hoạt lệnh cấm.
2. **CẤM miêu tả cơ thể, da, má, môi, tuổi tác:**
   - **Tuyệt đối không** dùng: `chubby`, `plump`, `skin texture`, `soft skin`, `rosy lips`, `cheeks`, `bare skin`, `little 5-year-old child/toddler`.
   - Chỉ dùng tên tag định danh: `@NhatMinh`, `@NhatAnh` hoặc danh xưng trung tính: `the young explorer`, `the happy student`.
   - Khóa nhân vật (`character_lock`) **chỉ tả trang phục, kiểu tóc và biểu cảm nụ cười**, tuyệt đối không tả giải phẫu cơ thể.
3. **Quy định trang phục an toàn (Đặc biệt chủ đề Bãi biển / Hồ bơi / Mùa hè):**
   - **CẤM:** `swimsuit`, `bikini`, `swimwear`, `shirtless`, `bare chest`, `bathing`, `underwear`.
   - **LUÔN DÙNG:** `sun-protective long-sleeve UV rashguard swim shirt, knee-length swim shorts, bright child life vest, sun hat`. Kín đáo, đúng thực tế bảo vệ trẻ em và an toàn 100% trước bộ lọc.
4. **Bối cảnh nhạy cảm:**
   - Tránh cảnh trẻ em nằm trên giường một mình trong phòng ngủ tối (`sleeping alone in bed`).
   - Chủ đề đêm/Halloween: không dùng `horror`, `creepy`, `spooky monster`, `pitch black night`. Luôn dùng `cheerful festive evening street illuminated with glowing warm lanterns, friendly smiling pumpkins, playful celebration`.
5. **Thêm `family-friendly` vào `format_lock`** để mô hình luôn định hướng nội dung gia đình lành mạnh.
6. **Không chạm / không cận mặt trẻ em** (lỗi thật ở be-gai-gap-cua-bien scene 8):
     - CẤM mọi từ chỉ tiếp xúc cơ thể khi có trẻ em, **kể cả trong `negativePrompt`**: `touch`/`touching`/`no touching`, `hand(s) inside`, `tickle`, `kiss`, `cuddle`, `caress`, `on her/his lap`, `undress`. Negative `child touching the crab` cũng bị đọc như prompt.
     - Thay bằng hành vi nhìn/khoảng cách: `just watches`, `looks from a safe distance`, `stays beside her mother`, `wags one finger side to side as a cheerful "we just look" sign`; negative chỉ ghi kết quả cần tránh về đạo cụ (`crab outside the basin`), không ghi hành động của trẻ.
     - CẤM camera nhắm vào mặt trẻ em: `push-in onto the girl's face`, `close-up on @X's face`. Khi có trẻ em, `camera_move` không chứa chữ `face`; ưu tiên `medium` / `medium-wide` giữ cả trẻ, người lớn và đạo cụ trong khung; cần cận thì cận **đạo cụ/hành động** (`on the crab in the basin, with the girl and the mother visible behind it`).
     - Khi bị chặn: đọc lại cả prompt **và** negativePrompt của cảnh đó, sửa trong generator `scripts/flows/<slug>.mjs` (không sửa tay JSON), chạy lại `flow:assemble` + `flow:validate`.
     - `npm run flow:validate` báo **error** cho các trường hợp trên (`checkChildSafety` trong `scripts/validate-flow.mjs`).

### 👥 Quản lý giới hạn 3 Ingredients (Strict 3-Slot Budget)
- Google Flow chỉ cho phép **tối đa 3 slots reference image (ingredients)**.
- Mọi cảnh bắt buộc: `s.ingredients.length <= 3`. Phân bổ:
  * `Slot 1:` `@MainCharacter` (nhân vật chính)
  * `Slot 2:` `@SupportingCharacter` hoặc `@KeyProp` tương tác chính
  * `Slot 3:` `@Background` (hoặc nhân vật phụ 2 nếu bối cảnh đã có trong Start Frame)
- Nếu cảnh có nhiều hơn 3 nhân vật (Cả gia đình, nhóm bạn): **Ghép các nhân vật vào 1 ảnh Keyframe Start Frame trước**! Nạp ảnh vào làm First Frame (Image-to-Video). Flow sẽ hiểu toàn bộ nhóm nhân vật từ 1 bức ảnh nguồn duy nhất mà không tốn slot ingredient nào.

### 🎬 Quy tắc 3 Pha Hành Động Tạo Video Hấp Dẫn (Dynamic Engagement)
1. **Pha 1 (0.0s – 2.0s) Lead-in:** Chuyển động bắt nhịp ngay từ frame đầu (bước vào khung, vung tay nhảy múa theo phách trống đầu tiên của câu hát, không để đơ 1s đầu).
2. **Pha 2 (2.0s – 6.5s) Core Hook:** Diễn xuất vũ đạo sinh động, nụ cười rạng rỡ, tương tác mắt với camera (phá vỡ bức tường thứ 4) tạo sự gắn kết và lôi cuốn khán giả nhí.
3. **Pha 3 (6.5s – 8.0s) Dynamic Settle:** Nhân vật giảm tốc mượt mà về một tư thế rõ ràng (Readable Settle Pose, nụ cười rạng rỡ, nhịp thở tự nhiên, không đóng băng đơ cứng).
4. **Chaining Last Frame:** Tải frame thứ 8s của Cảnh N làm First Frame cho Cảnh N+1 để đảm bảo liền mạch 100% pixel.

### Quy tắc viết từng cảnh
1. **`prompt` viết tiếng Anh**, ghép theo khung trên. `scene_action` 1–3 câu, **một hành động chính**, gọi nhân vật bằng tag `@`.
2. Đạo cụ mới phải có chữ `introduces one ...` trong `scene_action` và ghi rõ vị trí đặt; từ cảnh sau trở đi, đạo cụ đó phải xuất hiện kèm vị trí trong `start_state`/`end_state` cho đến khi được cất đi tường minh.
3. `end_state` cảnh N chép **nguyên văn** thành `start_state` cảnh N+1 (bỏ câu "holds this pose"); `scene_action` phải kết thúc đúng ở tư thế mô tả trong `end_state`. Giữ hướng di chuyển nhất quán (trái → phải), ghi hướng mặt/hướng đi vào cả hai state. **Không** viết `the same spot` / `where he was` — lặp lại vị trí thật (screen-left / center / screen-right + mốc bối cảnh).
   - Mỗi state theo mẫu: *vị trí trong khung + mốc bối cảnh → hướng mặt → tay trái / tay phải → biểu cảm → từng đạo cụ trong khung + vị trí của nó*.
   - Viết **tuần tự**: `end_state` 1 → `start_state` 2 → `scene_action` 2 → `end_state` 2 → … Không viết hết action rồi "vá" state sau.
4. Camera đa dạng: wide, medium, close-up, low-angle hero, tracking, orbit, dolly — không lặp cùng một kiểu quá 2 cảnh liền, nhưng mỗi lần cắt chỉ đổi 1–2 nấc shot size (không nhảy extreme close-up → extreme wide). Sau orbit / tracking phải là static hoặc push-in chậm. `camera_move` luôn ghi tiêu cự (theo `camera_family`) và chiều cao máy.
5. Cảnh Chorus: động tác nhảy/hook giống nhau giữa các lần chorus (motif), khác góc máy hoặc bối cảnh chapter; nối bằng `match-pose`.
5b. Mỗi cảnh có `transition_in` và `energy`; cảnh cuối chapter có `bridge_out: true`, cảnh đầu chapter có `bridge_in: true` (xem skill mục 3.2, 3.4, 4).
6. `negativePrompt` dùng khối chuẩn + bổ sung theo chủ đề (ví dụ biển: `deep water, drowning, big waves`).
7. `timecode` liên tục, không trùng, không hở; tổng = `audio_duration` (cảnh cuối có thể ngắn hơn).
8. Không có chữ, logo, phụ đề, lời thoại trong video.
9. `voiceover` (tiếng Việt) và `text_overlay` chỉ dùng cho hậu kỳ — **không** chép vào `prompt`.
10. Cảnh cuối: `keep the final two seconds completely still` để dễ kết video.

---

## 6. Kiểm tra chéo trước khi kết thúc (AI tự check)

**Bắt buộc chạy và dán kết quả vào câu trả lời:**
```bash
npm run flow:assemble -- data/g-flow/<slug>-flow-16x9.json
npm run flow:validate -- data/g-flow/<slug>-flow-16x9.json   # 0 error; đọc và xử lý hết warning
npm run song:validate
```
Validator ([scripts/validate-flow.mjs](scripts/validate-flow.mjs)) kiểm tra: anchors toàn video, prompt_blocks đủ, cụm cấm, `start_state` = `end_state` trước, "holds this pose", hướng mặt + vị trí trong state, tag ↔ ingredients ↔ chapter, timecode liên tục, thang shot ≤ 2 nấc, không lặp shot + máy, góc máy, tiêu cự, energy, cầu nối chapter, time_of_day không lùi, "đổi một biến".

- [ ] 3 file cùng `slug`, cùng tên bài hát.
- [ ] `total_scenes` = số phần tử `scenes` = số dòng shot list trong Brief.
- [ ] Số chapter và thứ tự khớp input manifest; nếu chapter do AI suy ra từ chủ đề, đã ghi rõ ở Brief.
- [ ] Mỗi beat/chi tiết bắt buộc trong input coverage được map đến ít nhất một scene; không thiếu chapter hoặc beat.
- [ ] Đọc theo từng chapter: `setting`, `costume`, nhân vật/appearance lock, scene actions và ingredients đúng chapter; không nhầm hình/nhân vật giữa chapter.
- [ ] `scene_count` = số `scene_numbers` = độ dài `scene_range`; các chapter liên tiếp, không rỗng, không hở hoặc trùng.
- [ ] Bảng chapter trong Brief, các heading ảnh, checklist upload, `chapters[]` và câu trả lời cuối có cùng thứ tự, tên, số lượng.
- [ ] Mỗi `scene.chapter_id` tồn tại trong `chapters`; `scene_number` nằm trong `scene_range` của chapter.
- [ ] Mỗi tag trong `scene.ingredients` thuộc `global_ingredients` hoặc `chapters[chapter_id].ingredients`.
- [ ] Mọi tag `@...` trong `prompt` đều có trong `scene.ingredients`.
- [ ] `prompt` mỗi cảnh chứa nguyên văn `prompt_blocks` của đúng chapter + `style_anchor` + `format_lock` (không tóm tắt, không viết lại).
- [ ] `start_state` của cảnh N+1 = `end_state` của cảnh N chép nguyên văn (trừ cảnh mở đầu chapter mới); mọi `end_state` kết ở tư thế tĩnh có câu "holds this pose".
- [ ] Không có cụm `previous scene` / `previous clip` / `direct continuation` / `same as before` / `continue from` / `continue as` trong bất kỳ `prompt` nào.
- [ ] Hướng di chuyển/hướng mặt trong các state nhất quán theo `screen_direction` (trái → phải, không vượt trục 180°).
- [ ] `project` có đủ `style_anchor`, `light_direction_anchor`, `palette_anchor`, `camera_height_anchor`, `screen_direction`, `anchor_props`; mỗi chapter có `camera_family`, `time_of_day`.
- [ ] Mỗi cảnh có `transition_in` + `energy`; cảnh cuối mỗi chapter hướng về screen-right (`bridge_out`), cảnh đầu chapter mới `exit-enter` / `match-pose` (`bridge_in`), chỉ đổi bối cảnh **hoặc** trang phục.
- [ ] Continuity Map (Brief mục 5b) khớp với `scenes` (shot, camera, energy, transition).
- [ ] Mỗi nhân vật phụ có trong `characters` và được mô tả cố định giống nhau ở mọi cảnh.
- [ ] `flow_chapter_name` của scene = của chapter; tên chapter khớp bảng ở Brief mục 4.
- [ ] Mỗi ảnh reference trong chapters đều có `image_prompt` (trừ ảnh global đã có sẵn).
- [ ] `lyrics` trong từng cảnh trích đúng từ Song MD.
- [ ] Song MD có `stylePrompt:` và thẻ `[Verse`/`[Chorus` → chạy `npm run validate` không lỗi.
- [ ] JSON hợp lệ (parse được).

Lệnh kiểm tra nhanh JSON (Git Bash):
```bash
node -e "JSON.parse(require('fs').readFileSync('data/g-flow/<slug>-flow-16x9.json','utf8')); console.log('OK')"
```

---

## 7. Sau khi có nhạc Suno (cập nhật vòng 2)

Khi người dùng gửi link/thời lượng nhạc Suno thực tế:
1. Cập nhật `suno.clipId`, `songUrl`, `audio.audioUrl`, `audio.duration`, `durationSeconds`, `status: "mp3_ready"` trong Song MD.
2. Tính lại số cảnh; thêm/bớt cảnh ở cuối chapter phù hợp (ưu tiên kéo dài Chorus/Outro), cập nhật `timecode`, `total_scenes`, `scene_range`.
3. Đồng bộ lại shot list trong Brief.

---

## 8. Câu lệnh mẫu người dùng gửi cho AI

```text
Theo WORKFLOW.md, tạo bộ nội dung cho chủ đề: "Nhật Minh đi tắm biển cùng bố".
(Tuỳ chọn) Thể loại: kids pop vui nhộn. Thêm nhân vật @Bo (bố).
```

AI trả lời bằng: danh sách 3 file đã tạo + bảng chapter & ảnh reference cần tạo trong Flow (để người dùng chuẩn bị ảnh).

### Required keyframe-first production order
Quy trình keyframe-first (`project.generation_pipeline: "keyframe-first"`): chỉ viết trường nguồn (state, camera, locks, `label` cho mọi tag); `npm run flow:assemble` sinh riêng `scenes[].keyframe` (bước 1 — Flow tạo ẢNH, `keyframe.ingredients` ≤ 3, `keyframe.prompt` = ảnh tĩnh đúng start_state, ảnh duyệt lưu ở `keyframe.output_file`) và `scenes[].video` (bước 2 — Frames to Video, `video.first_frame` = ảnh keyframe, `video.prompt` chỉ mô tả chuyển động tới end_state, không @tag, không ingredients; object `video` có sẵn `cameraDirection`, `cameraLensAndAngle`, `start_state`, `scene_action`, `camera_move`, `end_state`). Không có trường `status`; không tạo video khi keyframe của cảnh đó chưa được duyệt. Extension `google-flow-scenes/chrome-extension` chạy đúng thứ tự Keyframe N → duyệt → Video N. Chi tiết: skill flow-scene-continuity, mục "Quy trình keyframe-first".
