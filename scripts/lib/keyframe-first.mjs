/**
 * keyframe-first.mjs — quy trình 2 bước chuẩn cho Google Flow:
 *
 *   BƯỚC 1  Keyframe (Flow: tạo ẢNH, có ingredients ≤ 3)
 *           scene.keyframe.prompt  = ảnh tĩnh 16:9 đúng start_state + khoá nhân vật / bối cảnh / ánh sáng / style
 *           → duyệt ảnh, lưu vào scene.keyframe.output_file
 *   BƯỚC 2  Video (Flow: Frames to Video, ảnh keyframe ở ô First Frame, KHÔNG ingredients)
 *           scene.video.prompt     = chỉ mô tả chuyển động từ ảnh đầu tới end_state; không @tag, không tả lại mặt
 *
 * Dùng chung cho assemble-flow-prompts.mjs (sinh) và validate-flow.mjs (kiểm), nên prompt luôn khớp nguyên văn.
 * Bật bằng `project.generation_pipeline: "keyframe-first"`.
 */

export const KEYFRAME_FIRST = 'keyframe-first';
export const MAX_KEYFRAME_INGREDIENTS = 3;
export const KEYFRAME_SOURCES = ['generate', 'chain-last-frame'];

export const DEFAULT_KEYFRAME_FORMAT_LOCK =
  'Create one single still image in 16:9 landscape format. It is the exact opening frame of an 8-second video shot, composed as one clean, readable film frame. Frozen moment, no motion blur, no collage or split screen. No text, subtitles, captions, logo or watermark.';

export const DEFAULT_VIDEO_REFERENCE_LOCK =
  'Animate the uploaded starting frame. The starting frame is the only visual reference: keep every person, face, apparent age, hairstyle, outfit and prop, the location layout, the light direction and the colors exactly as they appear in it. Do not redraw, restyle, replace or add anyone or anything.';

const KEYFRAME_NEGATIVE_EXTRA = ['motion blur', 'collage', 'split screen', 'multiple panels', 'cropped heads'];
const VIDEO_NEGATIVE_EXTRA = ['morphing face', 'identity drift', 'changing outfit', 'flicker', 'new characters entering', 'scene cut'];
// Thuật ngữ chỉ có nghĩa với chuyển động → bỏ khỏi negative của ảnh tĩnh.
const MOTION_ONLY_NEGATIVE = /^(abrupt cut|camera shake|flicker|montage|zoom transition|scene cut|jump cut)$/i;

export const isKeyframeFirst = (project) => project?.generation_pipeline === KEYFRAME_FIRST;

export const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
export const sentence = (s) => {
  const t = clean(s);
  return t && !/[.!?]$/.test(t) ? `${t}.` : t;
};
export const tagsIn = (text) => [...new Set(String(text || '').match(/@[A-Za-z][A-Za-z0-9_]*/g) || [])];
export const ingTag = (i) => (typeof i === 'string' ? i : i?.tag);
export const joinAnd = (arr) =>
  arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;

/** Bản ghi asset theo tag: chapter ingredient > global_ingredients > reference_assets (flat). */
export function lookupAsset(tag, ch, project) {
  const pick = (list) => (list || []).find((i) => ingTag(i) === tag);
  const fromCh = pick(ch?.ingredients);
  const fromGlobal = pick(project.global_ingredients) || pick(project.reference_assets);
  const base = typeof fromGlobal === 'object' ? fromGlobal : {};
  const own = typeof fromCh === 'object' ? fromCh : {};
  const merged = { ...base, ...own };
  return Object.keys(merged).length ? merged : null;
}

/** Thay @Tag bằng `label` của asset (dùng cho prompt video: Frames-to-Video không có ingredients). */
export function labelize(text, ch, project) {
  const missing = new Set();
  const out = String(text || '').replace(/@[A-Za-z][A-Za-z0-9_]*/g, (tag, offset, whole) => {
    const label = clean(lookupAsset(tag, ch, project)?.label);
    if (!label) {
      missing.add(tag);
      return tag;
    }
    // nhãn ("the girl") đứng đầu câu → viết hoa chữ đầu
    const startsSentence = /(^|[.!?:]\s+)$/.test(whole.slice(0, offset));
    return startsSentence ? label[0].toUpperCase() + label.slice(1) : label;
  });
  return { text: out, missing: [...missing] };
}

function blocksFor(ch, project) {
  return ch?.prompt_blocks || project.prompt_blocks || {};
}

