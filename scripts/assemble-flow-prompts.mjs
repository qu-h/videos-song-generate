#!/usr/bin/env node
/**
 * assemble-flow-prompts.mjs — ghép lại `scenes[].prompt` từ các khối lock + state
 * theo đúng thứ tự chuẩn (WORKFLOW.md mục 5 / skill flow-scene-continuity).
 *
 *   node scripts/assemble-flow-prompts.mjs data/g-flow/<slug>-flow-16x9.json [--dry]
 *
 * Mục đích: AI chỉ cần viết các TRƯỜNG (start_state, scene_action, camera_move, end_state,
 * prompt_blocks, anchors, appearance_lock…), còn `prompt` được sinh máy → không bao giờ lệch
 * nguyên văn, không bao giờ quên style_anchor / format_lock. Sau đó chạy `npm run flow:validate`.
 *
 * Ngoài `prompt`, script còn tự điền / đồng bộ:
 *   - `scenes[].ingredients`      = mọi tag @ xuất hiện trong prompt (theo thứ tự xuất hiện)
 *   - `scenes[].character_lock`   = ghép từ `appearance_lock` của ĐÚNG các nhân vật / đạo cụ có mặt
 *                                   trong cảnh (tag xuất hiện ở start_state / scene_action / end_state),
 *                                   trừ khi chapter đã có `prompt_blocks.character_lock` viết tay.
 *   - `chapters[].scene_numbers`, `scene_count`, `upload_checklist` (danh sách tag cần upload vào chapter)
 *   - `project.total_scenes`, `project.chapter_count`
 *
 * Khi `project.generation_pipeline = "keyframe-first"` (mặc định cho dự án mới), mỗi cảnh được tách
 * thành 2 bước riêng, KHÔNG còn `prompt` / `keyframe_prompt` trộn lẫn:
 *   - `scenes[].keyframe` (bước 1, Flow tạo ảnh + ingredients ≤ 3) — ảnh tĩnh đúng start_state
 *   - `scenes[].video`    (bước 2, Flow Frames-to-Video, first_frame = keyframe.output_file) — chỉ chuyển động
 * Xem scripts/lib/keyframe-first.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_KEYFRAME_FORMAT_LOCK,
  DEFAULT_VIDEO_REFERENCE_LOCK,
  assembleKeyframeFirstScene,
  isKeyframeFirst,
  sceneIngredients,
} from './lib/keyframe-first.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('Cách dùng: node scripts/assemble-flow-prompts.mjs <flow.json> [--dry]');
  process.exit(2);
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const sentence = (s) => {
  const t = clean(s);
  return t && !/[.!?]$/.test(t) ? `${t}.` : t;
};
const tagsIn = (text) => [...new Set((String(text || '').match(/@[A-Za-z][A-Za-z0-9_]*/g) || []))];
const ingTag = (i) => (typeof i === 'string' ? i : i?.tag);
const joinAnd = (arr) => (arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);

/**
 * Tìm bản ghi ingredient theo tag: ưu tiên ingredient của chapter, rồi global_ingredients.
 * Trả về object có thể có `type`, `appearance_lock`.
 */
function lookupIngredient(tag, ch, project) {
  const fromCh = (ch?.ingredients || []).find((i) => ingTag(i) === tag);
  const fromGlobal = (project.global_ingredients || []).find((i) => ingTag(i) === tag);
  if (fromCh && typeof fromCh === 'object' && (fromCh.appearance_lock || fromCh.type)) {
    // chapter ingredient có thể chỉ là tham chiếu {tag, scope:'global'} → bổ sung từ global
    return { ...(typeof fromGlobal === 'object' ? fromGlobal : {}), ...fromCh };
  }
  if (fromGlobal && typeof fromGlobal === 'object') return fromGlobal;
  return typeof fromCh === 'object' ? fromCh : null;
}

/**
 * Ghép character_lock cho một cảnh từ appearance_lock của các nhân vật/đạo cụ CÓ MẶT trong cảnh.
 * Cảnh không có nhân vật → "No people or animals appear in this clip."
 */
