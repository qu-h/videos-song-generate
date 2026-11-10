---
slug: "be-anh-di-halloween"
title: "Bé Ánh Đi Halloween"
topic: "Halloween – bé gái hóa phù thủy nhỏ, sôi động nhưng đơn giản, cho bé 2–3 tuổi"
audience: "Thiếu nhi 2–3 tuổi"
mood: "vui nhộn, nảy, dễ thương, tuyệt đối không đáng sợ"
estimatedDuration: "03:20"
videoModel: "Veo 3.1"
sceneDurationSeconds: 8
totalScenes: 25
aspectRatio: "16:9"
visualStyle: "stylized 3D animated children's music video matching the @NhatAnh character reference sheet, bright warm candy colors, cute friendly Halloween"  # phong cách hình PHẢI theo ảnh reference thật sự upload lên Flow (mục 3)
referencePreset: "design-sheet"   # design-sheet | real-photo – đổi bằng REF=... khi chạy scripts/flows/be-anh-di-halloween.mjs
createdAt: "2026-11-10"
updatedAt: "2026-11-10"
status: "flow_ready_estimated_timing"   # đã có Flow JSON, timecode dự kiến 03:20 – căn lại khi có thời lượng MP3
chapterCount: 5
files:
  song: "data/songs/be-anh-di-halloween.md"
  flow: "data/g-flow/be-anh-di-halloween-flow-16x9.json"
  generator: "scripts/flows/be-anh-di-halloween.mjs"
  photoReference: "data/sample-data/"                      # ảnh reference của bé (gitignored)
  mainReferenceFile: "data/sample-data/Character_design_sheet_for_girl_875b8ecf.jpg"
---

# Bé Ánh Đi Halloween – Production Brief

## 1. Ý tưởng & thông điệp
- **Logline:** Bé Ánh đội mũ phù thủy, khoác áo choàng sao vàng, đi một vòng Halloween đầy màu sắc: đếm bí ngô, kết bạn với mèo đen và ma nhỏ, xin kẹo, chia kẹo, rồi ngủ ngon dưới trăng.
- **Thông điệp cho bé:** Halloween là để vui, không phải để sợ. Bé biết nói "cảm ơn ạ" và chia sẻ với bạn.
- **Mạch cảm xúc:** hào hứng hóa trang → vui đếm bí ngô → tò mò gặp bạn mới → hơi ngạc nhiên rồi ôm ma nhỏ → nhảy múa tưng bừng → ấm áp, buồn ngủ.
- **Nguyên tắc cho lứa 2–3 tuổi:**
  - Mỗi cảnh chỉ một hành động lớn, rõ ràng, chậm vừa phải.
  - Màu sáng, tương phản tốt.
  - Không bóng tối thật, không jump-scare, không âm thanh gắt.
  - Ma, mèo đen, dơi đều tròn trịa, mắt to và luôn cười.

