---
name: flow-scene-continuity
description: Rules and prompt templates for Google Flow / Veo 3.1 scene continuity, reference-locked characters, flat asset catalogs or optional chapter manifests, start_state/end_state handoff, cut grammar, global anchors, and Flow production technique. Use whenever writing, revising or auditing `data/g-flow/*.json`. Always finish with `npm run flow:assemble` + `npm run flow:validate` (0 error).
---

# Flow Scene Continuity

Veo sinh **mỗi cảnh độc lập, không nhìn thấy cảnh trước**. Cảm giác "liền mạch" vì vậy **không thể** đến từ câu chữ kiểu "continue from previous clip" (Veo không có gì để continue) mà phải đến từ **6 lớp neo** dưới đây, được viết **tường minh, tuyệt đối, lặp nguyên văn** trong mọi prompt.

Đọc [references/prompt-templates.md](references/prompt-templates.md) để lấy câu chữ tiếng Anh dùng nguyên văn.

**Thứ tự làm việc bắt buộc:** Lớp 0 (nhìn ảnh reference → `appearance_lock`) → chọn manifest phẳng hoặc chapter theo yêu cầu → Lớp 1–4 (viết state tuần tự) → `npm run flow:assemble` → `npm run flow:validate` (0 error) → Lớp 5 (ghi chú sản xuất).

## Chọn cấu trúc manifest

- Mặc định dùng **manifest phẳng** nếu người dùng chỉ cần danh sách nhân vật, đạo cụ và bối cảnh để upload; không tự tạo chapter.
- Manifest phẳng: `project.manifest_mode: "flat"`; khai báo mỗi tag một lần trong `project.reference_assets[]`, đồng thời chia thành `project.characters[]`, `project.props[]`, `project.backgrounds[]` để dễ xem. Mỗi record có `tag`, `type`, `asset_file` hoặc `source_file`, `render_style`, `appearance_lock` (nhân vật/đạo cụ), `image_prompt` (nếu cần tạo) và `used_in_scenes`.
- Scene phẳng không có `chapter_id`, `flow_chapter_name`, bridge theo chapter hay `chapters[]`. Mỗi scene giữ `background_reference`, `ingredients`, state và prompt hoàn chỉnh, tự chứa. Assembler chỉ đồng bộ ingredients từ prompt và giữ nguyên prompt; validator kiểm asset tags, locks, states, timecode và anchors.
- Chỉ dùng `chapters[]` khi người dùng yêu cầu chapter trong Flow hoặc input có chapter breakdown cần giữ nguyên. Khi dùng chapter mode, tiếp tục áp dụng đầy đủ quy tắc Lớp 1b và chapter bridge bên dưới.

---

## Lớp 0 – Neo nhân vật theo ẢNH REFERENCE THẬT (làm TRƯỚC khi viết bất cứ gì)

Flow giữ nhân vật qua **ảnh reference người dùng upload vào từng chapter**. Nếu prompt tả tóc / trang phục khác ảnh đó, Veo sẽ "trộn" hai nguồn và nhân vật lệch so với chapter người dùng đã gửi. Vì vậy:

1. **Mở và nhìn ảnh reference thật** (tool Read với file ảnh) trong `data/sample-data/` hoặc thư mục người dùng chỉ. Không viết mô tả từ trí nhớ, từ Brief cũ hay từ "ý tưởng câu chuyện".
2. Nếu thư mục có **nhiều ảnh khác nhau** (ảnh thật vs character sheet, trang phục khác nhau), chọn **đúng một** ảnh làm `@MainCharacter` – ưu tiên ảnh **mới nhất** hoặc ảnh người dùng nêu tên – và ghi rõ lựa chọn đó + cách đổi. Generator của bài nên có **preset** (`REF=design-sheet | real-photo`) để đổi ảnh chỉ bằng một biến.
3. Ghi vào `project.global_ingredients[]` của nhân vật chính:
   - `source_file`: đường dẫn file ảnh đã dùng để viết mô tả (validator kiểm tra file tồn tại).
   - `render_style`: `photoreal` | `stylized-3d` | `2d-cartoon` – **theo ảnh**, không theo mong muốn. `style_anchor`, `format_lock`, `visual_style`, `negativePrompt` phải cùng phong cách này (ảnh 3D mà negative ghi `3D render` = lỗi).
   - `appearance_lock`: **một câu mô tả cố định** mở bằng `Use the approved uploaded character reference for @X.` rồi **chỉ** tả **kiểu tóc + trang phục đúng như trong ảnh** (màu, kiểu, phụ kiện). Không tả cơ thể, da, má, môi, cân nặng, tuổi (policy block).
