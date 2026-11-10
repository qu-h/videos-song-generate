#!/usr/bin/env node
/**
 * Generator cho data/g-flow/be-anh-di-halloween-flow-16x9.json
 *
 *   node scripts/flows/be-anh-di-halloween.mjs data/g-flow/be-anh-di-halloween-flow-16x9.json
 *   REF=real-photo node scripts/flows/be-anh-di-halloween.mjs data/g-flow/be-anh-di-halloween-flow-16x9.json
 *
 * Sau đó LUÔN chạy:
 *   npm run flow:assemble -- data/g-flow/be-anh-di-halloween-flow-16x9.json
 *   npm run flow:validate -- data/g-flow/be-anh-di-halloween-flow-16x9.json   # phải 0 error
 *
 * Lớp 0 (skill flow-scene-continuity): appearance_lock của @NhatAnh được viết SAU KHI NHÌN ảnh
 * reference thật trong data/sample-data. Chọn preset bằng biến môi trường REF:
 *   - design-sheet (mặc định): data/sample-data/Character_design_sheet_for_girl_875b8ecf.jpg
 *                              (character sheet 3D: tóc búi nhỏ, váy vàng, bloomer trắng, sandal trắng)
 *   - real-photo             : data/sample-data/20261109_212148.jpg (ảnh thật: tóc mái bằng, áo mèo cam, quần caro)
 * Preset phải trùng với ảnh người dùng THỰC SỰ upload vào các chapter trong Flow.
 */
import fs from 'fs';

const OUT = process.argv[2] || 'data/g-flow/be-anh-di-halloween-flow-16x9-v2.json';
const SCENE_SEC = 8;
const REF_KEY = process.env.REF || 'design-sheet';

const HALLOWEEN_ADDONS =
  'a black pointed witch hat with a wide black brim printed with gold glitter stars, moons and pumpkins, and a long sheer black cape printed with gold pumpkins, bats and stars, tied at the neck with a black ribbon';

const REFS = {
  'design-sheet': {
    source_file: 'data/sample-data/Character_design_sheet_for_girl_875b8ecf.jpg',
    render_style: 'stylized-3d',
    style_word: 'Stylized 3D animated',
    description:
      'Bé Nhật Ánh – character sheet 3D (Pixar-like) trong data/sample-data/Character_design_sheet_for_girl_875b8ecf.jpg: tóc nâu sẫm búi nhỏ trên đỉnh đầu, váy vàng nhạt không tay hai quai hoa vàng, quần bloomer trắng, sandal trắng đục lỗ. Mũ + áo choàng phù thủy khoác THÊM bên ngoài.',
    appearance_lock: `Use the approved uploaded character reference for @NhatAnh. Keep her face and hairstyle exactly as in the reference sheet: dark-brown hair pulled up into one small high bun on top of her head with a few loose wispy strands at the forehead and temples. Base outfit exactly as in the reference sheet, identical in every clip: a pale-yellow sleeveless swing dress with two yellow fabric-flower shoulder straps, white puffy bloomer shorts, white perforated slip-on sandals. Halloween add-ons worn over this base outfit: ${HALLOWEEN_ADDONS}; the hat is removed only when the scene action says so. Do not redesign, recolor or restyle the hair, the dress or the add-ons.`,
    costume: 'witch hat + sheer black cape with gold stars worn over the pale-yellow flower-strap dress, white bloomer shorts, white perforated sandals (exactly as reference sheet)',
    visual_style:
      "stylized 3D animated children's music video that exactly matches the @NhatAnh character reference sheet (soft rounded Pixar-like look), bright warm candy colors (pumpkin orange, lavender, gold, cream), cute friendly Halloween, never scary",
    style_anchor:
      'Rendered in one consistent stylized 3D animated look that exactly matches the uploaded character reference sheet: soft rounded shapes, smooth clean materials, gentle soft skin shading, warm soft global illumination, shallow depth of field, clean highlights, no film grain, no photorealistic live-action footage. The entire music video shares this exact same rendering look in every clip.',
    format_lock:
      "Create one continuous 8-second video in 16:9 landscape format. Stylized 3D animated family-friendly children's music video in the same look as the character reference sheet: soft fabrics and lighting, natural gentle movement, soft cinematic depth of field, bright clean colors. Use one camera angle or one smooth camera movement only. No abrupt cuts, montage or internal scene transition. Keep the final two seconds visually stable. Do not generate text in the image. No subtitles, captions, dialogue, speech, logo or watermark.",
    negative:
      'live-action footage, photorealistic human skin, different art style, 2D flat drawing, anime, uncanny face, changed identity, different child, different hairstyle, hair let down, changed dress color, adult-looking child, extra fingers, deformed hands, duplicate character, mirrored layout, swapped left and right, scary, horror, dark shadows, skull, blood, spider, open flame, candle fire, crying, screaming, eating candy, random text, subtitles, logo, watermark, black bars, portrait framing, camera shake, flicker, abrupt cut, zoom transition',
    setup:
      'Upload đúng file Character_design_sheet_for_girl_875b8ecf.jpg (hoặc bản crop ô FRONT / 3/4 VIEW của sheet) vào TẤT CẢ các chapter với tên @NhatAnh. Nếu đổi sang ảnh thật, chạy lại generator với REF=real-photo.',
  },
  'real-photo': {
    source_file: 'data/sample-data/20261109_212148.jpg',
    render_style: 'photoreal',
    style_word: 'Photorealistic real',
    description:
      'Bé Nhật Ánh – ảnh thật data/sample-data/20261109_212148.jpg: tóc đen thẳng mái bằng dày, mũ phù thủy đen vành lưới in sao vàng, áo choàng đen in bí ngô/dơi vàng, áo thun kem in mặt mèo cam, quần caro cam đào nhạt.',
    appearance_lock:
      'Use the approved uploaded character reference for @NhatAnh. Keep her face and hairstyle exactly as in the reference photo: straight black hair with thick blunt bangs at eyebrow level, sides falling just past her ears. Costume exactly as in the reference photo, identical in every clip: a black pointed witch hat with a wide sheer black mesh brim printed with gold glitter stars, moons and pumpkins; a long sheer black cape printed with gold pumpkins, bats and stars, tied at the neck with a black ribbon; a cream long-sleeve t-shirt with an orange cat-face print; light peach gingham checkered pants; small orange ballet flats. The hat is removed only when the scene action says so. Do not redesign, recolor or restyle the hair or costume.',
    costume: 'witch hat + sheer black cape with gold stars, cream long-sleeve cat-face t-shirt, light peach gingham pants, small orange ballet flats (exactly as reference photo)',
    visual_style:
      "photorealistic cinematic live-action children's music video, real toddler girl matching the reference photo, bright warm candy colors (pumpkin orange, lavender, gold, cream), cute friendly Halloween, never scary",
    style_anchor:
      'Shot on a cinematic 35mm lens look with shallow depth of field, soft warm color grade with gentle lavender shadows, subtle fine film grain, soft natural contrast, clean highlights, no HDR glow. The entire music video shares this exact same photographic look in every clip.',
    format_lock:
      "Create one continuous 8-second video in 16:9 landscape format. Photorealistic cinematic live-action family-friendly children's music video: realistic fabrics and lighting, natural gentle movement, soft cinematic depth of field, bright clean colors. Use one camera angle or one smooth camera movement only. No abrupt cuts, montage or internal scene transition. Keep the final two seconds visually stable. Do not generate text in the image. No subtitles, captions, dialogue, speech, logo or watermark.",
    negative:
      'cartoon, 3D render, anime, plastic skin, uncanny face, changed identity, different child, different hairstyle, adult-looking child, extra fingers, deformed hands, duplicate character, mirrored layout, swapped left and right, scary, horror, dark shadows, skull, blood, spider, open flame, candle fire, crying, screaming, eating candy, random text, subtitles, logo, watermark, black bars, portrait framing, camera shake, flicker, abrupt cut, zoom transition',
    setup:
      'Crop ảnh 20261109_212148.jpg từ đỉnh mũ tới chân (hoặc dùng bản làm sạch nền theo Brief mục 3), upload vào TẤT CẢ các chapter với tên @NhatAnh. Nếu đổi sang character sheet, chạy lại generator với REF=design-sheet.',
  },
};
const REF = REFS[REF_KEY];
if (!REF) {
  console.error(`REF không hợp lệ: ${REF_KEY}. Dùng design-sheet | real-photo`);
  process.exit(2);
}
const SW = REF.style_word; // "Stylized 3D animated" | "Photorealistic real"