## 2. Cốt truyện theo cấu trúc bài hát
| Phần nhạc | Nội dung câu chuyện |
|-----------|--------------------|
| Intro | Phòng bé chiều tối, đèn bí ngô nhỏ sáng lên. Bé Ánh ló ra từ sau tủ quần áo với chiếc mũ phù thủy. |
| Verse 1 | Bé đứng trước gương, xoay áo choàng, vẫy tay, tự hào: "Phù thủy nhỏ đây!" |
| Pre-Chorus (lặp) | Động tác cố định: vỗ tay 2 lần → xoay 1 vòng (motif lặp mỗi lần) |
| Chorus 1 | Bé chạy ra cổng, đi vào vườn bí ngô hoàng hôn, lắc lư nhún nhảy |
| Verse 2 | Bé chỉ tay đếm 1–2–3 quả bí ngô (bí ngô có mặt cười). Bé ôm một quả nhỏ, "nặng quá", cười khúc khích |
| Chorus 2 | Bí ngô "cười" theo nhịp, bé nhảy giữa vườn |
| Verse 3 | Phố nhỏ lồng đèn: mèo đen đeo nơ cam xuất hiện, kêu meo meo, nhảy lon ton cùng bé |
| Bridge | Ma nhỏ trắng tròn ló ra sau lồng đèn, "hù" nhẹ. Bé ngạc nhiên rồi cười, ôm ma nhỏ, ba bạn nắm tay |
| Dance Break | Ba bạn nhảy theo khẩu lệnh: dậm chân, vẫy tay, nhảy lên, ngồi xuống, đứng lên |
| Verse 4 | Gõ cửa nhà trang trí bí ngô. Giỏ kẹo đầy, bé cúi đầu "cảm ơn ạ", chia kẹo cho mèo đen và ma nhỏ |
| Chorus 3 + Final | Tiệc Halloween nhỏ trong sân nhà: dây đèn, bóng bay cam-tím, confetti, cả ba nhảy vòng tròn |
| Outro | Trăng tròn, bé ngủ trên giường, ôm gối bí ngô. Mèo đen cuộn tròn, ma nhỏ đắp chăn. Đèn bí ngô tắt dần |

## 3. Nhân vật (Character Bible)

### @NhatAnh – bé Ánh (nhân vật chính, dùng mọi chapter)
> Giả định bé tên **Nhật Ánh** (theo series `nhat-anh` có sẵn trong repo). Nếu tên khác, đổi tag và tên trong lời bài hát.

> **Quy tắc Lớp 0 (skill `flow-scene-continuity`):** `appearance_lock` của @NhatAnh trong Flow JSON được viết **sau khi nhìn ảnh reference thật** trong `data/sample-data/`, và phải mô tả **đúng kiểu tóc + trang phục trong chính ảnh sẽ upload lên Flow**. Phong cách hình của cả video (`render_style`) đi theo ảnh đó. Đổi ảnh = chạy lại generator với preset khác.

**Ảnh reference có trong `data/sample-data/` (2 lựa chọn, chọn ĐÚNG 1 và upload cùng một file vào mọi chapter):**

| Preset (`REF=`) | File | Ảnh cho thấy | `render_style` |
|---|---|---|---|
| `design-sheet` **(đang dùng)** | `Character_design_sheet_for_girl_875b8ecf.jpg` | Character sheet 3D kiểu Pixar: tóc nâu sẫm **búi nhỏ trên đỉnh đầu**, vài sợi lòa xòa ở trán; **váy vàng nhạt không tay, hai quai hoa vàng**; **quần bloomer trắng**; **sandal trắng đục lỗ** | `stylized-3d` |
| `real-photo` | `20261109_212148.jpg` (+ 11 ảnh cùng loạt) | Ảnh thật: tóc đen thẳng **mái bằng dày**, mũ phù thủy vành lưới in sao vàng, áo choàng đen in bí ngô/dơi vàng, áo thun kem in mặt mèo cam, quần caro cam đào | `photoreal` |

- **appearance_lock (preset `design-sheet`, chép nguyên văn vào JSON – không tả cơ thể/da/má):** tóc nâu sẫm búi nhỏ trên đỉnh đầu + vài sợi lòa xòa; **trang phục nền đúng như sheet**: váy vàng nhạt không tay hai quai hoa vàng, quần bloomer trắng, sandal trắng đục lỗ; **phụ kiện Halloween khoác THÊM bên ngoài** (không thay thế trang phục trong ảnh): mũ phù thủy nhọn đen vành rộng in sao/trăng/bí ngô vàng kim, áo choàng đen mỏng in bí ngô/dơi/sao vàng kim buộc nơ đen ở cổ. Mũ chỉ tháo ở cảnh 24 (đặt ở chân giường).
- **Tính cách trên hình:** hồn nhiên, hay cười, tò mò, hơi rụt rè rồi mạnh dạn.
- **Cách upload (preset `design-sheet`):** crop ô **FRONT** hoặc **3/4 VIEW** của sheet (hoặc dùng nguyên sheet), upload vào **tất cả 5 chapter** với tên `@NhatAnh`. Không upload lẫn ảnh thật và sheet.