4. **Trang phục trong ảnh là trang phục nền.** Câu chuyện cần phụ kiện (mũ, áo choàng, ba lô…) thì viết là **"worn over this base outfit"**, không thay thế đồ trong ảnh; thay đổi giữa video (tháo mũ) phải nằm trong `scene_action` và `appearance_lock` ghi "removed only when the scene action says so".
5. Mọi nhân vật phụ / đạo cụ có tag đều có `appearance_lock` riêng (trong `chapters[].ingredients[]` hoặc global) + `image_prompt` cùng `render_style`.
6. `prompt_blocks.character_lock` **không viết tay nữa**: `npm run flow:assemble` ghép tự động từ `appearance_lock` của **đúng những nhân vật / đạo cụ xuất hiện trong `start_state` / `scene_action` / `end_state`** của cảnh, cộng câu `Only @A and @B may appear as living characters.` (hoặc `No people or animals appear in this clip.`). Nhân vật chưa xuất hiện trong state thì **không** được tag trong prompt (Veo sẽ tự chèn).
7. Người dùng đổi ảnh reference → **sinh lại toàn bộ JSON** (đổi preset), không sửa tay vài câu.

### Lớp 0b – Quy trình Image-to-Video (Frames-to-Video / Keyframe-First) Giữ Nhân Vật 100%
- Khi dùng Text-to-Video với `@Tag`, Veo 3.1 tự vẽ lại nhân vật từ latent space gây biến dạng mặt và đổi trang phục.
- **Tạo video từ ảnh (Image-to-Video / Frames-to-Video):**
  1. Mỗi cảnh sinh một ảnh Keyframe bằng mô hình tạo ảnh (Midjourney, Flux, Imagen 3, Nano Banana...) khớp 100% tư thế `start_state`.
  2. Nạp ảnh này vào ô **First Frame** trong Flow. Khung hình 0s được khoá 100% pixel gốc, Veo chỉ animate tự nhiên mà không vẽ lại mặt.
  3. Bắt buộc có `keyframe_prompt` trong TỪNG scene, mô tả ảnh tĩnh đúng `start_state` và tỷ lệ 16:9. Tạo ảnh trước video; `scenes[].prompt` chỉ dùng để animate ảnh đã nạp làm Starting Frame/First Frame.

### Lớp 0c – Giới hạn 3 Ingredients (Strict 3-Slot Budget & Composite Start Frame)
- Google Flow giới hạn tối đa **3 reference images (ingredients)** cho một lần sinh.
- Mỗi cảnh chỉ được tag tối đa 3 `@Tag` trong `ingredients`:
  * Slot 1: `@MainCharacter`
  * Slot 2: `@SupportingCharacter` hoặc `@KeyProp`
  * Slot 3: `@Background` (hoặc nhân vật phụ 2)
- Cảnh có > 3 nhân vật (Cả gia đình, nhóm bạn): **Ghép các nhân vật vào 1 ảnh Keyframe Start Frame trước**, nạp vào làm First Frame cho Flow (tiêu tốn 0 ingredient slot).

### Lớp 0d – Phòng chống vi phạm chính sách trẻ em (Minors Safety Policy Guard)
- **TẮT "Enhance Prompt" trong Google Flow.**
- **CẤM từ ngữ giải phẫu/cơ thể trẻ em:** `chubby`, `plump`, `skin texture`, `soft skin`, `rosy lips`, `cheeks`, `bare skin`, `little 5-year-old kid/toddler`. Thay bằng tag định danh `@NhatMinh` hoặc `the young explorer`.
- **Trang phục biển/nước bắt buộc:** `sun-protective long-sleeve UV rashguard swim shirt, knee-length swim shorts, bright child life vest`. CẤM `swimsuit`, `bikini`, `shirtless`, `bare chest`, `bathing`.
- **Bối cảnh an toàn:** Không dùng `sleeping alone in bed`. Chủ đề đêm/Halloween dùng `cheerful festive evening street illuminated with glowing warm lanterns, friendly celebration`, CẤM `horror`, `creepy`.