// ---------- nhân vật phụ & đạo cụ (appearance_lock lặp nguyên văn trong mọi cảnh có mặt) ----------
const SIDE = {
  '@MeoDen': {
    type: 'character',
    description: 'Mèo con đen, tròn trịa, mắt xanh lá, nơ ruy băng cam có chuông vàng nhỏ.',
    appearance_lock:
      '@MeoDen is one fixed black kitten: small and round, glossy short black fur, big round green eyes, small rounded ears, long tail, wearing an orange ribbon bow with one small golden bell on its neck. Keep its face, size, fur, bow and bell identical in every clip. It is calm, friendly and playful.',
    image_prompt: `${SW} small round black kitten with glossy short fur, big round green eyes, small rounded ears, long tail, wearing an orange satin ribbon bow with one small golden bell on its neck, sitting, friendly and calm, full body, front three-quarter view, plain light-cream studio background, soft light, no text, 16:9.`,
  },
  '@MaNho': {
    type: 'character',
    description: 'Ma nhỏ thân thiện như thú bông vải trắng mềm, mắt đen tròn, má hồng, bay lơ lửng thấp – không đáng sợ.',
    appearance_lock:
      '@MaNho is one fixed friendly little ghost that looks like a soft white plush fabric toy come to life: round gumdrop-shaped body smaller than the toddler, big round shiny black button-like eyes, rosy pink cheeks, tiny happy smile, two small rounded arm nubs, faint soft white glow, floating gently just above the ground. It is cute and absolutely not scary. Keep its shape, size, face and fabric identical in every clip.',
    image_prompt: `${SW} cute friendly little ghost made of soft white plush fabric, round gumdrop-shaped body about 50 cm tall, big round shiny black button eyes, rosy pink cheeks, tiny happy smile, two small rounded arm nubs, faint soft white glow, floating slightly above the floor, absolutely not scary, full body, front view, plain light-cream studio background, soft light, no text, 16:9.`,
  },
  '@GioBiNgo': {
    type: 'prop',
    description: 'Giỏ đựng kẹo hình bí ngô màu cam có mặt cười, quai đen.',
    appearance_lock:
      '@GioBiNgo is one fixed prop: an orange pumpkin-shaped trick-or-treat candy bucket with a cute smiling face and a black handle, about 20 cm wide. It looks identical in every clip.',
    image_prompt: `${SW} orange plastic trick-or-treat candy bucket shaped like a pumpkin with a cute smiling face and a black handle, empty, plain light-cream studio background, soft light, no text, 16:9.`,
  },
};

const PRESERVE =
  'Preserve the exact layout, positions, scale, colors and materials. Do not mirror, rotate, redesign or randomly decorate the location. Do not add extra doors, windows, furniture, people or animals.';

const CONTINUITY =
  'This clip is one shot inside a longer music video. Everything needed is described in this prompt. Keep the camera at child eye level unless the camera line says otherwise, keep the character scale, light direction, weather, season and time of day exactly as described here. Only the characters and props named in the first-frame description exist in the frame; do not invent extra props, people or animals. Each prop stays exactly where the first-frame description places it unless the scene action explicitly moves it. No teleporting, no sudden costume or hairstyle change, no new location interpretation.';

const CAMERA_FAMILY = '35mm lens look at child eye level; 28mm or 50mm only when the camera line says so.';

const BEDROOM_DESC =
  "screen-left a small bed with a peach-orange blanket and a pumpkin-shaped pillow; rear-center a large window with white curtains and a small smiling jack-o'-lantern LED lamp on the sill; screen-right a round wooden standing mirror and a light-wood wardrobe; light-wood floor with a round cream rug in the center; warm yellow string lights along the wall.";
const BEDROOM_LR = 'Keep the bed on screen-left, the window at rear-center and the mirror and wardrobe on screen-right. Never swap left and right.';