**Nếu muốn dùng ảnh thật (preset `real-photo`):** chạy `REF=real-photo node scripts/flows/be-anh-di-halloween.mjs data/g-flow/be-anh-di-halloween-flow-16x9.json` rồi `npm run flow:assemble` + `npm run flow:validate`. Khi đó:

**Cách 1 (khuyên dùng):** crop trực tiếp ảnh `20261109_212148.jpg`, lấy từ đỉnh mũ tới chân, rồi upload vào Flow với tên `@NhatAnh`. Giữ được khuôn mặt thật tốt nhất.

**Cách 2 – làm sạch nền** (ảnh gốc nền nhiều đồ và có người lớn phía sau). Dùng Gemini / Nano Banana hoặc Flow → *Create image*, đính kèm `20261109_212148.jpg` và 1–2 ảnh khác:
```text
Using the attached photos of this little girl, create a clean photorealistic full-body reference photo of the SAME real child. Keep her face 100% identical – do not beautify, stylize or change her features: round chubby face, rosy cheeks, straight black hair with thick blunt bangs at eyebrow level and shoulder-length sides, round dark-brown eyes, small nose, toddler proportions (2–3 years old). Keep her exact costume: black pointed witch hat with a wide sheer black mesh brim printed with gold glitter stars, moons and pumpkins; long sheer black cape printed with gold pumpkins, bats and stars, tied at the neck with a black ribbon; cream long-sleeve t-shirt with an orange cat-face print; light peach gingham checkered pants; add small orange ballet flats. Standing, front view, gentle smile, centered, plain light-cream studio background, soft natural light, real photo quality, no other people or objects, no text, 16:9.
```
➡️ So sánh ảnh kết quả với ảnh thật. Chỉ dùng ảnh **giống mặt bé**, rồi upload lên Flow với tên **`@NhatAnh`**.

### @MeoDen – bạn mèo đen (chapter 3, 4)
- Mèo con đen bóng tròn trịa, mắt xanh lá to tròn, má hồng nhạt, tai tròn nhỏ, đuôi dài cong.
- Đeo nơ ruy băng màu cam có một chuông vàng nhỏ ở cổ.
- Luôn vui vẻ, nhảy lon ton.
```text
Adorable 3D animated storybook black kitten, small and chubby, glossy black fur, huge round green eyes with sparkles, soft pink cheeks, tiny round ears, long curled tail, an orange ribbon bow with one small golden bell on its neck, friendly happy smile, sitting, full body, front three-quarter view, plain light-cream background, no text, 16:9.
```

### @MaNho – bạn ma nhỏ (chapter 3, 4)
- Con ma nhỏ hình giọt nước tròn như chiếc khăn trắng mềm, thấp hơn bé Ánh.
- Mắt đen tròn to long lanh, má hồng, miệng cười nhỏ.
- Hai "tay" nhỏ tròn, phát sáng trắng nhẹ, bay lơ lửng thấp.
- **Tuyệt đối không đáng sợ.**
```text
Cute friendly 3D animated storybook little ghost, round soft white sheet-like body shaped like a gumdrop, smaller than a toddler, big shiny black round eyes, rosy pink cheeks, tiny happy smile, two small rounded arm nubs, faint soft white glow, floating slightly above the ground, absolutely not scary, full body, front view, plain light-cream background, no text, 16:9.
```