Validator: `source_file` / `render_style` / `appearance_lock` thiếu = error; prompt thiếu nguyên văn `appearance_lock` của nhân vật có mặt = error; phong cách lệch `render_style` = error.

### Đối chiếu ảnh và nguồn đầu vào (bắt buộc)

- Mở đúng ảnh reference mà người dùng chỉ định hoặc ảnh được ghi trong `source_file`; không thay bằng ảnh cùng tên/nhân vật khác, ảnh chapter khác, hay mô tả trong brief cũ. Khi có nhiều phiên bản, manifest phải ghi đường dẫn/tên file và preset được chọn.
- `appearance_lock` chỉ được khẳng định những gì nhìn thấy rõ trong ảnh: kiểu tóc, trang phục và phụ kiện. Không suy diễn màu/chi tiết bị khuất. Nếu ảnh không truy cập được hoặc mâu thuẫn với văn bản, giữ nguyên nguồn được người dùng chỉ định, ghi điểm chưa xác minh vào Brief và không bịa mô tả để lấp chỗ trống.
- Trước khi viết cảnh, lập `input_coverage` trong Brief: mỗi chi tiết được người dùng yêu cầu (chapter, nhân vật, trang phục, bối cảnh, đạo cụ, hành động/beat) phải map tới chapter và scene number. Không bỏ, gộp, đổi thứ tự hoặc thay chi tiết nguồn nếu chưa được người dùng yêu cầu.
- Với mỗi chapter, `costume` và `setting` phải phản ánh đúng manifest nguồn và đúng scene; `scene_action`, `start_state`, `end_state`, ingredients và prompt phải nhất quán với chapter đó. Không tái sử dụng costume/background lock của chapter trước khi chapter nguồn đã đổi.

---

## Lớp 1 – Neo toàn video (global anchors) — chép nguyên văn vào MỌI cảnh

| Trường trong `project` | Nội dung | Vì sao |
|---|---|---|
| `style_anchor` | ống kính, màu phim, độ sâu trường ảnh, grain, contrast – **đúng `render_style` của ảnh reference** | Mỗi cảnh một "chất phim" khác = rời rạc dù cùng nhân vật |
| `light_direction_anchor` | **Hướng** nguồn sáng chính cố định cả bài (mặc định `key light from screen-left`). Chapter chỉ được đổi **màu / độ ấm / cường độ**, không đổi hướng | Bóng đổ nhảy trái-phải là dấu hiệu "cắt sai" rõ nhất với mắt người |
| `palette_anchor` | 3 màu chủ đạo + 1 màu nhấn, dùng cho mọi chapter (bối cảnh, trang phục, đạo cụ) | Bảng màu thống nhất khiến các bối cảnh khác nhau vẫn "cùng một bộ phim" |
| `screen_direction` | Hướng tiến của câu chuyện (mặc định trái sang phải) + luật 180° | Nhân vật đổi hướng mặt giữa 2 cảnh = gãy mạch |
| `camera_height_anchor` | Chiều cao máy chủ đạo (`child eye level, about 1 m`) | Máy lúc cao lúc thấp làm nhân vật đổi tỷ lệ |
| `anchor_props` | 1–2 đạo cụ / phụ kiện xuyên suốt xuất hiện ở **mọi chapter**, mô tả cố định | Vật quen thuộc đi theo nhân vật là "sợi chỉ" nối các bối cảnh |
| `global_ingredients[].appearance_lock` | Lớp 0 | |

**Quy tắc:** các khối `background_lock`, `continuity_lock`, `lighting_lock`, `camera_family` phải **giống hệt từng ký tự** giữa các cảnh cùng chapter; `style_anchor`, 4 anchor còn lại và `format_lock` giống hệt ở **mọi** chapter; `character_lock` giống hệt giữa các cảnh **có cùng dàn nhân vật**. Không diễn đạt lại, không tóm tắt – assemble lo việc lặp.

