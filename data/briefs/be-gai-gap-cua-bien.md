---
slug: "be-gai-gap-cua-bien"
title: "Ồ Kìa, Chú Cua Biển!"
audience: "Thiếu nhi"
estimatedDuration: "03:20"
sceneDurationSeconds: 8
totalScenes: 25
aspectRatio: "16:9"
---

# Production Brief - Be gai gap cua bien

## Character reference audit
- @BeGai: primary photo data/sample-data/1794308508644_775840114854244762_775840114854244762_5031383702419c5299002a3318ed12f9.jpg. Girl wears a white long sleeve top and lavender pants with a high ponytail and pink tie.
- @Me: real reference data/sample-data/20261024_114613.jpg. Adult mother wears glasses, dark hair tied back and a black short sleeve top. Preserve this reference; do not invent costume details.
- @ChauXanh and @CuaBien: use the real photo with the green basin and crab, from the same sample set.

## Flow chapter map
| ch1 | Chương 1 – Phòng khách | 1-8 | Mom brings the basin; girl notices the crab and watches safely. | @BeGai @Me @ChauXanh @CuaBien @PhongMau |
| ch2 | Chương 2 – Góc khám phá | 9-17 | Mother and girl observe shell, claws and sideways movement; chorus dance. | @BeGai @Me @ChauXanh @CuaBien @PhongMau |
| ch3 | Chương 3 – Lối vào bếp | 18-25 | Girl asks about the crab; mother explains safety; they wave goodbye. | @BeGai @Me @ChauXanh @CuaBien @PhongMau |

#### Chương 1 – Phòng khách
Use the real supplied home and crab photos as image references.
#### Chương 2 – Góc khám phá
Use the same real home, mother, girl, basin and crab references.
#### Chương 3 – Lối vào bếp
Keep the action in the real indoor home setting shown in the supplied crab photos.

## Scene coverage
Scenes 1-2: mother brings and shows the crab. Scenes 3-7: girl notices and observes. Scenes 8-15: mother explains and models safe distance. Scenes 16-17 and 22-23: crab dance and clapping. Scenes 18-21: question and safety guidance. Scenes 24-25: wave goodbye. Each clip maps to the matching song lyric section in the Flow JSON.

Safety: child stays with mother, does not touch the crab or reach into the basin. Mother handles the basin.

Generated character references: data/g-flow/assets/be-gai-gap-cua-bien/BeGai.png (@BeGai) and data/g-flow/assets/be-gai-gap-cua-bien/Me.png (@Me).


## Phong cách hiện tại: nhân vật 3D

Chỉ có hai nhân vật người: bé gái và mẹ. Cua là con vật trong chậu, không nhân cách hóa. Xóa mọi người khác khỏi ảnh tạo ra, kể cả hậu cảnh, phản chiếu và chân dung trong phòng. Giữ nguyên ảnh gốc. Asset hiện tại chưa được chuyển 3D; cần tạo và duyệt bộ 3D rồi cập nhật source_file trước khi render. Không bảo đảm hoặc đo được mức giống 99%.

### Prompt tạo bé gái

Đính kèm ảnh gốc bé áo trắng, quần tím trong data/sample-data.

> Create an isolated polished stylized 3D animation character of ONLY the girl in this original photograph. Preserve her apparent age, recognizable face, expression and pose, high black ponytail with pink hair tie and straight fringe, white long-sleeve top and light lavender trousers. Carefully sculpted reference-faithful features, natural eye size, detailed cloth, soft cinematic lighting, neutral cream background. Remove every other person and all room objects. One character only. No generic doll face, age-up, beautification, flat 2D illustration, text or watermark.

### Prompt tạo mẹ

Đính kèm data/sample-data/20261024_114613.jpg. Chỉ lấy người phụ nữ áo đen đeo kính ở giữa.

> Create an isolated polished stylized 3D portrait of ONLY the adult woman wearing glasses and a black top in the CENTER of this photograph. Preserve her apparent age, recognizable face, black-framed glasses, tied-back dark hair and black short-sleeve top. Remove the boy on the left, girl on the right and EVERY background person. Never blend their features into the mother. Waist-up portrait; do not invent unseen lower clothing. Natural eye size, detailed cloth, soft cinematic lighting, neutral cream background. Exactly one person. No generic doll face, beauty makeover, flat 2D illustration, text or watermark.

### Prompt bối cảnh

> Recreate the original home as a polished stylized 3D environment. Preserve the wood floor and glass doors. Include exactly one green basin containing one restrained olive sea crab. Remove ALL people, human reflections and human portraits. Keep the crab a natural non-speaking animal, not a humanoid. Match character lighting and material style. No duplicate objects, text or watermark.

### Sử dụng prompt theo scene

1. Tạo và duyệt hai mẫu nhân vật riêng từ ảnh thật, kiểm tra tuổi, nét mặt, tóc và quần áo. Không dùng ảnh 2D để làm nguồn khuôn mặt.
2. Upload ba mẫu: bé 3D, mẹ 3D, bối cảnh/chậu/cua 3D. Đặt tên BeGai, Me, PhongMau. Tag trong JSON không tự upload hay liên kết file.
3. Bước 1 (Keyframe): Flow chế độ tạo ảnh, đính kèm ba mẫu `keyframe.ingredients`, dùng `keyframe.prompt` của scene. Duyệt ảnh chỉ có hai người, một chậu và một cua; lưu ảnh đạt vào `keyframe.output_file` (`data/g-flow/assets/be-gai-gap-cua-bien/keyframes/scene-XX-start.png`). Bước 2 (Video): Frames to Video, ảnh keyframe ở ô First Frame, không gắn ingredients, dùng `video.prompt`.
4. Chỉ chạy bước Video của một cảnh sau khi keyframe của cảnh đó đã duyệt; 16:9, 8 giây. Có thể dùng extension google-flow-scenes để chạy lần lượt Keyframe N → duyệt → Video N.
5. Kiểm tra đầu/giữa/cuối clip; loại clip nếu đổi mặt hoặc thêm người. Chỉ nối khung cuối khi còn đúng nhân vật và hợp bố cục scene sau.
6. Ghép theo scene_number/timecode, thêm nhạc sau. Hiện JSON đã đổi phong cách prompt; chưa tạo ảnh 3D mới.