## 4. Chapter & ảnh reference (Ingredients)
| Chapter | Tên chapter trong Flow | Cảnh (dự kiến) | Phần nhạc | Bối cảnh | Tag ảnh |
|---------|------------------------|----------------|-----------|----------|---------|
| ch1 | Chương 1 – Phòng của bé | 1–5 | Intro, Verse 1, Pre-Chorus | Phòng ngủ bé, chiều tối, đèn bí ngô nhỏ | @NhatAnh, @PhongBe |
| ch2 | Chương 2 – Vườn bí ngô | 6–12 | Chorus 1, Verse 2, Pre-Chorus, Chorus 2 | Vườn bí ngô hoàng hôn | @NhatAnh, @VuonBiNgo, @GioBiNgo |
| ch3 | Chương 3 – Phố lồng đèn | 13–20 | Verse 3, Bridge, Dance Break, Verse 4 | Con phố nhỏ có lồng đèn và nhà trang trí | @NhatAnh, @MeoDen, @MaNho, @PhoLongDen, @GioBiNgo |
| ch4 | Chương 4 – Tiệc Halloween | 21–23 | Pre-Chorus, Chorus 3, Final Chorus | Sân tiệc nhỏ buổi tối | @NhatAnh, @MeoDen, @MaNho, @SanTiec, @GioBiNgo |
| ch5 | Chương 5 – Giấc ngủ | 24–25 | Outro | Phòng ngủ ban đêm dưới ánh trăng | @NhatAnh, @MeoDen, @MaNho, @PhongBe |

> **5 chapter – danh sách này phải giống hệt nhau ở: bảng trên, các heading "Ảnh cần tạo trước" bên dưới, `chapters[]` trong JSON và checklist mục 8.** `npm run flow:validate` đối chiếu Brief ↔ JSON.
>
> Chương 5 dùng lại `@PhongBe` (prompt mô tả bản ban đêm). Hãy upload `@PhongBe` vào cả Chương 1 và Chương 5.
>
> **Prompt tạo ảnh reference chuẩn (đúng `render_style` của preset đang dùng)** cho mọi bối cảnh, `@MeoDen`, `@MaNho` và `@GioBiNgo` nằm trong `chapters[].ingredients[].image_prompt` của file [be-anh-di-halloween-flow-16x9.json](../g-flow/be-anh-di-halloween-flow-16x9.json) – generator tự đổi tiền tố "Stylized 3D animated" / "Photorealistic real" theo preset. Các prompt bên dưới chỉ để tham khảo **bố cục**.
>
> **Danh sách upload từng chapter (`chapters[].upload_checklist` trong JSON):**
>
> | Chapter | Số ảnh | Upload đúng tên |
> |---|---|---|
> | Chương 1 – Phòng của bé | 2 | @NhatAnh, @PhongBe |
> | Chương 2 – Vườn bí ngô | 3 | @NhatAnh, @VuonBiNgo, @GioBiNgo |
> | Chương 3 – Phố lồng đèn | 5 | @NhatAnh, @MeoDen, @MaNho, @PhoLongDen, @GioBiNgo |
> | Chương 4 – Tiệc Halloween | 5 | @NhatAnh, @MeoDen, @MaNho, @SanTiec, @GioBiNgo |
> | Chương 5 – Giấc ngủ | 4 | @NhatAnh, @MeoDen, @MaNho, @PhongBe |

### Ảnh cần tạo trước (theo chapter)
Mọi bối cảnh đều **không có người**, góc ngang tầm mắt trẻ em, 16:9, cùng một phong cách với ảnh reference của @NhatAnh (preset `design-sheet` → stylized 3D; `real-photo` → photorealistic).

#### Chương 1 – Phòng của bé
- `@PhongBe` – phòng ngủ ấm áp. Bố cục cố định:
  - **Trái:** giường nhỏ chăn màu cam đào, gối hình bí ngô.
  - **Giữa phía sau:** cửa sổ lớn nhìn ra trời hoàng hôn tím cam, rèm trắng.
  - **Phải:** gương đứng khung gỗ tròn và tủ quần áo gỗ sáng.
  - **Sàn:** gỗ sáng, thảm tròn màu kem.
  - **Đồ trang trí:** đèn bí ngô nhỏ cười trên bệ cửa sổ, dây đèn vàng ấm.