const chapters = [
  {
    chapter_id: 'ch1',
    flow_chapter_name: 'Chương 1 – Phòng của bé',
    song_sections: ['Intro', 'Verse 1', 'Pre-Chorus'],
    background: '@PhongBe',
    setting: 'cozy toddler bedroom, late afternoon',
    time_of_day: 'late afternoon',
    energy_range: [1, 3],
    bgDesc: `It is the exact same cozy toddler bedroom: ${BEDROOM_DESC}`,
    lr: BEDROOM_LR,
    bgImage: `${SW} cozy toddler bedroom in late afternoon, eye-level child height, wide 16:9. Screen-left: small bed with a peach-orange blanket and a pumpkin-shaped pillow. Rear-center: large window with white curtains showing a warm orange-purple late-afternoon sky, a small smiling jack-o'-lantern LED lamp on the window sill. Screen-right: round wooden standing mirror and a light-wood wardrobe. Light-wood floor with a round cream rug in the center, warm yellow string lights along the wall. Bright, warm, cute Halloween decor, not dark, no people, no text.`,
    lighting:
      'Lighting for this chapter: warm golden late-afternoon sunlight entering through the rear-center window, key light from screen-left and slightly above, soft shadows toward screen-right, plus warm yellow string lights along the wall, warm white balance, faces always clearly lit, never dark. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.',
    setupNote: 'Chương mở đầu: cảnh 1 không có nhân vật (chỉ bối cảnh), cảnh 5 bé chạy ra khỏi khung bên phải (bridge_out).',
  },
  {
    chapter_id: 'ch2',
    flow_chapter_name: 'Chương 2 – Vườn bí ngô',
    song_sections: ['Chorus 1', 'Verse 2', 'Pre-Chorus', 'Chorus 2'],
    background: '@VuonBiNgo',
    props: ['@GioBiNgo'],
    setting: 'pumpkin patch at golden hour',
    time_of_day: 'golden hour',
    energy_range: [3, 5],
    bgDesc:
      'It is the exact same pumpkin patch: screen-left a low white wooden fence with a small open gate; center a small dirt path with bright orange pumpkins of many sizes on both sides, some carved with friendly smiling faces glowing with LED lights; screen-right a friendly scarecrow wearing a purple witch hat; background gentle low hills and a pink-orange sky.',
    lr: 'Keep the fence and gate on screen-left, the path in the center and the scarecrow on screen-right. Never swap left and right.',
    bgImage: `${SW} pumpkin patch at golden hour sunset, eye-level child height, wide 16:9. Screen-left: low white wooden fence with a small open gate. Center: small dirt path with bright orange pumpkins of many sizes on both sides, some carved with friendly smiling faces glowing softly with LED lights. Screen-right: a friendly scarecrow wearing a purple witch hat. Background: gentle low hills, pink-orange sky. Bright, warm, cheerful, not scary, no people, no text.`,
    lighting:
      'Lighting for this chapter: warm golden-hour sunlight coming low from screen-left and slightly above, soft long shadows toward screen-right, gentle warm backlight on the hair, warm white balance, faces always clearly lit. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.',
    setupNote: '@GioBiNgo xuất hiện lần đầu ở cảnh 11 (đặt dưới chân bù nhìn), bé cầm tay trái từ đó.',
  },
  {
    chapter_id: 'ch3',
    flow_chapter_name: 'Chương 3 – Phố lồng đèn',
    song_sections: ['Verse 3', 'Bridge', 'Dance Break', 'Verse 4'],
    background: '@PhoLongDen',
    characters: ['@MeoDen', '@MaNho'],
    props: ['@GioBiNgo'],
    setting: 'small village street at bright dusk with paper lanterns',
    time_of_day: 'dusk',
    energy_range: [3, 5],
    bgDesc:
      "It is the exact same small village street: screen-left a small cream cottage with a round red wooden door, an autumn leaf wreath and a smiling jack-o'-lantern LED lamp on the steps; center a light cobblestone street with strings of orange, purple and yellow paper lanterns overhead; screen-right a small tree with orange-yellow leaves, a wooden bench and a few pumpkins; sky soft lavender-blue with a big yellow full moon.",
    lr: 'Keep the cottage and red door on screen-left, the street in the center and the tree and bench on screen-right. Never swap left and right.',
    bgImage: `${SW} small village street at bright dusk, soft lavender-blue sky with a big yellow full moon, eye-level child height, wide 16:9. Screen-left: small cream cottage with a round red wooden door, an autumn leaf wreath and a smiling jack-o'-lantern LED lamp on the steps. Center: light cobblestone street with strings of orange, purple and yellow paper lanterns overhead. Screen-right: small tree with orange-yellow leaves, a wooden bench and a few pumpkins. Warm glowing lantern light, cozy and cheerful, never dark or spooky, no people, no text.`,
    lighting:
      'Lighting for this chapter: bright blue-hour dusk with warm glowing paper lanterns overhead, key light from screen-left and slightly above, soft shadows toward screen-right, warm-neutral white balance, faces warmly and clearly lit, never dark or spooky. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.',
    setupNote: '@MeoDen xuất hiện từ cảnh 14, @MaNho từ cảnh 16. Cảnh 20 có thêm một bàn tay người lớn (áo len cam) không lộ mặt.',
  },
  {
    chapter_id: 'ch4',
    flow_chapter_name: 'Chương 4 – Tiệc Halloween',
    song_sections: ['Verse 4', 'Pre-Chorus', 'Chorus 3', 'Final Chorus'],
    background: '@SanTiec',
    characters: ['@MeoDen', '@MaNho'],
    props: ['@GioBiNgo'],
    setting: 'backyard mini Halloween party, evening',
    time_of_day: 'evening',
    energy_range: [3, 5],
    bgDesc:
      'It is the exact same backyard party: screen-left a low table with a purple tablecloth, orange cupcakes and colorful wrapped candies; center a round soft green lawn under warm yellow string lights; screen-right a bunch of orange, purple and black balloons; background a wooden fence and a big full moon.',
    lr: 'Keep the table on screen-left, the lawn in the center and the balloons on screen-right. Never swap left and right.',
    bgImage: `${SW} backyard mini Halloween party in the evening, eye-level child height, wide 16:9. Screen-left: low table with a purple tablecloth, orange cupcakes and colorful wrapped candies. Center: round soft green lawn under warm yellow string lights. Screen-right: bunch of orange, purple and black balloons. Background: wooden fence and a big full moon. Festive, bright, cheerful, not scary, no people, no text.`,
    lighting:
      'Lighting for this chapter: warm festive yellow string lights overhead with the main key light from screen-left and slightly above, soft shadows toward screen-right, soft fill light, warm white balance, faces clearly lit, bright and happy. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.',
    setupNote: '@GioBiNgo được đặt lên bàn tiệc (screen-left) ở cảnh 21 và ở đó đến hết chapter.',
  },
  {
    chapter_id: 'ch5',
    flow_chapter_name: 'Chương 5 – Giấc ngủ',
    song_sections: ['Outro'],
    background: '@PhongBe',
    characters: ['@MeoDen', '@MaNho'],
    setting: 'the same toddler bedroom at night',
    time_of_day: 'night',
    energy_range: [1, 2],
    bgDesc: `It is the exact same cozy toddler bedroom as Chương 1, now at night with the full moon outside the window: ${BEDROOM_DESC}`,
    lr: BEDROOM_LR,
    bgImage: '(Dùng lại ảnh @PhongBe của Chương 1 – upload cùng file vào Chương 5; prompt cảnh mô tả bản ban đêm.)',
    lighting:
      'Lighting for this chapter: soft blue moonlight entering through the rear-center window, key light from screen-left and slightly above, soft shadows toward screen-right, plus a small warm night-light glow from the jack-o\'-lantern lamp, cool-neutral white balance, faces gently but clearly lit, never pitch dark. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.',
    setupNote: 'Bé tháo mũ phù thủy trong cảnh 24 (đặt ở chân giường) – đây là thay đổi trang phục duy nhất, nằm trong scene_action.',
  },
];

const HOLD = ', and holds this pose, nearly still, for the final second.';
const HOLD_EMPTY = ', and holds this look, nearly still, for the final second.';