function backgroundTag(scene, ch) {
  return scene.background_reference || (ch?.ingredients || []).find((i) => i?.type === 'background')?.tag || '';
}

/** character_lock từ appearance_lock của những tag có mặt trong `stateText`. */
export function buildCharacterLock(stateText, ch, project, extraLiving = '') {
  const living = [];
  const parts = [];
  for (const tag of tagsIn(stateText)) {
    const asset = lookupAsset(tag, ch, project);
    if (!asset || !['character', 'prop'].includes(asset.type)) continue;
    if (asset.type === 'character') living.push(tag);
    if (asset.appearance_lock) parts.push(clean(asset.appearance_lock));
  }
  if (living.length) {
    const extra = extraLiving ? `, plus ${clean(extraLiving)}` : '';
    parts.push(
      `Only ${joinAnd(living)} may appear as living character${living.length > 1 ? 's' : ''}${extra}. Do not add any other person or animal.`,
    );
  } else {
    parts.push('No people or animals appear in this frame.');
  }
  return parts.map(sentence).join(' ');
}

const firstShot = (shotSize) => clean(String(shotSize || '').split(/→|->|\bto\b/i)[0]);

function negativeList(text) {
  return String(text || '')
    .split(',')
    .map(clean)
    .filter(Boolean);
}
const uniqJoin = (arr) => [...new Map(arr.map((t) => [t.toLowerCase(), t])).values()].join(', ');

export function keyframeOutputFile(project, scene) {
  const n = String(scene.scene_number).padStart(2, '0');
  return `data/g-flow/assets/${project.slug || 'project'}/keyframes/scene-${n}-start.png`;
}

/** BƯỚC 1 — prompt tạo ảnh keyframe (đúng start_state). */
export function buildKeyframe(scene, ch, project) {
  const prev = scene.keyframe || {};
  const pb = blocksFor(ch, project);
  const bg = backgroundTag(scene, ch);
  const keyframeFormat = project.keyframe_format_lock || DEFAULT_KEYFRAME_FORMAT_LOCK;
  const framing = [firstShot(scene.shotSize) && `${firstShot(scene.shotSize)} shot`, clean(scene.cameraLensAndAngle)]
    .filter(Boolean)
    .join(', ');
  const parts = [
    keyframeFormat,
    buildCharacterLock(scene.start_state, ch, project, scene.extra_living_allowed),
    pb.background_lock,
    pb.lighting_lock,
    ch?.camera_family ? `Camera family for this chapter: ${clean(ch.camera_family)}` : '',
    project.style_anchor,
    project.light_direction_anchor,
    project.palette_anchor,
    project.camera_height_anchor,
    project.screen_direction,
    framing ? `Framing: ${framing}` : '',
    scene.start_state ? `Exact composition of this still: ${clean(scene.start_state)}` : '',
    scene.emotionAndEnergy ? `Mood and expressions: ${clean(scene.emotionAndEnergy)}` : '',
    bg ? `The location is exactly the ${bg} reference. Do not generate a new location interpretation.` : '',
  ]
    .map(sentence)
    .filter(Boolean);
  const prompt = parts.join(' ');
  const base = negativeList(scene.negativePrompt).filter((t) => !MOTION_ONLY_NEGATIVE.test(t));
  return {
    step: 1,
    flow_mode: 'image',
    source: KEYFRAME_SOURCES.includes(prev.source) ? prev.source : 'generate',
    ingredients: tagsIn(prompt),
    prompt,
    negativePrompt: uniqJoin([...base, ...KEYFRAME_NEGATIVE_EXTRA]),
    output_file: prev.output_file || keyframeOutputFile(project, scene),
  };
}