```text
Cozy 3D animated storybook toddler bedroom at early evening, eye-level child height, wide 16:9. Screen-left: small bed with peach-orange blanket and a pumpkin-shaped pillow. Rear-center: large window showing a purple-orange sunset sky, white curtains, a small smiling jack-o'-lantern glowing on the window sill. Screen-right: round wooden standing mirror and a light-wood wardrobe. Light-wood floor with a round cream rug in the center, warm yellow string lights along the wall. Bright warm cute atmosphere, not dark, no people, no text.
```

#### Chương 2 – Vườn bí ngô
- `@VuonBiNgo` – vườn bí ngô lúc hoàng hôn vàng cam. Bố cục cố định:
  - **Trái:** hàng rào gỗ trắng thấp và cổng nhỏ.
  - **Giữa:** lối đi đất nhỏ, hai bên là bí ngô cam đủ cỡ, có quả khắc mặt cười.
  - **Phải:** bù nhìn rơm dễ thương đội mũ phù thủy tím.
  - **Phía sau:** đồi thấp, trời hồng cam, vài con dơi hoạt hình nhỏ bay xa.
- `@GioBiNgo` (đạo cụ) – giỏ đựng kẹo hình bí ngô cam có mặt cười và quai đen.
```text
3D animated storybook pumpkin patch at golden sunset, eye-level child height, wide 16:9. Screen-left: low white wooden fence with a small gate. Center: small dirt path with bright orange pumpkins of many sizes on both sides, some carved with friendly smiling faces. Screen-right: a cute friendly scarecrow wearing a purple witch hat. Background: gentle low hills, pink-orange sky, a few tiny cartoon bats flying far away. Bright, warm, cheerful, not scary, no people, no text.
```
```text
3D animated storybook trick-or-treat candy bucket shaped like a bright orange pumpkin with a cute smiling face and a black handle, empty, plain light-cream background, no text, 16:9.
```

#### Chương 3 – Phố lồng đèn
- `@PhoLongDen` – con phố nhỏ buổi chạng vạng sáng, tím xanh nhạt. Bố cục cố định:
  - **Trái:** ngôi nhà nhỏ màu kem, cửa gỗ tròn đỏ có vòng hoa lá thu và đèn bí ngô ở bậc thềm.
  - **Giữa:** đường lát đá sáng màu, trên cao giăng dây lồng đèn cam, tím, vàng.
  - **Phải:** cây nhỏ lá cam vàng, ghế gỗ, vài quả bí ngô.
  - **Bầu trời:** trăng tròn vàng lớn, sao lấp lánh.
  - **Ánh sáng:** đèn ấm vàng cam, đủ sáng, không u tối.
```text
3D animated storybook small village street at bright twilight, soft lavender-blue sky with a big friendly yellow full moon and twinkling stars, eye-level child height, wide 16:9. Screen-left: small cream cottage with a round red wooden door, autumn leaf wreath and a smiling jack-o'-lantern on the steps. Center: light cobblestone street with strings of orange, purple and yellow paper lanterns overhead. Screen-right: small tree with orange-yellow leaves, a wooden bench and a few pumpkins. Warm glowing lights, cozy and cheerful, never dark or spooky, no people, no text.
```

#### Chương 4 – Tiệc Halloween
- `@SanTiec` – sân sau nhà làm tiệc Halloween nhỏ. Bố cục cố định:
  - **Trái:** bàn thấp phủ khăn tím, trên bàn có bánh cupcake cam và kẹo.
  - **Giữa:** bãi cỏ tròn, phía trên giăng dây đèn vàng ấm.
  - **Phải:** chùm bóng bay cam, tím, đen có mặt cười.
  - **Phía sau:** hàng rào gỗ và trăng tròn.