---

## Lớp 1b – Chapter manifest (chỉ áp dụng khi chọn chapter mode)

Khi người dùng yêu cầu chapter, mỗi chapter trong Flow = một bộ ảnh reference riêng. Một **bảng chapter duy nhất** phải xuất hiện **giống hệt** ở Brief, `chapters[]` trong JSON và phần hướng dẫn upload. Không tạo bảng/heading/checklist chapter khi manifest phẳng được yêu cầu.

Mỗi `chapters[]` phải có:

| Trường | Ghi chú |
|---|---|
| `chapter_id`, `flow_chapter_name` | `"Chương <số> – <Tên>"`, giống y hệt tên chapter trong Flow |
| `scene_range`, `scene_numbers`, `scene_count` | assemble tự điền từ `scenes[]`; chapter liên tiếp không hở, phủ hết 1..N |
| `song_sections`, `setting`, `costume`, `time_of_day`, `camera_family`, `energy_range` | `costume` giống hệt giữa các chapter nếu không đổi |
| `ingredients[]` | **mọi** tag mà **bất kỳ** cảnh nào trong chapter dùng + nhân vật chính global; mỗi ingredient chapter có `appearance_lock` (nhân vật / đạo cụ) hoặc `description` (bối cảnh) + `image_prompt` cùng `render_style`; ảnh dùng lại từ chapter khác vẫn phải liệt kê |
| `upload_checklist` | assemble tự điền = global + ingredients; chính là danh sách người dùng upload vào chapter |
| `recommended_setup` | nhắc đủ mọi tag cần upload, tên file ảnh `@Main`, ghi chú nhân vật / đạo cụ xuất hiện từ cảnh nào |
| `prompt_blocks` | `background_lock`, `continuity_lock` (tự chứa), `lighting_lock` |

Validator: cảnh không thuộc chapter nào, chapter không có cảnh, `scene_numbers`/`scene_count` lệch, scene_range không phủ đúng mọi scene, ingredient thiếu / không dùng, Brief thiếu tên chapter / dòng bảng / tag / heading, checklist ghi sai số chapter → error / warning. Các trường đếm chapter trong project, Brief và danh sách đầu ra phải bằng nhau; không dùng số mặc định để thay cho manifest nguồn.

### Gate kiểm kê chapter và scene (không được bỏ)

1. Trước khi viết JSON, chép nguyên danh sách chapter từ đầu vào (hoặc suy ra rõ ràng khi người dùng chỉ nêu chủ đề) vào một bảng chuẩn duy nhất. Ghi tên, thứ tự, bối cảnh, costume, nhân vật/đạo cụ và các beat tương ứng.
2. Gán từng beat/chi tiết nguồn vào một hoặc nhiều scene có số cụ thể; tất cả chapter phải có scene, không scene nào mồ côi, và không scene nào dùng nhầm costume/background/tag của chapter khác.
3. Tạo bản sao cùng thứ tự của danh sách đó trong Brief, `chapters[]`, các heading ảnh reference, upload checklist và câu trả lời. Đếm từng nơi; số đếm phải trùng. Không kết luận “đủ” chỉ vì JSON parse được hoặc scene_range liên tục.
4. Đọc lại JSON theo chapter, không chỉ từ đầu tới cuối: xác nhận `chapter_id`, `flow_chapter_name`, setting, costume, character locks, ingredients và action đều khớp chapter manifest.
5. Cuối cùng chạy assembler/validator; nếu validator chưa kiểm một điều trong gate này thì tự kiểm thủ công và nêu kết quả. Validator pass không thay thế đối chiếu nội dung nguồn.

---

## Lớp 2 – Neo chapter

Mỗi chapter (`chapters[]`) có thêm:

