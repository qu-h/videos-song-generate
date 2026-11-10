# 🎬 WORKFLOW: Chủ đề → Bài hát Suno → Video Google Flow

> File này là **quy trình chuẩn cho AI**. Khi người dùng chỉ đưa một **chủ đề** (ví dụ: *"Nhật Minh đi tắm biển"*), AI phải đọc file này và tự tạo **đủ 3 file đầu ra** theo đúng thứ tự, đúng định dạng bên dưới — không hỏi lại trừ khi chủ đề thực sự mơ hồ.

---

## 0. Tổng quan đầu ra

| # | File | Đường dẫn | Dùng cho |
|---|------|-----------|----------|
| 1 | **Production Brief** – mô tả chi tiết nội dung, nhân vật, bối cảnh, chapter, cảnh quay | `data/briefs/<slug>.md` | Người dùng duyệt + tạo ảnh reference |
| 2 | **Song MD** – chủ đề, style, lời bài hát cho Suno | `data/songs/<slug>.md` | Dán vào Suno |
| 3 | **Google Flow JSON** – danh sách cảnh để Flow tạo video tự động | `data/g-flow/<slug>-flow-16x9.json` | Nạp vào Google Flow |

`<slug>` = tên bài hát viết thường, bỏ dấu, nối bằng `-` (giống `toSlug()` trong [scripts/new-song.mjs](scripts/new-song.mjs)). Ví dụ: *"Nhật Minh đi tắm biển"* → `nhat-minh-di-tam-bien`.

**Thứ tự bắt buộc:** Brief (1) → Song (2) → Flow JSON (3). File sau phải dùng đúng tên nhân vật, tag, chapter và lời bài hát của file trước.

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
| Số chapter | 3–6 (theo số bối cảnh/trang phục) |

Nếu người dùng đưa thêm nhân vật phụ (ví dụ `@NhatAnh`, `@GoldenCat`), thêm vào bảng nhân vật.

---

## 2. Khái niệm Chapter trong Google Flow

Google Flow hiện có **Chapter**. Quy ước trong dự án này:

- **1 chapter = 1 nhóm cảnh liên tiếp dùng chung bối cảnh + trang phục + bộ ảnh reference (ingredients).**
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
6. Cảnh đầu tiên của mỗi chapter dùng `continuityFromPreviousScene` để mô tả chuyển cảnh từ chapter trước (đi ra cửa, chuyển ánh sáng, match-cut…).
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

## 6. Bảng màu & âm hưởng hình ảnh
- **Palette:** ...
- **Ánh sáng từng chapter:** ...
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
- Mỗi cảnh **một hành động chính**, dễ đọc với trẻ nhỏ.
- Chorus lặp lại → hình ảnh có **motif lặp** (cùng động tác/vũ đạo) nhưng đổi góc máy.
- Bối cảnh mô tả bố cục cố định (cái gì bên trái/phải/giữa) để không bị lật gương giữa các cảnh.

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