- `@MeoDen`, `@MaNho`, `@GioBiNgo` – dùng lại đúng các ảnh đã tạo cho Chương 3 (upload lại vào chapter này).
```text
3D animated storybook backyard mini Halloween party at evening, eye-level child height, wide 16:9. Screen-left: low table with a purple tablecloth, orange cupcakes and colorful wrapped candies. Center: round soft green lawn under warm yellow string lights. Screen-right: bunch of orange, purple and black balloons with smiling faces. Background: wooden fence and a big friendly full moon. Festive, bright, cheerful, not scary, no people, no text.
```

#### Chương 5 – Giấc ngủ
- `@PhongBe` – **dùng lại ảnh của Chương 1** (cùng file), upload thêm vào Chương 5; prompt cảnh mô tả bản ban đêm: trăng tròn ngoài cửa sổ, ánh trăng xanh nhạt, đèn bí ngô sáng ấm nhỏ.
- `@MeoDen`, `@MaNho` – dùng lại ảnh của Chương 3.
- Không cần tạo ảnh mới cho chapter này.

## 5. Bảng phân cảnh (Shot List – dự kiến)
> Thời gian dự kiến cho bài khoảng 3:20 (25 cảnh × 8 giây). **Sẽ căn chỉnh lại theo MP3 thực tế** trước khi tạo file Flow JSON.