- `camera_family`: **một** tiêu cự chủ đạo (vd `35mm`) ± 1 nấc (28 / 50). Không dùng 3 tiêu cự khác nhau trong 3 cảnh liên tiếp.
- `time_of_day`: một thời điểm duy nhất trong chapter. Giữa các chapter thời gian chỉ **tiến**, không lùi (sáng, trưa, chiều, hoàng hôn, tối).
- `lighting_lock`: màu / độ ấm ánh sáng của chapter, **nhưng vẫn ghi hướng = `light_direction_anchor`**.
- `costume`: nguyên văn; nếu đổi so với chapter trước thì phải có cảnh cầu nối (xem Lớp 4).
- `energy_range`: ví dụ `[2,3]` cho Verse, `[4,5]` cho Chorus.

---

## Lớp 3 – Khớp nối cảnh với cảnh (handoff) & Nhịp điệu hấp dẫn

### 3.0 Quy tắc 3 Pha Hành Động Sinh Động (Dynamic Engagement Rhythm)
Tránh cảnh đơ hoặc giật cục, mỗi cảnh 8 giây tuân thủ 3 pha:
1. **Pha 1 (0.0s – 2.0s) Lead-in:** Chuyển động bắt nhịp ngay từ frame đầu tiên (bước đi, vung tay nhảy múa theo phách trống đầu tiên của câu hát, không để đơ 1s đầu).
2. **Pha 2 (2.0s – 6.5s) Core Hook:** Diễn xuất vũ đạo sinh động, nụ cười rạng rỡ, tương tác mắt với camera (phá vỡ bức tường thứ 4) tạo sự gắn kết và lôi cuốn khán giả nhí.
3. **Pha 3 (6.5s – 8.0s) Dynamic Settle:** Nhân vật giảm tốc mượt mà về một tư thế rõ ràng (Readable Settle Pose, nụ cười rạng rỡ, nhịp thở tự nhiên, không đóng băng đơ cứng).

### 3.1 Cặp `end_state` -> `start_state` (bắt buộc, validator kiểm tra)

- `end_state` của cảnh N mô tả **frame cuối**: vị trí trong bối cảnh (screen-left / center / right, gần hay xa máy), tư thế từng bộ phận chính (tay, chân, đầu), **hướng mặt** (`facing camera` / `facing screen-right`…), biểu cảm, **mọi nhân vật phụ + đạo cụ đang có trong khung và vị trí của chúng**. Kết bằng câu `…and holds this pose, nearly still, for the final second.` (cảnh không có nhân vật: `…and holds this look, nearly still, for the final second.`)
- `start_state` của cảnh N+1 = `end_state` của N **chép nguyên văn** (bỏ câu "holds this pose"). Không viết lại bằng từ khác. Generator của bài nên **tự chép** để không lệch.
- Không được xuất hiện nhân vật / đạo cụ ở `start_state` mà `end_state` trước đó không nêu, và ngược lại.
- Hành động trong `scene_action` phải **kết thúc đúng** ở `end_state`; không "then walks away" sau khi đã tả tư thế cuối.

### 3.2 Kiểu nối (`transition_in` của cảnh N+1): chọn đúng 1

| Kiểu | Khi dùng | Yêu cầu viết |
|---|---|---|
| `hold` (mặc định) | Cảnh thường | N kết tư thế tĩnh; N+1 mở đúng tư thế đó, hành động mới bắt đầu sau ~0.5 s |
| `cut-on-action` | Tối đa 30% số cảnh, cho động tác đơn giản (giơ tay, cúi nhặt, bước 1 bước) | `end_state` N tả **pha** của động tác (`right hand raised to shoulder height, mid-motion`); N+1 mở đúng pha đó và **hoàn tất** động tác trong giây đầu |
| `exit-enter` | Đổi khu vực / đổi chapter | N: nhân vật đi về screen-right và **ra khỏi khung** (`out of the frame on screen-right`), 1 giây cuối khung chỉ còn bối cảnh (`only the empty <location> is visible`). N+1: 1 giây đầu khung chỉ có bối cảnh mới, nhân vật **bước vào từ mép trái**, cùng trang phục + đạo cụ cầm theo |
| `match-pose` | Chorus motif, đổi góc máy mạnh, đổi chapter khi đang nhảy / chỉ tay | Tư thế y hệt, **đổi shot size / góc** ≥ 2 nấc để cắt trông có chủ ý |
| `look-off` | Giới thiệu đồ vật / nhân vật mới | N kết với nhân vật **nhìn về screen-right ngoài khung**; N+1 là **thứ bé nhìn thấy** (không có nhân vật hoặc nhân vật từ sau lưng); N+2 quay lại nhân vật phản ứng |
| `establishing` | Chỉ cảnh 1 của video, hoặc cảnh mở chapter không có nhân vật | Khung trống bối cảnh, máy chậm |