function buildCharacterLock(scene, ch, project) {
  const stateText = [scene.start_state, scene.scene_action, scene.end_state].join(' ');
  const present = tagsIn(stateText);
  const living = [];
  const props = [];
  const parts = [];
  for (const tag of present) {
    const ing = lookupIngredient(tag, ch, project);
    if (!ing) continue;
    if (ing.type === 'character') living.push(tag);
    else if (ing.type === 'prop') props.push(tag);
    else continue; // background: không đưa vào character_lock
    if (ing.appearance_lock) parts.push(clean(ing.appearance_lock));
  }
  if (living.length) {
    const extra = scene.extra_living_allowed ? `, plus ${clean(scene.extra_living_allowed)}` : '';
    parts.push(`Only ${joinAnd(living)} may appear as living character${living.length > 1 ? 's' : ''}${extra}. Do not add any other person or animal.`);
  } else {
    parts.push('No people or animals appear in this clip.');
  }
  return parts.map(sentence).join(' ');
}

for (const f of files) {
  const file = path.resolve(process.cwd(), f);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const project = data.project || {};
  const formatLock = data.format_lock || project.format_lock || '';
  const keyframeFirst = isKeyframeFirst(project);
  if (keyframeFirst) {
    project.keyframe_format_lock ||= DEFAULT_KEYFRAME_FORMAT_LOCK;
    project.video_reference_lock ||= DEFAULT_VIDEO_REFERENCE_LOCK;
  }
  if (project.manifest_mode === 'flat' && keyframeFirst) {
    const missing = new Set();
    for (const s of data.scenes || []) {
      for (const tag of assembleKeyframeFirstScene(s, null, project, formatLock)) missing.add(tag);
      warnIngredients(s, project);
    }
    project.total_scenes = (data.scenes || []).length;
    reportMissingLabels(missing);
    if (!dry) fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${f}: flat manifest, keyframe-first — đã sinh ${(data.scenes || []).length} cặp keyframe/video`);
    continue;
  }
  if (project.manifest_mode === 'flat') {
    const catalog = project.reference_assets || [];
    const validTags = new Set(catalog.map(ingTag).filter(Boolean));
    let changed = 0;
    for (const s of data.scenes || []) {
      // Flat manifests keep the complete self-contained prompt per scene. The assembler
      // synchronizes the scene ingredient list from its prompt without chapter blocks.
      const tags = tagsIn(s.prompt || '');
      s.ingredients = tags;
      s.character_reference = tags.includes(project.main_character_reference) ? project.main_character_reference : null;
      for (const tag of tags) if (!validTags.has(tag)) console.warn(`scene ${s.scene_number}: ${tag} chưa có trong project.reference_assets`);
      if (tags.length > 3 && !s.start_frame && !s.composite_frame) {
        console.warn(`  ⚠️  scene ${s.scene_number}: có ${tags.length} ingredients (${tags.join(', ')}) vượt quá giới hạn 3 của Google Flow! Hãy dùng Start Frame (Image-to-Video) hoặc luân phiên nhân vật.`);
      }
      changed++;
    }
    project.total_scenes = (data.scenes || []).length;
    if (!dry) fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${f}: flat manifest, ${changed} scene ingredients synchronized; prompts kept self-contained`);
    continue;
  }
  const chapters = new Map((data.chapters || []).map((c) => [c.chapter_id, c]));
  let changed = 0;
  const missingLabels = new Set();

  // ---------- chapter manifest: scene_numbers / scene_count / upload_checklist ----------
  const globalTags = (project.global_ingredients || []).map(ingTag).filter(Boolean);
  for (const ch of data.chapters || []) {
    const nums = (data.scenes || []).filter((s) => s.chapter_id === ch.chapter_id).map((s) => s.scene_number);
    ch.scene_numbers = nums;
    ch.scene_count = nums.length;
    if (nums.length) ch.scene_range = [Math.min(...nums), Math.max(...nums)];
    const chTags = (ch.ingredients || []).map(ingTag).filter(Boolean);
    ch.upload_checklist = [...new Set([...globalTags, ...chTags])];
  }
  project.total_scenes = (data.scenes || []).length;
  project.chapter_count = (data.chapters || []).length;

  for (const s of data.scenes || []) {
    const ch = chapters.get(s.chapter_id);
    if (!ch) {
      console.error(`scene ${s.scene_number}: chapter_id "${s.chapter_id}" không tồn tại — bỏ qua`);
      continue;
    }
    if (keyframeFirst) {
      const before = JSON.stringify([s.keyframe, s.video]);
      for (const tag of assembleKeyframeFirstScene(s, ch, project, formatLock)) missingLabels.add(tag);
      if (JSON.stringify([s.keyframe, s.video]) !== before) changed++;
      warnIngredients(s, project);
      continue;
    }
    const pb = ch.prompt_blocks || {};
    const bg = s.background_reference || (ch.ingredients || []).find((i) => i.type === 'background')?.tag || '';

    // character_lock: viết tay ở chapter (ưu tiên) hoặc ghép tự động theo nhân vật có mặt
    const characterLock = pb.character_lock || buildCharacterLock(s, ch, project);
    if (!pb.character_lock) s.character_lock = characterLock;

    const parts = [
      characterLock,
      pb.background_lock,
      pb.continuity_lock,
      pb.lighting_lock,
      ch.camera_family ? `Camera family for this chapter: ${clean(ch.camera_family)}` : '',
      project.style_anchor,
      project.light_direction_anchor,
      project.palette_anchor,
      project.camera_height_anchor,
      project.screen_direction,
      formatLock,
      s.start_state ? `The clip opens on exactly this first frame: ${clean(s.start_state)}` : '',
      s.scene_action ? `Scene action: ${clean(s.scene_action)}` : '',
      s.camera_move ? `Camera: ${clean(s.camera_move)}` : '',
      s.end_state ? `The clip ends on exactly this final frame: ${clean(s.end_state)}` : '',
      bg
        ? `The location must remain recognizable as the exact same ${bg} reference from the first frame to the last frame. Do not generate a new location interpretation.`
        : '',
    ]
      .map(sentence)
      .filter(Boolean);

    const prompt = parts.join(' ');
    if (s.prompt !== prompt) {
      s.prompt = prompt;
      changed++;
    }
    // ingredients = mọi tag @ xuất hiện trong prompt, giữ thứ tự xuất hiện
    s.ingredients = tagsIn(prompt);
    s.character_reference = s.ingredients.includes(project.main_character_reference) ? project.main_character_reference : null;
    if (bg) s.background_reference = bg;
    if (s.ingredients.length > 3 && !s.start_frame && !s.composite_frame) {
      console.warn(`  ⚠️  scene ${s.scene_number}: có ${s.ingredients.length} ingredients (${s.ingredients.join(', ')}) vượt quá giới hạn 3 của Google Flow! Hãy dùng Start Frame (Image-to-Video) hoặc luân phiên nhân vật.`);
    }
  }

  reportMissingLabels(missingLabels);
  if (dry) {
    console.log(`${f}: ${changed} prompt sẽ thay đổi (dry run, không ghi)`);
  } else {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${f}: đã ghép lại ${changed} ${keyframeFirst ? 'cặp keyframe/video' : 'prompt'}, cập nhật ingredients / character_lock / chapter manifest`);
  }
}

function warnIngredients(s, project) {
  const tags = sceneIngredients(s, project);
  if (tags.length > 3)
    console.warn(`  ⚠️  scene ${s.scene_number}: keyframe cần ${tags.length} ingredients (${tags.join(', ')}) > 3 của Google Flow — gộp bối cảnh + đạo cụ vào một ảnh reference.`);
}

function reportMissingLabels(missing) {
  if (missing.size)
    console.warn(`  ⚠️  thiếu "label" cho ${[...missing].join(', ')} — video.prompt (Frames-to-Video) đang còn @tag. Thêm label vào ingredient/asset rồi chạy lại.`);
}