// Mỗi cảnh: n, ch, name, section, lyrics, overlay, energy, transition, shot, lens, camera, action, end, [start chỉ cho cảnh mở chapter], flags
const S = [
  {
    n: 1, ch: 'ch1', name: 'Đèn bí ngô bừng sáng', section: 'Intro', lyrics: 'Hù! Hù! / Hi hi hi!', overlay: 'Halloween tới rồi!',
    energy: 1, transition: 'establishing', shot: 'wide', lens: 'eye-level 28mm', emotion: 'magical, cozy', focus: "glowing jack-o'-lantern",
    camera: 'Slow dolly push-in at child eye level, 28mm, from wide toward the rear-center window, no other movement.',
    start:
      "No character is visible. The empty bedroom is dim but warm: the small jack-o'-lantern LED lamp on the rear-center window sill is off, the yellow string lights along the wall are off, the cream rug at the center is empty, the bed with the pumpkin-shaped pillow is on screen-left and the round mirror and wardrobe are on screen-right.",
    action:
      "The jack-o'-lantern LED lamp on the rear-center window sill softly turns on with a warm orange glow, then the yellow string lights along the wall light up one by one from screen-left to screen-right. The white curtains sway gently. No people are visible in this clip.",
    end:
      "No character is visible. Only the empty bedroom is visible, now fully lit: the jack-o'-lantern LED lamp glows on the rear-center window sill, all the yellow string lights along the wall are lit, the cream rug at the center is empty, the bed with the pumpkin-shaped pillow is on screen-left and the round mirror and wardrobe are on screen-right",
    empty: true,
  },
  {
    n: 2, ch: 'ch1', name: 'Bé Ánh ló ra', section: 'Intro', lyrics: 'Halloween tới rồi! / Bé Ánh ơi, đi chơi!', overlay: 'Bé Ánh ơi!',
    energy: 2, transition: 'hold', shot: 'medium-wide', lens: 'eye-level 35mm', emotion: 'playful, giggly', focus: 'peek-a-boo reveal',
    camera: 'Gentle pan from the rear-center window toward screen-right at child eye level, 35mm, no other movement.',
    action:
      'After half a second @NhatAnh peeks out from behind the light-wood wardrobe on screen-right, giggles, steps out fully, walks two steps onto the cream rug and waves both hands toward the camera.',
    end:
      '@NhatAnh stands at center-right of the frame on the cream rug, just in front of the light-wood wardrobe on screen-right, facing the camera, both hands raised beside her shoulders in a wave, big happy smile, witch hat on her head and cape hanging down her back. Nothing is in her hands',
  },
  {
    n: 3, ch: 'ch1', name: 'Phù thủy nhỏ trước gương', section: 'Verse 1', lyrics: 'Mũ nhọn đội lên đầu / Áo choàng đen thật ngầu / Ngôi sao vàng lấp lánh / Bé là phù thủy xinh!', overlay: 'Phù thủy xinh!',
    energy: 2, transition: 'hold', shot: 'medium', lens: 'eye-level 35mm', emotion: 'proud, cheerful', focus: 'witch hat and sparkling cape',
    camera: 'Static medium shot at child eye level, 35mm, no camera movement.',
    action:
      'After half a second @NhatAnh lowers her hands, turns her body toward the round wooden mirror on screen-right, straightens her witch hat with both hands, then spreads her cape open wide like little wings with both arms so the gold stars catch the light, and turns her head to smile at the camera.',
    end:
      '@NhatAnh stands at center-right of the frame on the cream rug beside the round wooden mirror on screen-right, body turned three-quarter toward screen-right, head facing the camera, both arms spread wide holding the edges of her black cape open, proud smile, witch hat on her head. Nothing else is in her hands',
  },
  {
    n: 4, ch: 'ch1', name: 'Xoay áo choàng', section: 'Verse 1', lyrics: 'Xoay xoay áo choàng bay / Vẫy vẫy hai bàn tay / Gương ơi gương nhìn này / Phù thủy nhỏ đây đây!', overlay: 'Xoay xoay!',
    energy: 3, transition: 'hold', shot: 'medium-wide', lens: 'eye-level 35mm', emotion: 'joyful', focus: 'flaring cape',
    camera: 'Slow half-orbit around @NhatAnh at child eye level, 35mm, moving from screen-left to screen-right, no other movement.',
    action:
      '@NhatAnh lowers her arms, steps to the center of the cream rug and slowly spins around once so her cape flares out, then waves both hands above her head and points to herself with her right thumb, giggling.',
    end:
      '@NhatAnh stands at the center of the frame in the middle of the cream rug, about two meters in front of the rear-center window, facing the camera, right thumb pointing at her own chest, left arm relaxed at her side, big proud smile, witch hat on her head and cape resting down her back. Nothing is in her hands',
  },
  {
    n: 5, ch: 'ch1', name: 'Vỗ tay – xoay vòng (motif 1) & chạy ra', section: 'Pre-Chorus', lyrics: 'Một, hai, ba! / Vỗ tay nào! (Bốp! Bốp!) / Một, hai, ba! / Xoay một vòng!', overlay: 'Một, hai, ba!',
    energy: 3, transition: 'hold', shot: 'wide', lens: 'eye-level 28mm', emotion: 'excited', focus: 'clap-and-spin dance motif, exit to the right',
    camera: 'Static wide front shot at child eye level, 28mm, no camera movement.',
    action:
      '@NhatAnh claps her hands twice on the beat, spins around one full circle, raises both arms up, then turns toward screen-right and runs toward screen-right past the wardrobe, fully out of the frame; for the final second only the empty bedroom is visible.',
    end:
      "@NhatAnh has run out of the frame on screen-right carrying the orange pumpkin candy bucket in her left hand; only the empty bedroom is visible: the lit jack-o'-lantern lamp on the rear-center window sill, the lit yellow string lights, the empty cream rug at the center, the bed on screen-left and the mirror and wardrobe on screen-right",
    empty: true, bridge_out: true,
  },
  {
    n: 6, ch: 'ch2', name: 'Vào vườn bí ngô', section: 'Chorus 1', lyrics: 'Halloween, Halloween / Bí ngô cười hi hi / Halloween, Halloween / Bé Ánh cùng đi chơi', overlay: 'Halloween!',
    energy: 4, transition: 'exit-enter', shot: 'medium-wide', lens: 'eye-level 28mm', emotion: 'amazed, happy', focus: 'gate and glowing pumpkins',
    camera: 'Smooth tracking shot moving from screen-left to screen-right alongside @NhatAnh at child eye level, 28mm, no other movement.',
    start:
      'For the first second only the empty pumpkin patch is visible: the low white fence with its small open gate on screen-left, the dirt path with orange pumpkins on both sides in the center, the friendly scarecrow with a purple witch hat on screen-right; then @NhatAnh walks into the frame from the left edge through the open gate, wearing her witch hat and cape, carrying @GioBiNgo in her left hand.',
    action:
      '@NhatAnh walks happily through the open gate and along the dirt path from screen-left toward the center, bouncing on the beat, looking around amazed at the glowing smiling pumpkins, and stops at the center of the path.',
    end:
      '@NhatAnh stands at the center of the frame on the dirt path, pumpkins on both sides of her, about three meters in front of the scarecrow on screen-right, facing the camera, both hands held up beside her face in amazement, mouth open in a delighted smile, witch hat on her head and cape down her back. Nothing is in her hands',
    bridge_in: true,
  },
  {
    n: 7, ch: 'ch2', name: 'Lắc lư bum bum', section: 'Chorus 1', lyrics: 'Lắc lư, lắc lư / Bum, bum, bum! / Halloween, Halloween / Vui quá đi thôi!', overlay: 'Bum bum bum!',
    energy: 5, transition: 'hold', shot: 'medium', lens: 'slightly low 35mm', emotion: 'bouncy, joyful', focus: 'sway and stomp',
    camera: 'Static medium shot from a slightly low angle just below child eye level, 35mm, no camera movement.',
    action:
      '@NhatAnh bounces her knees and sways side to side on the beat, stomps three times, then throws both arms straight up high and laughs. The carved smiling pumpkins around her glow warmly.',
    end:
      '@NhatAnh stands at the center of the frame on the dirt path with pumpkins on both sides, about three meters in front of the scarecrow on screen-right, facing the camera, both arms stretched straight up above her head, laughing with eyes squeezed shut, witch hat on her head and cape down her back. Nothing is in her hands',
  },
  {
    n: 8, ch: 'ch2', name: 'Bí ngô tròn tròn', section: 'Verse 2', lyrics: 'Bí ngô cam cam cam / Bí ngô tròn tròn tròn / Đếm cùng bé nhé', overlay: 'Bí ngô tròn tròn',
    energy: 4, transition: 'hold', shot: 'medium close-up', lens: 'eye-level 50mm', emotion: 'curious', focus: 'three pumpkins',
    camera: 'Static medium close-up at child eye level, 50mm, no camera movement.',
    action:
      '@NhatAnh lowers her arms and squats down beside a row of three uncarved orange pumpkins lying directly in front of her on the path, one big, one medium, one small, arranged from screen-left to screen-right. She pats the big pumpkin with both hands and looks up at the camera with a curious smile.',
    end:
      '@NhatAnh squats at the center of the frame on the dirt path, facing the camera, both hands resting on top of the big orange pumpkin at the screen-left end of the row of three uncarved pumpkins (big, medium, small from screen-left to screen-right) directly in front of her knees, curious smile, witch hat on her head and cape pooling behind her',
  },
  {
    n: 9, ch: 'ch2', name: 'Đếm một, hai, ba', section: 'Verse 2', lyrics: 'Một quả! Hai quả! Ba quả!', overlay: 'Một! Hai! Ba!',
    energy: 4, transition: 'hold', shot: 'medium', lens: 'eye-level 35mm', emotion: 'proud, learning', focus: 'counting 1-2-3',
    camera: "Slow pan from screen-left to screen-right following @NhatAnh's pointing finger, at child eye level, 35mm, no other movement.",
    action:
      '@NhatAnh points with her right index finger to the three pumpkins one by one from screen-left to screen-right; each pumpkin gives a soft warm sparkle as she points at it. Then she holds up three fingers of her right hand toward the camera and smiles.',
    end:
      '@NhatAnh squats at the center of the frame on the dirt path, facing the camera, right hand raised beside her face showing three fingers, left hand resting on her knee, proud smile, the row of three uncarved pumpkins (big, medium, small from screen-left to screen-right) directly in front of her knees, witch hat on her head and cape pooling behind her',
  },
  {
    n: 10, ch: 'ch2', name: 'Ôm quả bí nhỏ', section: 'Verse 2', lyrics: 'Bí ngô to, bí ngô nhỏ / Bí ngô cười toe toe / Bé ôm một quả nhỏ / Nặng quá! Hi hi!', overlay: 'Nặng quá!',
    energy: 3, transition: 'hold', shot: 'medium-wide → medium', lens: 'eye-level 50mm', emotion: 'funny, giggly', focus: 'hugging the small pumpkin',
    camera: 'Slow dolly push-in at child eye level, 50mm, from medium-wide to medium, no other movement.',
    action:
      '@NhatAnh lifts the small pumpkin at the screen-right end of the row with both hands, stands up and hugs it to her chest, wobbles a little as if it is heavy, giggles, then gently sets it back down in its place at the screen-right end of the row and stands up straight.',
    end:
      '@NhatAnh stands at the center of the frame on the dirt path, facing the camera, both hands resting on her tummy, giggling smile, the row of three uncarved pumpkins (big, medium, small from screen-left to screen-right) on the ground directly in front of her feet, witch hat on her head and cape down her back. Nothing is in her hands',
  },
  {
    n: 11, ch: 'ch2', name: 'Motif 2 & giỏ kẹo', section: 'Pre-Chorus', lyrics: 'Một, hai, ba! / Vỗ tay nào! (Bốp! Bốp!) / Một, hai, ba! / Xoay một vòng!', overlay: 'Vỗ tay nào!',
    energy: 4, transition: 'hold', shot: 'wide', lens: 'eye-level 28mm', emotion: 'excited', focus: 'clap-and-spin motif, finding the bucket',
    camera: 'Static wide shot at child eye level, 28mm, no camera movement.',
    action:
      "@NhatAnh claps her hands twice on the beat and spins around one full circle, exactly the same clap-and-spin motif as in the bedroom. Then she introduces one prop: she walks three steps toward screen-right to the scarecrow, picks up @GioBiNgo, the orange pumpkin candy bucket resting on the ground at the scarecrow's feet, with her left hand and turns back to face the camera.",
    end:
      '@NhatAnh stands at center-right of the frame on the dirt path, right beside the scarecrow on screen-right, facing the camera, holding @GioBiNgo by its black handle in her left hand at hip height, right arm relaxed at her side, excited smile, witch hat on her head and cape down her back. The row of three uncarved pumpkins lies on the ground at the center of the path on screen-left of her',
  },
  {
    n: 12, ch: 'ch2', name: 'Xách giỏ nhảy chân sáo', section: 'Chorus 2', lyrics: 'Halloween, Halloween / Bí ngô cười hi hi / Halloween, Halloween / Bé Ánh cùng đi chơi / Lắc lư, lắc lư / Bum, bum, bum! / Halloween, Halloween / Vui quá đi thôi!', overlay: 'Đi chơi thôi!',
    energy: 5, transition: 'hold', shot: 'medium-wide', lens: 'eye-level 35mm', emotion: 'carefree, joyful', focus: 'skipping with the bucket, exit to the right',
    camera: 'Smooth tracking shot moving from screen-left to screen-right alongside @NhatAnh at child eye level, 35mm, no other movement.',
    action:
      '@NhatAnh skips along the dirt path from the center toward screen-right on the beat, swinging @GioBiNgo gently in her left hand, swaying side to side, passes the scarecrow and skips out of the frame on screen-right; for the final second only the empty pumpkin patch is visible.',
    end:
      '@NhatAnh has skipped out of the frame on screen-right carrying @GioBiNgo in her left hand; only the empty pumpkin patch is visible: the fence and open gate on screen-left, the dirt path with glowing pumpkins in the center and the scarecrow with the purple witch hat on screen-right',
    empty: true, bridge_out: true,
  },
  {
    n: 13, ch: 'ch3', name: 'Phố lồng đèn – ai đấy?', section: 'Verse 3', lyrics: 'Meo meo, ai đấy nhỉ?', overlay: 'Meo meo?',
    energy: 4, transition: 'exit-enter', shot: 'wide', lens: 'eye-level 28mm', emotion: 'curious', focus: 'listening pose under lanterns',
    camera: 'Slow dolly push-in at child eye level, 28mm, from wide toward the center of the street, no other movement.',
    start:
      'For the first second only the empty lantern street is visible: the cream cottage with its round red door on screen-left, the cobblestone street with strings of orange, purple and yellow paper lanterns overhead in the center, the small tree, wooden bench and a few pumpkins on screen-right, a big yellow full moon in the lavender-blue sky; then @NhatAnh walks into the frame from the left edge, wearing her witch hat and cape, carrying @GioBiNgo in her left hand.',
    action:
      '@NhatAnh walks from the left edge to the center of the cobblestone street, stops, cups her right hand behind her right ear as if listening, and turns her head to look toward the wooden bench on screen-right.',
    end:
      '@NhatAnh stands at the center of the frame on the cobblestone street under the hanging lanterns, body facing the camera, head turned looking toward the wooden bench on screen-right, right hand cupped behind her right ear, @GioBiNgo hanging from her left hand at hip height, curious expression, witch hat on her head and cape down her back',
    bridge_in: true,
  },
  {
    n: 14, ch: 'ch3', name: 'Gặp mèo đen', section: 'Verse 3', lyrics: 'Mèo đen nhỏ xíu xiu / Đeo nơ cam xinh xinh / Đi cùng bé Ánh nào!', overlay: 'Mèo đen xinh xinh',
    energy: 3, transition: 'hold', shot: 'medium', lens: 'low 35mm', emotion: 'tender, delighted', focus: 'kitten meets girl',
    camera: 'Static medium shot from a low angle at kitten height, 35mm, no camera movement.',
    action:
      '@MeoDen hops down from the wooden bench on screen-right and trots toward @NhatAnh, its small golden bell swinging. @NhatAnh lowers her right hand, sets @GioBiNgo down on the cobblestones beside her left foot, crouches and offers her open right hand; the kitten rubs its head against her hand and she smiles widely.',
    end:
      "@NhatAnh crouches at the center of the frame on the cobblestone street, facing the camera, right hand stretched out toward screen-right resting on @MeoDen's head, left hand on her knee, wide delighted smile, witch hat on her head and cape pooling behind her. @MeoDen sits on the cobblestones on screen-right of her, facing her, pressed against her right hand. @GioBiNgo stands on the cobblestones beside her left foot on screen-left",
  },
  {
    n: 15, ch: 'ch3', name: 'Nhảy lon ton cùng mèo', section: 'Verse 3', lyrics: 'Meo meo, meo meo / Mèo đen nhảy lon ton / Meo meo, meo meo / Bé cũng nhảy lon ton!', overlay: 'Lon ton!',
    energy: 4, transition: 'hold', shot: 'medium-wide', lens: 'eye-level 35mm', emotion: 'playful', focus: 'girl and kitten hopping together',
    camera: 'Smooth tracking shot moving from screen-left to screen-right alongside @NhatAnh and @MeoDen at child eye level, 35mm, no other movement.',
    action:
      '@NhatAnh picks up @GioBiNgo with her left hand, stands up and hops along the cobblestones from the center toward screen-right with small bouncy steps on the beat, while @MeoDen trots playfully right beside her feet; they stop under a hanging orange lantern in front of the small tree on screen-right.',
    end:
      '@NhatAnh stands at center-right of the frame on the cobblestone street under a hanging orange lantern, just in front of the small tree on screen-right, facing the camera, @GioBiNgo hanging from her left hand at hip height, right arm relaxed at her side, playful smile, witch hat on her head and cape down her back. @MeoDen sits on the cobblestones at her feet on screen-right of her, facing the camera',
  },
  {
    n: 16, ch: 'ch3', name: 'Ma nhỏ xuất hiện', section: 'Bridge', lyrics: 'Hù hù, ai thế nhỉ? / Ma nhỏ trắng tinh tinh / Ma nhỏ không đáng sợ / Ma nhỏ muốn làm bạn', overlay: 'Ma nhỏ đáng yêu',
    energy: 3, transition: 'hold', shot: 'medium close-up', lens: 'eye-level 50mm', emotion: 'surprised → happy', focus: 'friendly ghost reveal',
    camera: "Slow dolly push-in at child eye level, 50mm, from medium close-up toward @NhatAnh's face, no other movement.",
    action:
      "@MaNho slowly floats out from behind the hanging orange lantern above screen-right and gently waves its little arm nubs as if saying a soft boo. @NhatAnh makes a surprised round 'oh' mouth and puts her right hand on her right cheek, then breaks into a big smile; @MeoDen tilts its head curiously.",
    end:
      '@NhatAnh stands at center-right of the frame on the cobblestone street in front of the small tree on screen-right, facing the camera, right hand resting on her right cheek, @GioBiNgo hanging from her left hand at hip height, big surprised-happy smile, witch hat on her head and cape down her back. @MaNho floats at her head height on screen-right of her beside the hanging orange lantern, facing her, little arm nubs raised. @MeoDen sits on the cobblestones at her feet on screen-right of her, head tilted, facing @MaNho',
  },
  {
    n: 17, ch: 'ch3', name: 'Ôm ma nhỏ', section: 'Bridge', lyrics: 'Hù hù, chào ma nhỏ! / Ôm một cái nào! / Mình là bạn nhé / Hi hi hi!', overlay: 'Mình là bạn nhé!',
    energy: 3, transition: 'hold', shot: 'medium', lens: 'eye-level 50mm', emotion: 'warm, loving', focus: 'friendship hug',
    camera: 'Slow half-orbit around the three friends at child eye level, 50mm, moving from screen-left to screen-right, no other movement.',
    action:
      '@NhatAnh sets @GioBiNgo down on the cobblestones beside her left foot, opens both arms and gives @MaNho a gentle hug; @MeoDen rubs against her left leg. All three look happy and cozy together.',
    end:
      '@NhatAnh stands at center-right of the frame on the cobblestone street in front of the small tree on screen-right, facing the camera, both arms wrapped around @MaNho who floats pressed against her chest on screen-right of her, her cheek resting on its soft white head, warm smile, witch hat on her head and cape down her back. @MeoDen sits pressed against her left leg, facing the camera. @GioBiNgo stands on the cobblestones beside her left foot on screen-left',
  },
  {
    n: 18, ch: 'ch3', name: 'Dậm chân – vẫy tay', section: 'Dance Break', lyrics: 'Dậm chân! (Bum bum!) / Dậm chân! (Bum bum!) / Vẫy tay! (Vẫy vẫy!) / Vẫy tay! (Vẫy vẫy!)', overlay: 'Dậm chân! Vẫy tay!',
    energy: 4, transition: 'hold', shot: 'wide', lens: 'eye-level 28mm', emotion: 'energetic, fun', focus: 'stomp and wave dance',
    camera: 'Static wide front shot at child eye level, 28mm, no camera movement.',
    action:
      '@NhatAnh releases the hug and the three friends line up in a row at the center of the street facing the camera: @MeoDen on screen-left, @NhatAnh in the center, @MaNho floating on screen-right. @NhatAnh stomps her feet twice on the beat, then waves both hands above her head twice; @MeoDen paws the ground and @MaNho bobs and waves along to the beat. @GioBiNgo stays on the cobblestones in front of the small tree where she left it.',
    end:
      'The three friends stand in a row at the center of the frame on the cobblestone street, all facing the camera: @MeoDen sitting on screen-left, @NhatAnh in the center with both hands raised high above her head, big excited smile, witch hat on her head and cape down her back, @MaNho floating at her shoulder height on screen-right with its arm nubs raised. @GioBiNgo stands on the cobblestones on screen-right of the group, in front of the small tree',
  },
  {
    n: 19, ch: 'ch3', name: 'Nhảy lên – ngồi xuống', section: 'Dance Break', lyrics: 'Nhảy lên! (Hop!) / Nhảy lên! (Hop!) / Ngồi xuống… đứng lên! / Halloween!', overlay: 'Nhảy lên!',
    energy: 5, transition: 'hold', shot: 'wide', lens: 'eye-level to slightly high 28mm', emotion: 'peak energy', focus: 'jump-squat-pop dance',
    camera: 'Slow smooth crane up from child eye level to slightly above her head, 28mm, no other movement.',
    action:
      '@NhatAnh jumps up twice with both feet on the beat, squats down low, then pops back up and throws both arms in the air; @MeoDen hops beside her and @MaNho floats up and down in rhythm.',
    end:
      'The three friends stand in a row at the center of the frame on the cobblestone street, all facing the camera: @MeoDen sitting on screen-left, @NhatAnh in the center with both arms thrown straight up, mouth open in a joyful laugh, witch hat on her head and cape down her back, @MaNho floating at her shoulder height on screen-right. @GioBiNgo stands on the cobblestones on screen-right of the group, in front of the small tree',
  },
  {
    n: 20, ch: 'ch3', name: 'Gõ cửa xin kẹo', section: 'Verse 4', lyrics: 'Cốc cốc cốc, gõ cửa / Kẹo ngọt ơi, cho bé / Bé nói: "Cảm ơn ạ!" / Kẹo ngọt bỏ vào giỏ', overlay: 'Cảm ơn ạ!',
    energy: 4, transition: 'hold', shot: 'medium', lens: 'eye-level 35mm', emotion: 'polite, happy', focus: 'knock, candy, polite bow',
    camera: 'Static medium shot at child eye level, 35mm, framed so the round red door is on screen-left, no camera movement.',
    action:
      "@NhatAnh picks up @GioBiNgo with her left hand and walks three steps with @MeoDen and @MaNho to the round red door of the cottage on screen-left. She knocks three times on the door with her right hand. The door opens a little and only an adult hand in an orange knit sweater sleeve appears and drops a few colorful wrapped candies into @GioBiNgo; the adult's face is never shown. @NhatAnh bows her head politely as a thank-you, the door closes, and she turns to face screen-right, pointing ahead with her right hand.",
    end:
      '@NhatAnh stands at center-left of the frame on the cobblestones just in front of the closed round red door on screen-left, body and face turned toward screen-right, right arm pointing toward screen-right, @GioBiNgo with colorful wrapped candies inside hanging from her left hand at hip height, happy smile, witch hat on her head and cape down her back. @MeoDen sits at her feet on screen-right of her facing screen-right; @MaNho floats at her shoulder height on screen-right of her facing screen-right',
    extra_living_allowed: 'one adult hand in an orange knit sweater sleeve whose face is never shown',
    bridge_out: true,
  },
  {
    n: 21, ch: 'ch4', name: 'Chia kẹo cho bạn', section: 'Verse 4', lyrics: 'Một kẹo cho mèo đen / Một kẹo cho ma nhỏ / Một kẹo cho bé Ánh / Chia nhau cùng vui nào!', overlay: 'Chia nhau cùng vui!',
    energy: 3, transition: 'match-pose', shot: 'wide', lens: 'eye-level 28mm', emotion: 'generous, warm', focus: 'sharing candy',
    camera: 'Static wide shot at child eye level, 28mm, no camera movement.',
    start:
      '@NhatAnh stands at center-left of the frame on the cobblestones just in front of the closed round red door on screen-left, body and face turned toward screen-right, right arm pointing toward screen-right, @GioBiNgo with colorful wrapped candies inside hanging from her left hand at hip height, happy smile, witch hat on her head and cape down her back. @MeoDen sits at her feet on screen-right of her facing screen-right; @MaNho floats at her shoulder height on screen-right of her facing screen-right.',
    action:
      'For the first second @NhatAnh walks in from the left edge onto the lawn carrying @GioBiNgo in her left hand, with @MeoDen trotting at her feet and @MaNho floating beside her. She places @GioBiNgo on the low table on screen-left, takes out wrapped candies one by one, sets one on the lawn in front of @MeoDen, hands one to @MaNho, and holds one up for herself with a proud smile. The candies stay wrapped; nobody eats.',
    end:
      '@NhatAnh stands at center-left of the frame on the green lawn beside the low table on screen-left, facing the camera, right hand holding one wrapped candy up beside her face, left arm relaxed at her side, proud smile, witch hat on her head and cape down her back. @GioBiNgo stands on the low table on screen-left. @MeoDen sits on the lawn on screen-right of her facing the camera with one wrapped candy on the grass in front of its paws; @MaNho floats at her shoulder height on screen-right of her holding one wrapped candy in its arm nubs, facing the camera',
    bridge_in: true,
  },
  {
    n: 22, ch: 'ch4', name: 'Motif 3 – tiệc bắt đầu', section: 'Pre-Chorus + Chorus 3', lyrics: 'Một, hai, ba! / Vỗ tay nào! / Một, hai, ba! / Xoay một vòng! / Halloween, Halloween…', overlay: 'Vỗ tay nào!',
    energy: 4, transition: 'hold', shot: 'medium-wide', lens: 'eye-level 35mm', emotion: 'festive', focus: 'clap-and-spin motif with friends',
    camera: 'Static medium-wide front shot at child eye level, 35mm, no camera movement.',
    action:
      '@NhatAnh drops her candy back into @GioBiNgo on the table, @MaNho drops its candy in too and @MeoDen nudges its candy to the table leg; then @NhatAnh steps to the center of the lawn, claps twice on the beat and spins one full circle, exactly the same clap-and-spin motif, while @MaNho spins once in the air and @MeoDen chases its tail once. The balloons on screen-right bounce gently.',
    end:
      '@NhatAnh stands at the center of the frame on the green lawn under the warm string lights, facing the camera, both arms raised high, festive big smile, witch hat on her head and cape down her back. @MeoDen sits on the lawn on screen-left of her facing the camera; @MaNho floats at her shoulder height on screen-right of her facing the camera. @GioBiNgo stands on the low table on screen-left; the bunch of balloons is on screen-right',
  },
  {
    n: 23, ch: 'ch4', name: 'Nhảy vòng tròn & đi ngủ thôi', section: 'Final Chorus', lyrics: 'Halloween, Halloween / Bí ngô cười hi hi / … / Halloween, Halloween / Vui quá đi thôi!', overlay: 'Vui quá đi thôi!',
    energy: 4, transition: 'hold', shot: 'wide', lens: 'eye-level to high 28mm', emotion: 'triumphant joy', focus: 'circle dance with confetti, exit to the right',
    camera: 'Slow smooth crane up from child eye level to a gentle high angle above the lawn, 28mm, no other movement.',
    action:
      "@NhatAnh takes @MaNho's arm nub and they dance slowly in a circle at the center of the lawn while @MeoDen trots around them; soft orange and purple confetti gently falls. Then the three friends walk together toward screen-right past the balloons and out of the frame; for the final second only the empty backyard is visible.",
    end:
      'The three friends have walked out of the frame on screen-right; only the empty backyard is visible from a gentle high angle: the low table with the purple tablecloth and @GioBiNgo standing on it on screen-left, the empty green lawn under the warm string lights in the center with a few pieces of confetti on the grass, the bunch of balloons on screen-right and the wooden fence and full moon behind',
    empty: true, bridge_out: true,
  },
  {
    n: 24, ch: 'ch5', name: 'Đi ngủ thôi', section: 'Outro', lyrics: 'Trăng lên cao rồi / Bí ngô ngủ rồi / Mèo đen ngủ rồi / Ma nhỏ ngủ rồi', overlay: 'Trăng lên cao rồi',
    energy: 2, transition: 'exit-enter', shot: 'medium', lens: 'eye-level 35mm', emotion: 'sleepy, calm', focus: 'bedtime',
    camera: 'Slow dolly push-in at child eye level, 35mm, from medium toward the bed on screen-left, no other movement.',
    start:
      "For the first second only the empty bedroom at night is visible: soft blue moonlight through the rear-center window with the full moon outside, the small jack-o'-lantern LED lamp glowing warmly on the window sill, the bed with the peach-orange blanket and pumpkin-shaped pillow on screen-left, the empty cream rug at the center, the round mirror and wardrobe on screen-right; then @NhatAnh walks slowly into the frame from the left edge wearing her witch hat and cape, nothing in her hands, with @MeoDen trotting beside her feet and @MaNho floating behind her.",
    action:
      '@NhatAnh stops beside the bed, yawns with her right hand over her mouth, takes off her witch hat with both hands and sets it at the foot of the bed, climbs onto the bed and lies down on her side hugging the pumpkin-shaped pillow, still wearing her cape. @MeoDen curls up on the cream rug at the center and @MaNho floats quietly beside the rear-center window.',
    end:
      '@NhatAnh lies on her side on the bed on screen-left, facing the camera, both arms hugging the pumpkin-shaped pillow, eyes half closed, sleepy smile, without her witch hat, cape still around her shoulders; the witch hat rests at the foot of the bed on screen-left. @MeoDen lies curled up on the cream rug at the center, facing the camera. @MaNho floats beside the rear-center window, facing her',
    bridge_in: true,
  },
  {
    n: 25, ch: 'ch5', name: 'Chúc bé ngủ ngon', section: 'Outro', lyrics: 'Bé Ánh ngủ ngoan / Chúc bé ngủ ngon… / Hù… hi hi.', overlay: 'Chúc bé ngủ ngon',
    energy: 1, transition: 'hold', shot: 'medium-wide → wide', lens: 'eye-level 28mm', emotion: 'peaceful ending', focus: 'sleeping girl in moonlight',
    camera: 'Slow dolly pull-back at child eye level, 28mm, from medium-wide to wide, no other movement.',
    action:
      "@NhatAnh closes her eyes and sleeps peacefully hugging the pumpkin-shaped pillow. @MaNho floats over from the window, gently pulls the peach-orange blanket up to her shoulders, then floats back beside the window. The jack-o'-lantern lamp on the window sill slowly dims. Keep the final two seconds completely still.",
    end:
      "@NhatAnh sleeps on her side on the bed on screen-left, facing the camera, eyes closed, the peach-orange blanket pulled up to her shoulders, both arms hugging the pumpkin-shaped pillow, without her witch hat; the witch hat rests at the foot of the bed on screen-left. @MeoDen lies curled up asleep on the cream rug at the center. @MaNho floats beside the rear-center window, facing her. The jack-o'-lantern lamp on the sill glows very dimly. Everything stays completely still for the final two seconds.",
    last: true,
  },
];

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const chById = Object.fromEntries(chapters.map((c) => [c.chapter_id, c]));