### 3.3 Ngữ pháp cắt (cut grammar)

Thang shot: `ECU(1) · CU(2) · MCU(3) · MS(4) · MW(5) · WS(6) · EWS(7)`.

1. Mỗi lần cắt đổi **1–2 nấc**. Không đổi 0 nấc (trừ khi đổi góc ≥ 30° hoặc `match-pose`), không đổi ≥ 3 nấc.
2. Không 2 cảnh liền nhau cùng `shotSize` **và** cùng kiểu máy.
3. Sau một cảnh máy chuyển động mạnh (orbit / tracking / crane) phải là cảnh **static** hoặc **push-in chậm**. Không 3 cảnh liền đều có máy chuyển động mạnh.
4. Một cảnh = **một** kiểu máy (một câu `camera_move`, có tiêu cự + chiều cao máy).
5. Hướng pan / slide / tracking luôn cùng chiều `screen_direction` trừ khi `scene_action` nêu nhân vật quay lại có lý do.
6. Góc máy (eye-level / low / high) đổi tối đa 1 nấc mỗi cắt.

### 3.4 Đường năng lượng (`energy` 1–5)

| Phần nhạc | Energy |
|---|---|
| Intro / Outro | 1–2 |
| Verse | 2–3 |
| Pre-Chorus | 3–4 |
| Chorus / Final Chorus / Dance Break | 4–5 |
| Bridge | 2–3 |

Mỗi cắt đổi tối đa **1 nấc**; cắt vào Chorus được +2, cắt từ Chorus vào Outro được −2. Energy thể hiện qua biên độ động tác, tốc độ máy, số vật chuyển động trong khung. Tempo động tác ghi rõ (`slow`, `on the beat`, `bouncy, two moves per bar`).

---

## Lớp 4 – Cầu nối chapter (chapter bridge)

Đổi chapter là nơi dễ rời rạc nhất. Quy tắc **"đổi một biến"**: mỗi lần sang chapter chỉ đổi **bối cảnh** hoặc **trang phục**, không đổi cả hai cùng lúc.

1. **Cảnh cuối chapter N** (`bridge_out: true`): nhân vật quay / nhìn / chỉ / đi về **screen-right**; `scene_action` nhắc đến thứ thuộc chapter N+1 (cầm xô cát lên, chỉ ra cửa, nghe tiếng nhạc…). Anchor prop phải có trong `end_state`.
2. **Cảnh đầu chapter N+1** (`bridge_in: true`): `transition_in` = `exit-enter` hoặc `match-pose`; `start_state` tả nhân vật **vào từ mép trái**, **cùng trang phục và đạo cụ** với `end_state` trước; `energy` lệch ≤ 1.
3. Đổi trang phục: thêm **1 cảnh cầu nối** ở bối cảnh cũ cho thấy trang phục mới (cầm trên tay / đã mặc xong đứng cạnh cửa). Không "biến hình" giữa hai cảnh.
4. Ánh sáng: giữ hướng; nếu đổi màu (nắng vàng sang đèn ấm), `lighting_lock` chapter mới dùng cùng từ nhiệt độ màu (`warm`) để chuyển mềm.
5. Hai cảnh ở hai chapter **không bao giờ** cùng shot size + cùng camera_move: cắt đổi bối cảnh cần "có chủ ý".

---

## Lớp 5 – Kỹ thuật thực chiến trong Google Flow (ghi vào `recommended_setup`)