/** BƯỚC 2 — prompt Frames-to-Video: chỉ chuyển động, không @tag, không tả lại nhân vật. */
export function buildVideo(scene, ch, project, formatLock, keyframe) {
  const pb = blocksFor(ch, project);
  const bg = backgroundTag(scene, ch);
  const stateText = [scene.start_state, scene.scene_action, scene.end_state].join(' ');
  const living = tagsIn(stateText).filter((t) => lookupAsset(t, ch, project)?.type === 'character');
  const extra = scene.extra_living_allowed ? `, plus ${clean(scene.extra_living_allowed)}` : '';
  const livingSentence = living.length
    ? `Only ${joinAnd(living)} may appear as living character${living.length > 1 ? 's' : ''}${extra}. Do not add any other person or animal.`
    : 'No people or animals appear in this clip.';
  const parts = [
    project.video_reference_lock || DEFAULT_VIDEO_REFERENCE_LOCK,
    livingSentence,
    pb.continuity_lock,
    pb.lighting_lock,
    ch?.camera_family ? `Camera family for this chapter: ${clean(ch.camera_family)}` : '',
    // palette_anchor chỉ nằm ở keyframe: màu sắc đã cố định trong ảnh đầu.
    project.style_anchor,
    project.light_direction_anchor,
    project.camera_height_anchor,
    project.screen_direction,
    formatLock,
    scene.start_state ? `The clip opens on exactly the uploaded starting frame: ${clean(scene.start_state)}` : '',
    scene.scene_action ? `Scene action: ${clean(scene.scene_action)}` : '',
    cameraSentence(scene),
    scene.end_state ? `The clip ends on exactly this final frame: ${clean(scene.end_state)}` : '',
    bg ? `The location stays exactly the ${bg} shown in the starting frame from the first frame to the last frame. Do not generate a new location interpretation.` : '',
  ]
    .map(sentence)
    .filter(Boolean);
  const missing = new Set();
  const label = (text) => {
    const result = labelize(clean(text), ch, project);
    result.missing.forEach((tag) => missing.add(tag));
    return result.text;
  };
  return {
    video: {
      step: 2,
      flow_mode: 'frames-to-video',
      first_frame: keyframe.output_file,
      durationSeconds: scene.durationSeconds,
      // Từ khoá chuyển động / máy quay của bước video (đã đổi @tag → label, vì Frames-to-Video không có ingredients).
      cameraDirection: clean(scene.cameraDirection),
      cameraLensAndAngle: clean(scene.cameraLensAndAngle),
      start_state: label(scene.start_state),
      scene_action: label(scene.scene_action),
      camera_move: clean(scene.camera_move),
      end_state: label(scene.end_state),
      prompt: label(parts.join(' ')),
      negativePrompt: uniqJoin([...negativeList(scene.negativePrompt), ...VIDEO_NEGATIVE_EXTRA]),
    },
    missingLabels: [...missing],
  };
}

/** "Camera: <camera_move> Camera direction: tracking; lens and angle: 35mm eye-level." */
function cameraSentence(scene) {
  const move = clean(scene.camera_move);
  const details = [
    scene.cameraDirection && `camera direction: ${clean(scene.cameraDirection)}`,
    scene.cameraLensAndAngle && `lens and angle: ${clean(scene.cameraLensAndAngle)}`,
  ].filter(Boolean);
  if (!move && !details.length) return '';
  const detailText = details.length ? `${details.join('; ')}.` : '';
  return `Camera: ${[sentence(move), detailText.charAt(0).toUpperCase() + detailText.slice(1)].filter(Boolean).join(' ')}`;
}

const LEGACY_FIELDS = ['prompt', 'keyframe_prompt', 'keyframe_status', 'start_frame', 'character_lock', 'ingredients', 'composite_frame'];

/** Sinh lại keyframe + video cho 1 cảnh, xoá trường cũ trộn lẫn 2 bước. Trả về danh sách tag thiếu label. */
export function assembleKeyframeFirstScene(scene, ch, project, formatLock) {
  const keyframe = buildKeyframe(scene, ch, project);
  const { video, missingLabels } = buildVideo(scene, ch, project, formatLock, keyframe);
  for (const k of LEGACY_FIELDS) delete scene[k];
  scene.character_reference = keyframe.ingredients.includes(project.main_character_reference)
    ? project.main_character_reference
    : null;
  const bg = backgroundTag(scene, ch);
  if (bg) scene.background_reference = bg;
  scene.keyframe = keyframe;
  scene.video = video;
  return missingLabels;
}

export const sceneIngredients = (scene, project) =>
  isKeyframeFirst(project) ? scene.keyframe?.ingredients || [] : scene.ingredients || [];

export const scenePromptText = (scene, project) =>
  isKeyframeFirst(project) ? `${scene.keyframe?.prompt || ''} ${scene.video?.prompt || ''}` : String(scene.prompt || '');