// ---------- scenes: start_state = end_state cảnh trước (chép nguyên văn) trừ cảnh mở chapter ----------
const scenes = [];
let prev = null;
for (const s of S) {
  const c = chById[s.ch];
  const isChapterStart = !prev || prev.ch !== s.ch;
  let start = s.start;
  if (!start) {
    if (isChapterStart) throw new Error(`scene ${s.n}: cảnh mở chapter phải có start riêng`);
    start = `${prev.end}.`;
  }
  const end_state = s.last ? s.end : `${s.end}${s.empty ? HOLD_EMPTY : HOLD}`;
  const t0 = (s.n - 1) * SCENE_SEC;
  scenes.push({
    scene_number: s.n,
    chapter_id: s.ch,
    flow_chapter_name: c.flow_chapter_name,
    name: s.name,
    timecode: `${fmt(t0)}–${fmt(t0 + SCENE_SEC)}`,
    song_section: s.section,
    lyrics: s.lyrics,
    durationSeconds: SCENE_SEC,
    aspectRatio: '16:9',
    energy: s.energy,
    transition_in: s.transition,
    ...(s.bridge_in ? { bridge_in: true } : {}),
    ...(s.bridge_out ? { bridge_out: true } : {}),
    ingredients: [], // assemble tự điền theo tag trong prompt
    character_reference: null, // assemble tự điền
    background_reference: c.background,
    start_state: start,
    end_state,
    environmentContinuity: c.setting,
    visualStyle: REF.visual_style,
    shotSize: s.shot,
    cameraDirection: s.camera,
    cameraLensAndAngle: s.lens,
    lighting: c.lighting.split('.')[0].replace(/^Lighting for this chapter: /, ''),
    emotionAndEnergy: s.emotion,
    visualFocus: s.focus,
    characterConsistency: `Use @NhatAnh exactly as the uploaded reference (${REF.source_file.split('/').pop()}); keep hairstyle and the chapter costume.`,
    motionGuidance: 'Natural toddler movement, large readable gestures synchronized to the beat, one main action per clip.',
    scene_action: s.action,
    camera_move: s.camera,
    ...(s.extra_living_allowed ? { extra_living_allowed: s.extra_living_allowed } : {}),
    prompt: '', // sinh bằng npm run flow:assemble
    voiceover: s.lyrics,
    text_overlay: s.overlay,
    negativePrompt: REF.negative,
  });
  prev = s;
}