| # | Chapter | Thời gian | Lời hát | Hành động | Shot / Camera | Tag |
|---|---------|-----------|---------|-----------|---------------|-----|
| 1 | ch1 | 00:00–00:08 | [Intro] "Hù! Hù!" | Đèn bí ngô trên bệ cửa sổ bật sáng, cười | wide, slow push-in | @PhongBe |
| 2 | ch1 | 00:08–00:16 | "Halloween tới rồi!" | Bé Ánh ló ra từ sau tủ, cười khúc khích | medium, gentle pan | @NhatAnh @PhongBe |
| 3 | ch1 | 00:16–00:24 | "Mũ nhọn đội lên đầu…" | Bé đứng trước gương, chỉnh mũ, khoe áo choàng | medium, slide L→R | @NhatAnh @PhongBe |
| 4 | ch1 | 00:24–00:32 | "Xoay xoay áo choàng bay…" | Bé xoay một vòng, áo choàng bay, sao vàng lấp lánh | medium-wide, slow orbit | @NhatAnh @PhongBe |
| 5 | ch1 | 00:32–00:40 | Pre-Chorus "Một, hai, ba!…" | **Motif:** vỗ tay 2 lần → xoay 1 vòng | wide, static | @NhatAnh @PhongBe |
| 6 | ch2 | 00:40–00:48 | Chorus 1 "Halloween…" | Bé đẩy cổng gỗ, chạy vào vườn bí ngô | wide, tracking L→R | @NhatAnh @VuonBiNgo |
| 7 | ch2 | 00:48–00:56 | "Lắc lư… Bum bum bum!" | Bé nhún nhảy giữa lối đi, bí ngô mặt cười như lắc theo | medium, low angle | @NhatAnh @VuonBiNgo |
| 8 | ch2 | 00:56–01:04 | "Bí ngô cam cam cam…" | Bé ngồi xổm ngắm bí ngô tròn | medium close-up | @NhatAnh @VuonBiNgo |
| 9 | ch2 | 01:04–01:12 | "Một quả! Hai quả! Ba quả!" | Bé chỉ tay đếm 3 quả, mỗi quả sáng lên khi được đếm | wide, slow pan | @NhatAnh @VuonBiNgo |
| 10 | ch2 | 01:12–01:20 | "Bé ôm một quả nhỏ… Nặng quá!" | Bé ôm quả bí nhỏ, loạng choạng nhẹ, cười | medium, push-in | @NhatAnh @VuonBiNgo |
| 11 | ch2 | 01:20–01:28 | Pre-Chorus | **Motif** vỗ tay → xoay. Bé nhận giỏ bí ngô @GioBiNgo từ cạnh bù nhìn | wide | @NhatAnh @VuonBiNgo @GioBiNgo |
| 12 | ch2 | 01:28–01:36 | Chorus 2 | Bé xách giỏ nhảy dọc lối đi về phía cổng phải | tracking L→R | @NhatAnh @VuonBiNgo @GioBiNgo |
| 13 | ch3 | 01:36–01:44 | "Meo meo, ai đấy nhỉ?" | Bé đi vào phố lồng đèn, dừng lại nghe | wide establishing | @NhatAnh @PhoLongDen @GioBiNgo |
| 14 | ch3 | 01:44–01:52 | "Mèo đen nhỏ xíu xiu…" | Mèo đen nhảy ra từ ghế gỗ, chuông leng keng | medium, low angle | @NhatAnh @MeoDen @PhoLongDen |
| 15 | ch3 | 01:52–02:00 | "Meo meo… nhảy lon ton" | Bé và mèo cùng nhảy lon ton trên đường đá | tracking side | @NhatAnh @MeoDen @PhoLongDen |
| 16 | ch3 | 02:00–02:08 | Bridge "Hù hù, ai thế nhỉ?" | Ma nhỏ ló ra sau lồng đèn, "hù" nhẹ. Bé tròn mắt "ồ!" | medium, gentle push-in | @NhatAnh @MeoDen @MaNho @PhoLongDen |
| 17 | ch3 | 02:08–02:16 | "Ôm một cái nào!" | Bé ôm ma nhỏ, mèo dụi chân, cả ba cười | medium close-up, slow orbit | @NhatAnh @MeoDen @MaNho @PhoLongDen |
| 18 | ch3 | 02:16–02:24 | Dance Break "Dậm chân! Vẫy tay!" | Ba bạn dậm chân, vẫy tay theo nhịp | wide, static front | @NhatAnh @MeoDen @MaNho @PhoLongDen |
| 19 | ch3 | 02:24–02:32 | "Nhảy lên!… Ngồi xuống… đứng lên!" | Ba bạn nhảy lên, ngồi xuống, bật dậy | wide, slight crane up | @NhatAnh @MeoDen @MaNho @PhoLongDen |
| 20 | ch3 | 02:32–02:40 | Verse 4 "Cốc cốc cốc…" | Bé gõ cửa đỏ. Cửa mở, một chiếc tay áo len cam thả kẹo vào giỏ. Bé cúi đầu cảm ơn | medium, over-shoulder | @NhatAnh @MeoDen @MaNho @PhoLongDen @GioBiNgo |
| 21 | ch4 | 02:40–02:48 | "Một kẹo cho mèo đen…" | Ở sân tiệc, bé chia kẹo cho mèo và ma nhỏ | medium | @NhatAnh @MeoDen @MaNho @SanTiec |
| 22 | ch4 | 02:48–02:56 | Pre-Chorus + Chorus 3 | **Motif** vỗ tay → xoay. Bóng bay nảy lên | wide | @NhatAnh @MeoDen @MaNho @SanTiec |
| 23 | ch4 | 02:56–03:04 | Final Chorus | Ba bạn nắm tay nhảy vòng tròn, confetti cam tím | wide, slow orbit / crane | @NhatAnh @MeoDen @MaNho @SanTiec |
| 24 | ch5 | 03:04–03:12 | Outro "Trăng lên cao rồi…" | Phòng bé ban đêm: bé ngáp, ôm gối bí ngô nằm xuống | medium, slow dolly-in | @NhatAnh @MeoDen @MaNho @PhongBe |
| 25 | ch5 | 03:12–03:20 | "Chúc bé ngủ ngon…" | Bé ngủ, mèo cuộn tròn, ma nhỏ đắp chăn, đèn bí ngô tắt dần. **2 giây cuối đứng yên** | wide, slow pull-back | @NhatAnh @MeoDen @MaNho @PhongBe |