/** Kiểm tra 1 cảnh keyframe-first. `prevScene` để kiểm chain-last-frame. */
export function checkKeyframeFirstScene({ scene: s, prevScene, ch, project, formatLock, E, W, id }) {
  const kf = s.keyframe;
  const vd = s.video;
  if (!kf || typeof kf !== 'object') return E(`${id}: thiếu scene.keyframe (bước 1) — chạy npm run flow:assemble`);
  if (!vd || typeof vd !== 'object') return E(`${id}: thiếu scene.video (bước 2) — chạy npm run flow:assemble`);
  for (const k of LEGACY_FIELDS) if (s[k] !== undefined) E(`${id}: còn trường cũ "${k}" — keyframe-first chỉ dùng scene.keyframe / scene.video`);

  const clone = JSON.parse(JSON.stringify(s));
  const expectedKf = buildKeyframe(clone, ch, project);
  const { video: expectedVd, missingLabels } = buildVideo(clone, ch, project, formatLock, expectedKf);
  if (kf.prompt !== expectedKf.prompt) E(`${id}: keyframe.prompt lệch với các khối nguồn — chạy npm run flow:assemble`);
  if (vd.prompt !== expectedVd.prompt) E(`${id}: video.prompt lệch với các khối nguồn — chạy npm run flow:assemble`);
  if (JSON.stringify(kf.ingredients) !== JSON.stringify(expectedKf.ingredients))
    E(`${id}: keyframe.ingredients ${JSON.stringify(kf.ingredients)} ≠ tag trong keyframe.prompt ${JSON.stringify(expectedKf.ingredients)}`);
  for (const tag of missingLabels)
    E(`${id}: ${tag} thiếu "label" (vd "the girl") — video.prompt không được chứa @tag vì Frames-to-Video không có ingredients`);
  if (tagsIn(vd.prompt).length) E(`${id}: video.prompt còn @tag ${tagsIn(vd.prompt).join(', ')}`);

  if ((kf.ingredients || []).length > MAX_KEYFRAME_INGREDIENTS)
    E(`${id}: keyframe dùng ${kf.ingredients.length} ingredients (${kf.ingredients.join(', ')}) > ${MAX_KEYFRAME_INGREDIENTS} của Flow — gộp bối cảnh + đạo cụ vào 1 ảnh reference`);
  for (const tag of kf.ingredients || []) if (!lookupAsset(tag, ch, project)) E(`${id}: keyframe dùng ${tag} nhưng tag chưa được khai báo`);
  if (!kf.ingredients?.includes(project.main_character_reference) && tagsIn(s.start_state).includes(project.main_character_reference))
    E(`${id}: keyframe thiếu ${project.main_character_reference}`);

  for (const k of ['status']) {
    if (kf[k] !== undefined) E(`${id}: keyframe.${k} không còn dùng — chạy npm run flow:assemble`);
    if (vd[k] !== undefined) E(`${id}: video.${k} không còn dùng — chạy npm run flow:assemble`);
  }
  for (const k of ['cameraDirection', 'cameraLensAndAngle', 'start_state', 'scene_action', 'camera_move', 'end_state']) {
    if (vd[k] !== expectedVd[k]) E(`${id}: video.${k} lệch với trường nguồn của cảnh — chạy npm run flow:assemble`);
    if (!vd[k]) W(`${id}: video.${k} trống — đây là từ khoá chuyển động / máy quay của bước video`);
  }
  if (!KEYFRAME_SOURCES.includes(kf.source)) E(`${id}: keyframe.source phải là ${KEYFRAME_SOURCES.join(' | ')}`);
  if (!kf.output_file) E(`${id}: thiếu keyframe.output_file`);
  if (vd.first_frame !== kf.output_file) E(`${id}: video.first_frame phải trỏ đúng keyframe.output_file`);
  if (vd.flow_mode !== 'frames-to-video') E(`${id}: video.flow_mode phải là frames-to-video`);
  if (kf.flow_mode !== 'image') E(`${id}: keyframe.flow_mode phải là image`);
  if (kf.source === 'chain-last-frame') {
    if (!prevScene) E(`${id}: cảnh đầu tiên không thể dùng keyframe.source=chain-last-frame`);
    else if (!['hold', 'cut-on-action'].includes(s.transition_in) || prevScene.chapter_id !== s.chapter_id)
      W(`${id}: chain-last-frame chỉ an toàn với transition hold / cut-on-action trong cùng chapter`);
  }

  // Nhân vật vào khung giữa clip không có trong ảnh đầu → Frames-to-Video phải tự vẽ, dễ lệch mặt.
  const startTags = tagsIn(s.start_state);
  for (const tag of tagsIn(`${s.scene_action} ${s.end_state}`)) {
    if (lookupAsset(tag, ch, project)?.type === 'character' && !startTags.includes(tag))
      W(`${id}: ${tag} không có trong start_state (keyframe) nhưng xuất hiện trong action/end_state — Frames-to-Video không có reference cho nhân vật này`);
  }
}
