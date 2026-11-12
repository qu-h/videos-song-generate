#!/usr/bin/env node
/**
 * be-gai-gap-cua-bien.mjs — generator cho data/g-flow/be-gai-gap-cua-bien-flow-16x9.json
 *
 *   node scripts/flows/be-gai-gap-cua-bien.mjs        (tự chạy luôn flow:assemble + flow:validate)
 *
 * Viết trường nguồn của 25 cảnh (lời, nhịp, state, camera) theo đúng thứ tự bài hát; start_state của
 * cảnh N+1 được chép máy từ end_state cảnh N. keyframe / video do flow:assemble sinh.
 * Bố cục cố định (nhìn từ máy): bé ngồi giữa-trái hướng screen-right; chậu xanh trên sàn giữa-phải,
 * cách bé ~1 m (ngoài tầm tay); mẹ quỳ sát chậu ở screen-right, hướng screen-left về phía bé.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'data/g-flow/be-gai-gap-cua-bien-flow-16x9.json');
const HOLD = ', and holds this pose, nearly still, for the final second.';

// ---------- asset locks (theo ảnh trong data/g-flow/assets/be-gai-gap-cua-bien) ----------
const LOCKS = {
  '@BeGai': 'Use the approved uploaded character reference for @BeGai. Keep her hairstyle exactly as in the reference image: black hair in a high ponytail with a pink hair tie and a straight fringe. Keep her outfit exactly as shown: a white ribbed long-sleeve top with small ruffled cuffs and light lavender jogger trousers. Preserve the same apparent age and recognizable facial identity as the reference; do not reinterpret her as an older student, teenager or adult. Use polished stylized 3D while preserving her apparent age and recognizable facial identity.',
  '@Me': 'Use the approved uploaded character reference for @Me. Keep her dark hair tied back in a low bun and her black-framed eyeglasses exactly as in the reference image. Keep her outfit exactly as shown: a black short-sleeve draped-neck top, dark grey trousers and black flat shoes. Preserve her apparent age and recognizable facial identity. Use polished stylized 3D while preserving her apparent age and recognizable facial identity.',
  '@ChauXanh': '@ChauXanh is one fixed prop: a round bright lime-green plastic basin with two translucent green wavy handles on opposite sides, identical in shape, color and size in every clip.',
  '@CuaBien': '@CuaBien is one fixed live mud crab with a dark olive-green shell, orange-tinged legs and both claws tied with yellow raffia bands; it stays inside @ChauXanh in every clip and never approaches any person.',
};

const BACKGROUND_LOCK = '@PhongMau is the fixed approved room reference: a honey-colored wood plank floor; large dark-framed sliding glass doors across the rear wall opening onto a balcony full of potted green plants; a small blue plastic child chair at rear-center in front of the glass doors; a wooden cabinet, a black rice cooker, a red thermos and a dark pressure cooker on the floor at screen-left; a brown floor mat with a cutlery print on the floor at screen-right. Preserve this layout and never mirror it: cookers on screen-left, floor mat on screen-right. Story props added to this room: exactly one round bright lime-green plastic basin with two translucent green wavy handles, and inside it exactly one live mud crab with a dark olive-green shell, orange-tinged legs and both claws tied with yellow raffia bands. No other people, human reflections or portraits. Do not duplicate any prop.';

// ---------- state building blocks ----------
const CHAIR = 'The blue child chair stands at rear-center in front of the glass doors.';
const BASIN_MID = 'The green basin rests on the wood floor at center-right, about one meter in front of the girl and beyond her reach, the crab sitting still in the middle of it.';
const BASIN_RIGHT = 'The green basin rests on the wood floor at center-right, about one meter in front of the girl and beyond her reach, the crab resting against the screen-right inner wall of the basin.';
const meKneel = (pose) => `@Me kneels on the wood floor at screen-right just beside the basin, facing screen-left toward the girl, ${pose}.`;
const girlSit = (pose) => `@BeGai sits cross-legged on the wood floor at center-left, ${pose}`;
const girlStand = (pose) => `@BeGai stands on the wood floor at center-left, ${pose}`;
// Girl last so the hold clause belongs to her sentence.
const frame = (basin, me, girl) => `${CHAIR} ${basin} ${me} ${girl}${HOLD}`;
const toStart = (end) => end.replace(HOLD, '.');

// ---------- 25 scenes in song order ----------
const S = [
  {
    name: 'Mẹ mang chậu cua về', section: 'Intro', energy: 2, lyrics: 'Mẹ vừa đi chợ về đây / Trong chậu xanh có bạn hay',
    transition: 'establishing', shot: 'wide', dir: 'static', lens: '35mm eye-level',
    emotion: 'warm homecoming, curious anticipation',
    start: `${CHAIR} @Me stands at center-right, facing screen-left toward the girl, holding the green basin low in front of her with both hands by its two handles, the crab inside it. @BeGai sits cross-legged on the wood floor at center-left, facing screen-right toward her mother, both hands resting on her knees, looking up with curiosity.`,
    action: '@Me slowly bends her knees and kneels, setting the green basin gently on the wood floor at center-right, then rests both hands on her thighs; the girl watches the basin come down and her eyes widen.',
    camera: 'Locked-off static wide shot at child eye level, 35mm, showing the whole room from the cookers on screen-left to the floor mat on screen-right.',
    end: frame(BASIN_MID, meKneel('both hands resting on her thighs, smiling softly'), girlSit('facing screen-right toward the green basin, both hands resting on her knees, eyes wide with curiosity')),
  },
  {
    name: 'Ồ, một chú cua!', section: 'Intro', energy: 2, lyrics: 'Mẹ ơi, gì thế mẹ ơi? / Một chú cua biển đang ngồi!',
    transition: 'hold', shot: 'medium-wide', dir: 'push-in', lens: '35mm eye-level',
    emotion: 'surprised wonder',
    action: 'The girl tilts her head and lifts one hand in a small questioning gesture, then lowers it to her knee; @Me smiles, points one finger toward the crab inside the basin, then rests her hand on her thigh again.',
    camera: 'Slow dolly push-in at child eye level, 35mm, from wide toward medium-wide, centered between the girl and the basin.',
    end: frame(BASIN_MID, meKneel('both hands resting on her thighs, smiling softly'), girlSit('facing screen-right toward the green basin, both hands resting on her knees, mouth open in a delighted, surprised "oh"')),
  },
  {
    name: 'Ngắm mai cua', section: 'Verse 1', energy: 2, lyrics: 'Bé ngồi cách chậu một bên / Ngắm mai xanh sẫm thật êm',
    transition: 'hold', shot: 'medium', dir: 'static', lens: '35mm eye-level',
    emotion: 'calm, absorbed curiosity',
    action: 'The girl leans forward slightly from her seated spot, without moving closer, and gazes at the dark olive shell; the crab stays still in the basin.',
    camera: 'Static medium two-shot at child eye level, 35mm, the girl on frame left and the basin on frame right.',
    end: frame(BASIN_MID, meKneel('both hands resting on her thighs, smiling softly'), girlSit('facing screen-right toward the green basin, leaning slightly forward with both hands resting on her knees, gazing calmly at the crab shell')),
  },
  {
    name: 'Càng cua nhúc nhích', section: 'Verse 1', energy: 3, lyrics: 'Hai chiếc càng khẽ nhúc nhích / Đôi mắt nhỏ xíu nhìn quanh',
    transition: 'hold', shot: 'medium close-up', dir: 'push-in', lens: '50mm eye-level',
    emotion: 'fascinated, a tiny gasp of delight',
    action: 'Inside the basin the crab slowly lifts and lowers its two bound claws once and swivels its small eye stalks; the girl\'s eyes follow the movement and she straightens up with a little gasp.',
    camera: 'Slow push-in at child eye level, 50mm, toward the crab inside the basin, the girl visible at frame left.',
    end: frame(BASIN_MID, meKneel('both hands resting on her thighs, smiling softly'), girlSit('facing screen-right toward the green basin, sitting upright with both hands resting on her knees, eyes wide and following the crab')),
  },
  {
    name: 'Tay để yên nhé', section: 'Pre-Chorus', energy: 3, lyrics: 'Mẹ ngồi bên, bé nhìn thôi / Tay để yên nhé, bé ơi',
    transition: 'hold', shot: 'medium', dir: 'static', lens: '35mm eye-level',
    emotion: 'gentle, reassuring, safe',
    action: '@Me places one hand flat on her own chest, then rests both palms on her knees as a calm "hands still" sign; the girl copies her, folding her hands together in her lap and nodding.',
    camera: 'Static medium shot at child eye level, 35mm, framing the girl, the basin and the mother together.',
    end: frame(BASIN_MID, meKneel('both palms resting on her knees, smiling encouragingly'), girlSit('facing screen-right toward the green basin, both hands folded together in her lap, nodding with a calm smile')),
  },
  {
    name: 'Cua bò ngang', section: 'Pre-Chorus', energy: 3, lyrics: 'Chú cua bò ngang thật khéo / Bé cười thích thú biết bao',
    transition: 'hold', shot: 'medium-wide', dir: 'tracking', lens: '35mm eye-level',
    emotion: 'bubbling delight',
    action: 'The crab takes three slow sideways steps toward screen-right inside the basin and stops against its far wall; the girl laughs with delight, her folded hands staying in her lap.',
    camera: 'Slow lateral tracking move from screen-left to screen-right at child eye level, 35mm, following the crab\'s sideways steps.',
    end: frame(BASIN_RIGHT, meKneel('both palms resting on her knees, smiling encouragingly'), girlSit('facing screen-right toward the green basin, both hands folded together in her lap, laughing with delight')),
  },
  {
    name: 'Điệp khúc 1 – lắc lư', section: 'Chorus', energy: 4, lyrics: 'Ồ kìa, cua đi ngang! / Lắc lư, lắc lư, thật ngoan / Mai xanh, đôi càng cam',
    transition: 'hold', shot: 'medium', dir: 'static', lens: '35mm eye-level',
    emotion: 'joyful, bouncy, on the beat',
    action: 'On the beat the girl sways her shoulders left and right twice and opens her hands into two little crab claws beside her cheeks; @Me sways gently with her.',
    camera: 'Static medium shot at child eye level, 35mm, the girl and the basin centered.',
    end: frame(BASIN_RIGHT, meKneel('sitting upright with both palms resting on her knees, smiling'), girlSit('facing screen-right toward the green basin, both hands raised beside her cheeks shaped like little crab claws, beaming')),
  },
  {
    name: 'Điệp khúc 1 – không chạm nha', section: 'Chorus', energy: 5, lyrics: 'Bé ngắm vui, không chạm nha! / Ồ kìa, cua đi ngang! / Mẹ bên, bé cười vang',
    transition: 'hold', shot: 'medium-wide', dir: 'push-in', lens: '28mm eye-level',
    emotion: 'playful, laughing out loud',
    action: 'The girl lowers her hands, wags one index finger side to side playfully as a cheerful "we just look" sign, then laughs out loud; @Me laughs with her and nods.',
    camera: 'Slow gentle push-in at child eye level, 28mm, staying medium-wide, keeping the girl, the green basin and the mother all in frame.',
    end: frame(BASIN_RIGHT, meKneel('nodding with a big smile, both palms resting on her knees'), girlSit('facing screen-right toward the green basin, both hands back on her knees, laughing out loud')),
  },
  {
    name: 'Hai ngón tay đi ngang', section: 'Chorus', energy: 5, lyrics: 'Hai ngón tay bước nhịp nhàng / La la la, cua đi ngang!',
    transition: 'match-pose', shot: 'medium-wide', dir: 'static', lens: '35mm eye-level',
    emotion: 'bouncy, rhythmic, singing',
    action: 'On the beat the girl walks two fingers of her right hand sideways along the floor beside her right knee like a crab, three bouncy steps toward screen-right, singing; @Me claps softly twice.',
    camera: 'Static medium-wide shot at child eye level, 35mm, showing the girl, the basin and the mother.',
    end: frame(BASIN_RIGHT, meKneel('hands pressed together after a soft clap, smiling'), girlSit('facing screen-right toward the green basin, right hand resting on the floor beside her right knee with two fingers standing like crab legs, left hand on her left knee, singing happily')),
  },
  {
    name: 'Mai cua tròn xinh', section: 'Verse 2', energy: 4, lyrics: 'Mai cua tròn tròn xinh ghê / Màu xanh nâu ánh đèn khe',
    transition: 'hold', shot: 'medium', dir: 'push-in', lens: '50mm eye-level',
    emotion: 'admiring, tender',
    action: 'The girl lifts her hand back onto her knee and leans slightly forward to admire the round shell; soft light glints across the olive-brown shell as the crab sits still.',
    camera: 'Slow push-in at child eye level, 50mm, toward the crab\'s round shell, the girl soft at frame left.',
    end: frame(BASIN_RIGHT, meKneel('both palms resting on her knees, smiling'), girlSit('facing screen-right toward the green basin, leaning slightly forward with both hands on her knees, admiring the crab shell')),
  },
  {
    name: 'Bé nhìn mẹ say mê', section: 'Verse 2', energy: 3, lyrics: 'Càng cam khép vào rồi mở / Bé nhìn mẹ, mắt say mê',
    transition: 'hold', shot: 'medium close-up', dir: 'static', lens: '50mm eye-level',
    emotion: 'fascinated, shining eyes',
    action: 'The crab slowly raises its two bound, orange-tipped claws and lowers them again; the girl sits upright and turns her head toward her mother with shining, fascinated eyes.',
    camera: 'Static medium close-up at child eye level, 50mm, on the crab raising its claws in the green basin, with the girl and the mother visible behind it.',
    end: frame(BASIN_RIGHT, meKneel('both palms resting on her knees, smiling'), girlSit('body facing screen-right toward the green basin, head turned toward her mother at screen-right, both hands on her knees, eyes shining with fascination')),
  },
  {
    name: 'Mẹ kể chuyện biển', section: 'Pre-Chorus', energy: 3, lyrics: 'Mẹ kể cua sống gần khơi / Mình ngắm từ xa thôi nhé',
    transition: 'hold', shot: 'medium', dir: 'push-in', lens: '35mm eye-level',
    emotion: 'warm storytelling, attentive',
    action: '@Me draws a small wave shape in the air with one hand to show the sea, then raises an open palm gently toward the girl as a "look from here" sign; the girl listens and nods.',
    camera: 'Slow push-in at child eye level, 35mm, on the mother and the girl facing each other across the basin.',
    end: frame(BASIN_RIGHT, meKneel('right palm raised gently toward the girl in a calm "look from here" sign, left hand on her knee'), girlSit('facing screen-right toward her mother and the basin, both hands on her knees, nodding attentively')),
  },
  {
    name: 'Chậu xanh đặt yên', section: 'Pre-Chorus', energy: 4, lyrics: 'Chậu xanh đặt yên trên bàn / Bé nghe lời mẹ dịu dàng',
    transition: 'hold', shot: 'medium-wide', dir: 'static', lens: '35mm eye-level',
    emotion: 'calm, obedient, cozy',
    action: '@Me lowers her hand and steadies the basin by one handle for a moment, then lets go; the girl folds her hands in her lap and sits still with a soft smile.',
    camera: 'Static medium-wide shot at child eye level, 35mm, the basin at the center of the composition.',
    end: frame(BASIN_RIGHT, meKneel('both palms resting on her knees, smiling'), girlSit('facing screen-right toward the green basin, both hands folded in her lap, sitting still with a soft smile')),
  },
  {
    name: 'Điệp khúc 2 – lắc lư', section: 'Chorus', energy: 5, lyrics: 'Ồ kìa, cua đi ngang! / Lắc lư, lắc lư, thật ngoan / Mai xanh, đôi càng cam',
    transition: 'hold', shot: 'medium', dir: 'tracking', lens: '35mm eye-level',
    emotion: 'joyful, bouncy, on the beat',
    action: 'On the beat the girl sways left and right twice and raises two little crab-claw hands beside her cheeks; @Me sways with her, both smiling.',
    camera: 'Slow lateral tracking move from screen-left to screen-right at child eye level, 35mm, from the girl toward the basin.',
    end: frame(BASIN_RIGHT, meKneel('sitting upright with both palms resting on her knees, smiling'), girlSit('facing screen-right toward the green basin, both hands raised beside her cheeks shaped like little crab claws, beaming')),
  },
  {
    name: 'Điệp khúc 2 – không chạm nha', section: 'Chorus', energy: 5, lyrics: 'Bé ngắm vui, không chạm nha! / Ồ kìa, cua đi ngang! / Mẹ bên, bé cười vang',
    transition: 'hold', shot: 'medium close-up', dir: 'static', lens: '50mm eye-level',
    emotion: 'playful, laughing',
    action: 'The girl lowers her hands, wags one index finger side to side as a cheerful "we just look" sign, then laughs; @Me laughs and claps softly once.',
    camera: 'Static medium close-up at child eye level, 50mm, on the girl with the basin soft at frame right.',
    end: frame(BASIN_RIGHT, meKneel('hands pressed together after a soft clap, laughing'), girlSit('facing screen-right toward the green basin, both hands back on her knees, laughing')),
  },
  {
    name: 'Mẹ con cùng đi ngang', section: 'Chorus', energy: 5, lyrics: 'Hai ngón tay bước nhịp nhàng / La la la, cua đi ngang!',
    transition: 'hold', shot: 'medium-wide', dir: 'push-in', lens: '35mm eye-level',
    emotion: 'shared fun, singing together',
    action: 'On the beat both the girl and @Me walk two fingers sideways along the floor beside their knees like crabs, three bouncy steps, singing "la la la".',
    camera: 'Slow push-in at child eye level, 35mm, from medium-wide toward medium, keeping both of them and the basin in frame.',
    end: frame(BASIN_RIGHT, meKneel('left hand on the floor beside her knee with two fingers standing like crab legs, smiling'), girlSit('facing screen-right toward the green basin, right hand on the floor beside her right knee with two fingers standing like crab legs, singing happily')),
  },
  {
    name: 'Cua có kẹp không?', section: 'Bridge', energy: 4, lyrics: 'Mẹ ơi, cua có kẹp không? / Mẹ cười, mình cứ ngắm thôi',
    transition: 'hold', shot: 'medium', dir: 'static', lens: '35mm eye-level',
    emotion: 'curious question, gentle reassurance',
    action: 'The girl lifts her hand, points one finger toward the crab\'s bound claws and looks at her mother with a questioning face; @Me smiles and taps the corner of her own eye softly as a "we just watch" sign.',
    camera: 'Static medium two-shot at child eye level, 35mm, the girl on frame left and the mother on frame right.',
    end: frame(BASIN_RIGHT, meKneel('right index finger near the corner of her eye in a gentle "just watch" sign, left hand on her knee, smiling'), girlSit('facing screen-right, right index finger pointing toward the crab in the basin at center-right, left hand on her knee, curious questioning face')),
  },
  {
    name: 'Để người lớn chăm cua', section: 'Bridge', energy: 3, lyrics: 'Để người lớn chăm chú cua / Bé đứng bên mẹ thật ngoan',
    transition: 'match-pose', shot: 'wide', dir: 'static', lens: '35mm eye-level',
    emotion: 'proud, well-behaved, safe',
    action: 'The girl lowers her pointing hand; @Me rests one hand on the near rim of the basin to show that grown-ups take care of the crab; the girl stands up slowly on her spot at center-left, arms at her sides, smiling proudly.',
    camera: 'Static wide shot at child eye level, 35mm, the whole room from the cookers on screen-left to the floor mat on screen-right.',
    end: frame(BASIN_RIGHT, meKneel('right hand resting on the near rim of the basin, left hand on her knee, smiling'), girlStand('facing screen-right toward the green basin, arms relaxed at her sides, smiling proudly')),
  },
  {
    name: 'Nghiêng trái, nghiêng phải', section: 'Dance Break', energy: 4, lyrics: 'Nghiêng qua trái! Nghiêng qua phải! / Hai ngón tay đi ngang nào!',
    transition: 'hold', shot: 'medium-wide', dir: 'tracking', lens: '35mm eye-level',
    emotion: 'energetic dance, grinning',
    action: 'On the beat the girl leans to the left, then to the right, holding two-finger crab hands at shoulder height, staying on her spot; @Me lets go of the basin and copies the moves while kneeling.',
    camera: 'Slow lateral tracking move from screen-left to screen-right at child eye level, 35mm, keeping the girl and the mother in frame.',
    end: frame(BASIN_RIGHT, meKneel('both hands raised at shoulder height with two fingers like crab claws, laughing'), girlStand('facing screen-right toward the green basin, both hands raised at shoulder height with two fingers like crab claws, leaning slightly to the right, grinning')),
  },
  {
    name: 'Vỗ tay cười tươi', section: 'Dance Break', energy: 4, lyrics: 'Vỗ tay nhé! Cười thật tươi! / Chú cua vui, bé vui rồi!',
    transition: 'hold', shot: 'medium', dir: 'static', lens: '35mm eye-level',
    emotion: 'beaming, celebratory',
    action: 'The girl straightens up and claps twice on the beat, then turns her smiling face toward the camera; @Me claps along twice.',
    camera: 'Static medium shot at child eye level, 35mm, the girl at frame left and the basin at frame right.',
    end: frame(BASIN_RIGHT, meKneel('hands pressed together after clapping, smiling'), girlStand('body facing screen-right, face turned three-quarter toward camera, hands clasped together in front of her chest after clapping, beaming')),
  },
  {
    name: 'Điệp khúc cuối – lắc lư', section: 'Final Chorus', energy: 5, lyrics: 'Ồ kìa, cua đi ngang! / Lắc lư, lắc lư, thật ngoan / Mai xanh, đôi càng cam',
    transition: 'hold', shot: 'medium-wide', dir: 'push-in', lens: '35mm eye-level',
    emotion: 'joyful, bouncy, on the beat',
    action: 'On the beat the girl sways left and right twice with crab-claw hands beside her cheeks, then turns her face back toward the basin; @Me sways with her.',
    camera: 'Slow push-in at child eye level, 35mm, from medium-wide toward medium.',
    end: frame(BASIN_RIGHT, meKneel('sitting upright with both palms resting on her knees, smiling'), girlStand('facing screen-right toward the green basin, both hands beside her cheeks shaped like little crab claws, beaming')),
  },
  {
    name: 'Điệp khúc cuối – không chạm nha', section: 'Final Chorus', energy: 5, lyrics: 'Bé ngắm vui, không chạm nha! / Ồ kìa, cua đi ngang! / Mẹ bên, bé cười vang',
    transition: 'hold', shot: 'medium', dir: 'tracking', lens: '35mm eye-level',
    emotion: 'playful, laughing',
    action: 'The girl lowers her hands, wags one finger side to side as a cheerful "we just look" sign and laughs; @Me laughs and nods.',
    camera: 'Slow lateral tracking move from screen-left to screen-right at child eye level, 35mm, from the girl toward the mother.',
    end: frame(BASIN_RIGHT, meKneel('nodding with a big smile, both palms resting on her knees'), girlStand('facing screen-right toward the green basin, arms relaxed at her sides, laughing')),
  },
  {
    name: 'Điệp khúc cuối – la la la', section: 'Final Chorus', energy: 5, lyrics: 'Hai ngón tay bước nhịp nhàng / La la la, cua đi ngang!',
    transition: 'hold', shot: 'medium close-up', dir: 'static', lens: '50mm eye-level',
    emotion: 'bouncy, big smile, singing',
    action: 'On the beat the girl bounces gently on her spot with two-finger crab hands beside her shoulders, singing "la la la"; @Me claps softly.',
    camera: 'Static medium close-up at child eye level, 50mm, on the singing girl.',
    end: frame(BASIN_RIGHT, meKneel('hands pressed together after a soft clap, smiling'), girlStand('facing screen-right toward the green basin, both hands beside her shoulders with two fingers like crab claws, singing with a big smile')),
  },
  {
    name: 'Chào chú cua, cảm ơn mẹ', section: 'Outro', energy: 3, lyrics: 'Chào chú cua, bé vẫy tay / Cảm ơn mẹ, vui hôm nay',
    transition: 'hold', shot: 'medium', dir: 'push-in', lens: '35mm eye-level',
    emotion: 'grateful, tender',
    action: 'The girl lowers her hands and waves her right hand toward the crab, then presses both hands together and bows her head slightly toward her mother in thanks; @Me smiles warmly.',
    camera: 'Slow push-in at child eye level, 35mm, on the girl and the mother across the basin.',
    end: frame(BASIN_RIGHT, meKneel('smiling warmly, both palms resting on her knees'), girlStand('facing screen-right toward her mother and the basin, hands pressed together in front of her chest, head slightly bowed, smiling')),
  },
  {
    name: 'Mẹ mang cua đi, bé vẫy tay', section: 'Outro', energy: 2, lyrics: 'Mẹ bên chăm chú cua nhé / Bé còn nhớ mãi chuyện này!',
    transition: 'hold', shot: 'wide', dir: 'static', lens: '35mm eye-level',
    emotion: 'warm, content goodbye',
    action: '@Me stands up, lifts the green basin by its two handles and carries it slowly toward screen-right onto the brown floor mat, then stops there; the girl stays on her spot at center-left and waves goodbye to the crab. Keep the final two seconds completely still.',
    camera: 'Locked-off static wide shot at child eye level, 35mm, the whole room from the cookers on screen-left to the floor mat on screen-right.',
    end: `${CHAIR} @Me stands on the brown floor mat at screen-right, facing screen-left toward the girl, holding the green basin in front of her with both hands by its handles, the crab inside it, smiling. @BeGai stands on the wood floor at center-left, facing screen-right, right hand raised in a goodbye wave, smiling, and the frame stays completely still for the final two seconds.`,
  },
];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
if (data.scenes.length !== S.length) throw new Error(`JSON có ${data.scenes.length} cảnh, generator có ${S.length}`);

const NEGATIVE = 'flat 2D illustration, anime, live-action, generic doll face, enlarged eyes, aged-up girl, changed face, changed outfit, extra people, crowd, human reflections, portraits, duplicate characters, duplicate basin, duplicate crab, crab outside the basin, untied claws, text, watermark, abrupt cut';

let prevEnd = null;
data.scenes.forEach((scene, i) => {
  const spec = S[i];
  Object.assign(scene, {
    name: spec.name,
    song_section: spec.section,
    lyrics: spec.lyrics,
    energy: spec.energy,
    transition_in: spec.transition,
    shotSize: spec.shot,
    cameraDirection: spec.dir,
    cameraLensAndAngle: spec.lens,
    emotionAndEnergy: spec.emotion,
    start_state: spec.start || toStart(prevEnd),
    scene_action: spec.action,
    camera_move: spec.camera,
    end_state: spec.end,
    negativePrompt: NEGATIVE,
  });
  prevEnd = spec.end;
});

for (const asset of data.project.global_ingredients) {
  if (LOCKS[asset.tag]) asset.appearance_lock = LOCKS[asset.tag];
  if (asset.tag === '@PhongMau') asset.description = 'Stylized 3D version of the real home corner: wood floor, sliding glass doors to a plant balcony, blue child chair, cookers on screen-left, floor mat on screen-right.';
}
for (const ch of data.chapters) {
  ch.prompt_blocks.background_lock = BACKGROUND_LOCK;
  ch.recommended_setup = [
    'Upload @BeGai, @Me and @PhongMau (3D versions); the basin and crab are described in the prompt, not attached, to stay within 3 ingredients.',
    'Step 1 for every scene: Flow image mode, attach @BeGai, @Me and @PhongMau, paste keyframe.prompt, approve the still and save it to keyframe.output_file.',
    'Step 2: Flow Frames to Video with that still as First Frame, no ingredients, paste video.prompt.',
  ];
}

fs.writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const rel = path.relative(ROOT, FILE).replace(/\\/g, '/');
console.log(`Đã ghi ${S.length} cảnh vào ${rel}`);

// Tự chạy assemble + validate để chỉ cần một lệnh (PowerShell 5.1 không có `&&`).
for (const script of ['assemble-flow-prompts.mjs', 'validate-flow.mjs']) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), rel], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