**Ghi chú tính liên tục:**
- Hướng di chuyển chính trong hành trình là **trái → phải** (phòng → vườn → phố → sân).
- `@GioBiNgo` xuất hiện từ cảnh 11. Bé luôn cầm giỏ ở **tay trái** cho tới cảnh 21, khi bé đặt giỏ lên bàn tiệc.
- Áo choàng và mũ phù thủy đội suốt video. Cảnh 24–25 bé tháo mũ, đặt ở chân giường.
- Cảnh 20: người cho kẹo chỉ lộ **một tay áo len cam**, không thấy mặt, để giữ ít nhân vật.

## 6. Bảng màu & âm hưởng hình ảnh
- **Palette:** cam bí ngô `#FF8A1F`, tím lavender `#9B7BD4`, vàng kim `#F6C445`, kem `#FFF4E0`, đen mềm `#2A2433` (không dùng đen tuyệt đối).
- **Ánh sáng từng chapter:**
  - ch1: hoàng hôn ấm qua cửa sổ, kèm dây đèn vàng.
  - ch2: hoàng hôn vàng cam, ngược sáng nhẹ.
  - ch3: chạng vạng sáng, có lồng đèn và trăng lớn.
  - ch4: dây đèn tiệc, sau đó là ánh trăng xanh nhạt và đèn ngủ ấm.
- **Hiệu ứng vui cho bé:** sao vàng lấp lánh từ áo choàng, bí ngô sáng lên khi đếm, confetti, bóng bay nảy. Mỗi cảnh chỉ dùng tối đa một hiệu ứng.

## 7. An toàn nội dung
- Không: bóng tối thật, quái vật, máu, xương, mạng nhện to, mặt nhăn nhó, la hét, jump-scare, lửa/nến thật gần bé.
- Đèn bí ngô là **đèn LED ấm**, không có lửa thật.
- Ma nhỏ, mèo đen, dơi luôn tròn trịa, mắt to, đang cười.
- Không có người lớn lạ mặt. Cảnh xin kẹo chỉ thấy tay áo.
- Kẹo bọc giấy, bé không ăn kẹo trong cảnh (chỉ cầm và chia).
- Ảnh thật của bé chỉ dùng làm reference trong Flow, không đưa vào repo (thư mục `sample-data` đã được gitignore).

## 8. Checklist cho người dùng
- [ ] Duyệt cốt truyện & lời bài hát (`data/songs/be-anh-di-halloween.md`), xác nhận tên bé là **Ánh / @NhatAnh**
- [ ] Tạo nhạc trên Suno: dán Style + Exclude + Lyrics, tạo vài bản, chọn bản ≥ 3:00
- [ ] Gửi lại link/thời lượng MP3 → AI cập nhật Song MD và tạo `data/g-flow/be-anh-di-halloween-flow-16x9.json`
- [ ] Chọn ĐÚNG 1 ảnh reference `@NhatAnh` theo bảng mục 3 (đang dùng `Character_design_sheet_for_girl_875b8ecf.jpg`); nếu đổi sang ảnh thật thì chạy lại generator với `REF=real-photo`
- [ ] Tạo ảnh `@MeoDen`, `@MaNho`, `@GioBiNgo`, `@PhongBe`, `@VuonBiNgo`, `@PhoLongDen`, `@SanTiec` bằng `image_prompt` trong JSON (cùng phong cách với ảnh `@NhatAnh`)
- [ ] Trong Flow tạo 5 chapter đúng tên mục 4, upload ảnh theo bảng "Danh sách upload từng chapter" (Chương 5 dùng lại `@PhongBe`, `@MeoDen`, `@MaNho`)
- [ ] Chạy `npm run flow:validate -- data/g-flow/be-anh-di-halloween-flow-16x9.json` → 0 error trước khi nạp vào Flow