const mkIngredient = (tag) => ({ tag, type: SIDE[tag].type, scope: 'chapter', description: SIDE[tag].description, appearance_lock: SIDE[tag].appearance_lock, image_prompt: SIDE[tag].image_prompt });

const out = {
  project: {
    title: 'Bé Ánh Đi Halloween',
    slug: 'be-anh-di-halloween',
    brief: 'data/briefs/be-anh-di-halloween.md',
    song: 'data/songs/be-anh-di-halloween.md',
    generator: 'scripts/flows/be-anh-di-halloween.mjs',
    version: 2,
    input_coverage: [
      { source_chapter: 'Chương 1 – Phòng của bé', scenes: [1, 2, 3, 4, 5], beats: ['bedroom lights', 'witch costume reveal', 'mirror and cape play', 'clap-and-spin', 'exit to pumpkin patch'] },
      { source_chapter: 'Chương 2 – Vườn bí ngô', scenes: [6, 7, 8, 9, 10, 11, 12], beats: ['enter patch', 'dance', 'count pumpkins', 'hug small pumpkin', 'repeat motif', 'find bucket', 'exit to lantern street'] },
      { source_chapter: 'Chương 3 – Phố lồng đèn', scenes: [13, 14, 15, 16, 17, 18, 19, 20], beats: ['enter with bucket', 'meet kitten', 'dance', 'meet ghost', 'hug', 'dance break', 'knock and receive candy', 'thank and point to party'] },
      { source_chapter: 'Chương 4 – Tiệc Halloween', scenes: [21, 22, 23], beats: ['enter carrying bucket', 'place bucket on screen-left table and share candy', 'dance and leave bucket on table'] },
      { source_chapter: 'Chương 5 – Giấc ngủ', scenes: [24, 25], beats: ['enter bedroom at night, remove hat and lie down', 'sleep, blanket tuck and lamp dim'] },
    ],
    reference_audit: { preset: REF_KEY, main_character: REF.source_file, render_style: REF.render_style, inspected: true, note: 'Đã xem trực tiếp sheet: tóc nâu sẫm búi cao nhỏ, váy vàng nhạt không tay quai hoa vàng, bloomer trắng, sandal trắng đục lỗ. Phụ kiện Halloween là phần thêm theo kịch bản.' },
    reference_preset: REF_KEY,
    audio_duration: fmt(scenes.length * SCENE_SEC),
    audio_duration_note: 'DỰ KIẾN – chưa có MP3. Khi có MP3 thật, căn lại timecode / thêm bớt cảnh ở Dance Break hoặc Outro.',
    target_platform: 'Google Flow',
    video_model: 'Veo 3.1',
    video_format: '16:9',
    resolution: '1920x1080',
    orientation: 'landscape',
    display_mode: 'full screen',
    scene_duration: '8 seconds',
    total_scenes: scenes.length,
    chapter_count: chapters.length,
    audience: 'Thiếu nhi 2–3 tuổi',
    render_style: REF.render_style,
    visual_style: REF.visual_style,
    style_anchor: REF.style_anchor,
    light_direction_anchor:
      'The main key light always comes from screen-left and slightly above, so shadows fall gently toward screen-right in every clip of the whole video. Only the color temperature and brightness of the light may change between chapters, never its direction.',
    palette_anchor:
      'Color palette for the whole video: pumpkin orange, soft lavender purple, warm cream, with glittering gold as the single accent; blacks are soft charcoal, never pitch black. Every location, costume and prop stays inside this palette.',
    camera_height_anchor:
      'Camera stays at child eye level, about 0.8 meter above the ground, unless the camera line explicitly says low angle, slightly high or crane.',
    screen_direction:
      'Story travel direction is left-to-right: bedroom, pumpkin patch, lantern street, backyard party, bedroom at night. The character faces or moves toward screen-right whenever traveling. Never cross the 180-degree line relative to the main character; never mirror the layout.',
    anchor_props: [
      { tag: null, description: 'The black witch hat and sheer cape with gold print are worn over @NhatAnh’s base outfit in every chapter; the hat is removed in scene 24 and placed at the foot of the bed.' },
      { tag: '@GioBiNgo', description: 'The same orange pumpkin candy bucket appears from scene 11; @NhatAnh carries it in her left hand through scene 20, places it on the screen-left party table in scene 21, and it stays there through scene 23.' },
    ],
    main_character_reference: '@NhatAnh',
    characters: {
      '@NhatAnh': REF.description,
      '@MeoDen': SIDE['@MeoDen'].description,
      '@MaNho': SIDE['@MaNho'].description,
    },
    global_restrictions: [
      'Mỗi cảnh là một video liên tục đúng 8 giây (Veo 3.1).',
      'Chỉ các nhân vật được tag mới xuất hiện; không thêm người/động vật khác (ngoại lệ: một bàn tay người lớn ở cảnh 20, không lộ mặt).',
      'Không thay đổi khuôn mặt, kiểu tóc, trang phục của @NhatAnh so với ảnh reference (chỉ tháo mũ ở cảnh 24–25).',
      'Không lật gương bối cảnh hoặc đổi vị trí trái/phải.',
      'Hướng di chuyển hành trình: trái → phải (phòng → vườn → phố → sân tiệc → phòng ban đêm).',
      '@GioBiNgo xuất hiện từ cảnh 11, bé cầm tay trái; đặt lên bàn tiệc ở cảnh 21.',
      'Không bóng tối thật, không quái vật, không lửa/nến thật, không ăn kẹo trong cảnh.',
      'Không chữ, subtitle, logo, watermark; text overlay chỉ thêm ở hậu kỳ.',
    ],
    global_ingredients: [
      {
        tag: '@NhatAnh',
        type: 'character',
        scope: 'global',
        source_file: REF.source_file,
        render_style: REF.render_style,
        description: REF.description,
        appearance_lock: REF.appearance_lock,
        setup: REF.setup,
      },
    ],
    important_instructions: [
      'Generate every scene in landscape 16:9 widescreen, 8 seconds, with Veo 3.1.',
      'Only tag ingredients that belong to the scene\'s chapter plus global ingredients.',
      `Keep @NhatAnh visually identical to the uploaded reference (${REF.source_file.split('/').pop()}) in every scene.`,
      'Do not generate subtitles, captions, logos or text inside the video.',
      'Do not generate dialogue or speech. The final Suno audio track will be added during editing.',
    ],
  },
  format_lock: REF.format_lock,
  chapters: chapters.map((c) => {
    const chars = c.characters || [];
    const props = c.props || [];
    const tags = ['@NhatAnh', ...chars, c.background, ...props];
    return {
      chapter_id: c.chapter_id,
      flow_chapter_name: c.flow_chapter_name,
      scene_range: [0, 0], // assemble tự điền
      scene_numbers: [], // assemble tự điền
      scene_count: 0, // assemble tự điền
      song_sections: c.song_sections,
      setting: c.setting,
      costume: REF.costume,
      time_of_day: c.time_of_day,
      camera_family: CAMERA_FAMILY,
      energy_range: c.energy_range,
      lighting: c.lighting.split('.')[0].replace(/^Lighting for this chapter: /, ''),
      ingredients: [
        { tag: '@NhatAnh', type: 'character', scope: 'global' },
        ...chars.map(mkIngredient),
        { tag: c.background, type: 'background', scope: 'chapter', description: c.bgDesc.replace(/^It is the exact same [^:]+: /, ''), image_prompt: c.bgImage },
        ...props.map(mkIngredient),
      ],
      upload_checklist: tags, // assemble đồng bộ lại
      recommended_setup: [
        `Tạo chapter "${c.flow_chapter_name}" trong Flow.`,
        `Upload vào chapter đúng ${tags.length} ảnh với đúng tên: ${tags.join(', ')}.`,
        `@NhatAnh = ${REF.source_file.split('/').pop()} (cùng một file cho mọi chapter).`,
        `Dùng đúng một ảnh ${c.background} cho mọi cảnh của chapter; không lật gương.`,
        c.setupNote,
        'Sinh cảnh theo thứ tự; dùng frame cuối của take đã chọn làm ảnh frame đầu (Frames to Video) cho cảnh kế tiếp trong cùng chapter.',
      ],
      prompt_blocks: {
        background_lock: `${c.background} is the fixed approved background reference of ${c.flow_chapter_name}. ${c.bgDesc} ${PRESERVE} ${c.lr}`,
        continuity_lock: CONTINUITY,
        lighting_lock: c.lighting,
      },
    };
  }),
  scenes,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`OK: ${scenes.length} scenes, ${chapters.length} chapters, ${out.project.audio_duration}, REF=${REF_KEY} -> ${OUT}`);
console.log('Tiếp theo: npm run flow:assemble -- ' + OUT + ' && npm run flow:validate -- ' + OUT);