Kế thừa cấu trúc file mẫu [data/g-flow/nhat-minh-rang-sua-thu-2-flow-16x9-cinematic-v2.json](data/g-flow/nhat-minh-rang-sua-thu-2-flow-16x9-cinematic-v2.json) và **bổ sung `chapters` + `ingredients`**.

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
      "lighting": "warm morning sunlight from screen-left",
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
        "character_lock": "Use the approved uploaded character reference for @NhatMinh. Preserve @NhatMinh's approved face exactly, including facial proportions, hairstyle, skin tone, body proportions, apparent age, clothing, colors, patterns and shoes. Do not redesign, recolor, restyle, or age the child. Keep @NhatMinh visually identical in all clips. Chapter costume: blue t-shirt, beige shorts.",
        "background_lock": "@Bedroom is the fixed approved background reference of Chương 1 – Phòng ngủ. It is the exact same bright children's bedroom: <liệt kê bố cục: vật gì ở screen-left / screen-right / rear-center, màu tường, sàn>. Preserve the exact layout, positions, scale, colors and materials. Do not mirror, rotate, redesign or randomly decorate the room. Do not add extra doors, windows, furniture, people or animals. Keep <A> on screen-left and <B> on screen-right. Never swap left and right.",
        "lighting_lock": "Use the same warm morning sunlight from screen-left in every clip of this chapter. Keep identical brightness, light direction, white balance, shadow softness and color temperature.",
        "continuity_lock": "Treat this clip as a direct continuation of the previous numbered clip. Keep the same camera height, character scale, daylight direction, weather and season. Only introduce a prop when the scene explicitly introduces it. Keep each prop in the same logical position until it is explicitly moved or removed. No teleporting characters or props."
      }
    }
  ],
  "format_lock": "Create one continuous 8-second video in 16:9 landscape format. Photorealistic cinematic live-action children's music video, realistic skin, hair, fabric, natural body movement. Use one camera angle or one smooth camera movement only. No abrupt cuts, montage, or internal scene transition. Keep the final two seconds visually stable. Do not generate text in the image. No subtitles, captions, dialogue, logo, or watermark.",
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
      "ingredients": ["@NhatMinh", "@Bedroom"],
      "character_reference": "@NhatMinh",
      "background_reference": "@Bedroom",
      "continuityFromPreviousScene": "Opening scene. ...",
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
      "scene_action": "@NhatMinh stands near the mirror, discovers a loose front baby tooth, touches it gently, looks surprised, then smiles excitedly.",
      "camera_move": "Use a slow dolly-in at eye level.",
      "prompt": "<character_lock> <background_lock> <continuity_lock> <lighting_lock> <format_lock> Scene-specific continuity state: <continuityFromPreviousScene> Scene action: <scene_action> <camera_move> The room must remain recognizable as the exact same @Bedroom reference from the first frame to the last frame. Do not generate a new room interpretation.",
      "voiceover": "<câu tiếng Việt mô tả cảnh – dùng cho hậu kỳ/nội dung, KHÔNG đưa vào Flow>",
      "text_overlay": "<chữ ngắn 2–5 từ chèn ở hậu kỳ, hoặc lời hát karaoke>",
      "negativePrompt": "cartoon plastic skin, uncanny face, changed identity, adult-looking child, extra fingers, deformed hands, duplicate character, mirrored layout, random text, subtitles, logo, watermark, black bars, portrait framing, camera shake"
    }
  ]
}
```

### Cách ghép `prompt` (theo mẫu đã dùng thực tế)

> Mẫu tham chiếu đã chạy tốt: [google-flow-scenes/data/nhat-anh/em_be_choi_voi_meo_vang_beo_tron_tren_san_24_canh.json](../google-flow-scenes/data/nhat-anh/em_be_choi_voi_meo_vang_beo_tron_tren_san_24_canh.json)

Mỗi lần Flow sinh video là **độc lập**, không nhớ cảnh trước → `prompt` của **mọi cảnh** phải là **bản đầy đủ, tự chứa**, ghép **nguyên văn** theo thứ tự:

```
1. character_lock   (của chapter – gọi @NhatMinh, + mỗi nhân vật phụ một đoạn mô tả cố định có tag @)
2. background_lock  (của chapter – gọi @<Background>, bố cục trái/phải/giữa)
3. continuity_lock  (của chapter)
4. lighting_lock    (của chapter)
5. format_lock      (toàn project)
6. "Scene-specific continuity state: " + continuityFromPreviousScene
7. "Scene action: " + scene_action          ← phần duy nhất thay đổi nhiều giữa các cảnh
8. camera_move                               ← đúng MỘT kiểu máy
9. "The room must remain recognizable as the exact same @<Background> reference from the first frame to the last frame. Do not generate a new room interpretation."
```

- Khối 1–5 **copy y hệt** giữa các cảnh cùng chapter (không viết lại theo cách khác) → giúp Flow giữ nhân vật/bối cảnh ổn định.
- Sang chapter mới thì đổi khối 1–4 theo `chapters[].prompt_blocks` của chapter đó.
- Nhân vật phụ: mô tả cố định một lần trong `characters`, rồi lặp nguyên văn trong `character_lock`, ví dụ: `@GoldenCat is one fixed character: a small chubby round golden-orange cat ... green collar with one small red bell. Keep ... identical in every clip.`
- Câu khẳng định số nhân vật: `Only @NhatMinh and @<X> may appear as living characters.`

### Quy tắc viết từng cảnh
1. **`prompt` viết tiếng Anh**, ghép theo khung trên. `scene_action` 1–3 câu, **một hành động chính**, gọi nhân vật bằng tag `@`.
2. Đạo cụ mới phải có chữ `introduces one ...` trong `scene_action` và ghi rõ vị trí đặt; cảnh sau nhắc lại vị trí đạo cụ trong `continuityFromPreviousScene`.
3. Giữ hướng di chuyển nhất quán (trái → phải) và tư thế cuối cảnh trước = tư thế đầu cảnh sau.
4. Camera đa dạng: wide, medium, close-up, low-angle hero, tracking, orbit, dolly — không lặp cùng một kiểu quá 2 cảnh liền.
5. Cảnh Chorus: động tác nhảy/hook giống nhau giữa các lần chorus (motif), khác góc máy hoặc bối cảnh chapter.
6. `negativePrompt` dùng khối chuẩn + bổ sung theo chủ đề (ví dụ biển: `deep water, drowning, big waves`).
7. `timecode` liên tục, không trùng, không hở; tổng = `audio_duration` (cảnh cuối có thể ngắn hơn).
8. Không có chữ, logo, phụ đề, lời thoại trong video.
9. `voiceover` (tiếng Việt) và `text_overlay` chỉ dùng cho hậu kỳ — **không** chép vào `prompt`.
10. Cảnh cuối: `keep the final two seconds completely still` để dễ kết video.

---

## 6. Kiểm tra chéo trước khi kết thúc (AI tự check)

- [ ] 3 file cùng `slug`, cùng tên bài hát.
- [ ] `total_scenes` = số phần tử `scenes` = số dòng shot list trong Brief.
- [ ] Mỗi `scene.chapter_id` tồn tại trong `chapters`; `scene_number` nằm trong `scene_range` của chapter.
- [ ] Mỗi tag trong `scene.ingredients` thuộc `global_ingredients` hoặc `chapters[chapter_id].ingredients`.
- [ ] Mọi tag `@...` trong `prompt` đều có trong `scene.ingredients`.
- [ ] `prompt` mỗi cảnh chứa nguyên văn `prompt_blocks` của đúng chapter + `format_lock` (không tóm tắt, không viết lại).
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