1. **Luôn TẮT tính năng "Enhance Prompt":** Trong giao diện Flow, tắt toggle Enhance Prompt để tránh LLM tự động chèn các từ miêu tả cơ thể nhạy cảm làm vi phạm chính sách an toàn trẻ em.
2. **Quy trình Image-to-Video (First Frame):** Với cảnh mở đầu hoặc đổi bối cảnh, nạp ảnh **Keyframe Start Frame** (tạo từ Imagen 3 / Midjourney / Flux) vào ô **First Frame** trong Flow để giữ nhân vật chuẩn 100%.
3. **Chaining Last Frame (Frames to Video):** Trong cùng bối cảnh, xuất frame thứ 8s (Last Frame) của Cảnh N làm First Frame cho Cảnh N+1. Prompt giữ tự chứa đầy đủ.
4. **Tận dụng tính năng "Extend Video" (+4s/+8s):** Cho các cảnh vũ đạo/hành động dài cần chuyển động camera mượt mà liên tục mà không phải cắt ghép.
5. **Tuân thủ giới hạn 3 Ingredients:** Không tag quá 3 `@Tag` trong bất kỳ cảnh nào. Nếu cần nhiều nhân vật, ghép vào ảnh Start Frame trước.
6. **Chọn take theo frame cuối**: mỗi cảnh sinh ≥ 2 output, chọn take có frame cuối **giống `end_state` nhất**. Nếu không take nào khớp thì re-roll **trước khi** sang cảnh sau. Không sửa cảnh sau để khớp cảnh sai (gây trôi dây chuyền).
7. **Hậu kỳ:** cắt 0.3–0.5 s đầu / cuối mỗi clip (phần Veo hay "khởi động"), cắt đúng nhịp trống; nếu còn lệch dùng cross-dissolve 6–8 frame. Không dùng wipe / zoom transition, chúng làm lộ sự rời rạc.

---

## Những cụm từ CẤM trong `prompt` (validator báo lỗi)

`previous scene`, `previous clip`, `previous numbered clip`, `direct continuation`, `continue from`, `continue as`, `continues from`, `same as before`, `as before`, `moments later`, `earlier scene`, `last scene`, `next scene`, `the previous`, `before this`.

Thay bằng mô tả tuyệt đối: *"The clip opens on exactly this first frame: …"* / *"The clip ends on exactly this final frame: …"*.

---

## Quy trình khi viết `scenes`

0. **Lớp 0 trước:** Read ảnh reference → chọn preset → viết `appearance_lock`, `source_file`, `render_style`; chọn `style_anchor` / `format_lock` / `negativePrompt` đúng phong cách.
1. Viết **bảng chapter manifest** (Brief mục 4 + heading "Ảnh cần tạo trước" + checklist) và bảng **continuity map** (Brief mục 5b): `# | chapter | energy | shot | camera | transition_in | end_state (tóm tắt) | props in frame`.
2. Duyệt bảng theo Lớp 3–4 (ladder, alternation, bridge) **trước khi** viết prompt.
3. Viết `end_state` cảnh 1, chép thành `start_state` cảnh 2, viết `scene_action` 2, rồi `end_state` 2, … (viết tuần tự, không viết action trước rồi "vá" state). Nên viết trong một **generator** `scripts/flows/<slug>.mjs` để máy tự chép state và tự đổi preset ảnh.
4. `npm run flow:assemble -- data/g-flow/<slug>-flow-16x9.json` (ghép prompt, character_lock theo dàn nhân vật, scene_numbers, upload_checklist).
5. `npm run flow:validate -- data/g-flow/<slug>-flow-16x9.json`; sửa đến khi **0 error**; đọc hết warning. Dán kết quả vào câu trả lời cùng **bảng chapter + danh sách upload** cho người dùng.

## Required keyframe-first workflow
For every scene, keyframe_prompt must describe a static 16:9 composition matching start_state and all visible references, props, costume and setting. Create and inspect one still per scene from keyframe_prompt before video generation. Save to data/g-flow/assets/<slug>/scene-XX-start.png; set start_frame to the real path and keyframe_status to ready. Until then use prompt_ready and an empty start_frame. In Google Flow, load start_frame as Starting Frame/First Frame, then use scenes[].prompt only to animate from that image toward end_state. Never run text-to-video first or use keyframe_prompt as the motion prompt.
