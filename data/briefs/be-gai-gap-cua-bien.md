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

## Reference fidelity and cartoon fallback

Compare each generated reference and starting frame directly with the original photograph. Reject any apparent-age, face, hairstyle or wardrobe drift before video generation. Empty start_frame means no approved frame is supplied. Starting frames improve control but do not guarantee identity throughout a clip. Inspect the beginning, middle and end; never chain a frame that already shows drift.

Cartoon edit prompt: Convert the person in the attached original photograph into a gentle 2D storybook cartoon. Preserve the same apparent age, recognizable facial identity, expression, high black ponytail with pink hair tie, white long-sleeve top and light lavender trousers. Change only the rendering style to soft linework and warm flat colors. Do not age up, redesign clothing, replace the face with a generic cartoon face or exaggerate the eyes. Plain neutral background, one character, no text or watermark.

Approve one cartoon reference before animating. Convert mother, props and room to the same style. Update render_style to 2d-cartoon, visual_style, style_anchor, format_lock and every keyframe_prompt together; remove photoreal/live-action requirements and cartoon from negativePrompt. The current JSON remains photoreal; this is the fallback workflow, not an already generated cartoon asset.
