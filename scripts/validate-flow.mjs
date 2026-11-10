#!/usr/bin/env node
/**
 * validate-flow.mjs — kiểm tra tính liền mạch (continuity) của Google Flow JSON.
 *
 *   node scripts/validate-flow.mjs                      # tất cả data/g-flow/*.json
 *   node scripts/validate-flow.mjs data/g-flow/x.json   # một hoặc nhiều file
 *   node scripts/validate-flow.mjs --strict             # warning cũng tính là lỗi
 *
 * Rule nguồn: .claude/skills/flow-scene-continuity/SKILL.md và WORKFLOW.md mục 5.
 * Exit code 1 nếu có error (hoặc warning khi --strict).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const files = args.filter((a) => !a.startsWith('--'));

const FORBIDDEN_PHRASES = [
  'previous scene',
  'previous clip',
  'previous numbered clip',
  'direct continuation',
  'continue from',
  'continue as',
  'continues from',
  'same as before',
  'as before',
  'moments later',
  'earlier scene',
  'last scene',
  'next scene',
  'the previous',
  'before this',
];

const TRANSITIONS = ['hold', 'cut-on-action', 'exit-enter', 'match-pose', 'look-off', 'establishing'];
const BRIDGE_TRANSITIONS = ['exit-enter', 'match-pose', 'establishing'];

// Shot ladder: ECU(1) CU(2) MCU(3) MS(4) MW(5) WS(6) EWS(7)
const SHOT_LADDER = [
  [/extreme\s*close|ecu\b|macro/i, 1],
  [/medium\s*close|mcu\b/i, 3],
  [/close[-\s]?up|\bcu\b|\bclose\b/i, 2],
  [/medium[-\s]*wide|\bmw\b|cowboy/i, 5],
  [/\bmedium\b|\bms\b|mid[-\s]?shot/i, 4],
  [/extreme\s*wide|\bews\b|establishing|very\s*wide/i, 7],
  [/\bwide\b|\bws\b|\bfull\b|long\s*shot/i, 6],
];

const STRONG_MOVES = /orbit|tracking|crane|whip|arc|dolly\s*(around|circle)|fly|drone|handheld|rotat/i;
const STATIC_MOVES = /static|locked|still|slow\s*(push|dolly)|gentle\s*push|slow\s*zoom/i;

const ANGLE_LADDER = [
  [/low[-\s]?angle|worm|from\s*below|slightly\s*low/i, 0],
  [/high[-\s]?angle|bird|top[-\s]?down|overhead|from\s*above|slightly\s*high/i, 2],
];

function shotLevel(text, pick = 'first') {
  if (!text) return null;
  // "wide → medium" => start/end
  const parts = String(text)
    .split(/→|->|to\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const piece = pick === 'first' ? parts[0] : parts[parts.length - 1];
  for (const [re, lvl] of SHOT_LADDER) if (re.test(piece)) return lvl;
  return null;
}

function angleLevel(text) {
  if (!text) return 1;
  for (const [re, lvl] of ANGLE_LADDER) if (re.test(text)) return lvl;
  return 1; // eye-level
}

function lensMm(text) {
  const m = String(text || '').match(/(\d{2,3})\s*mm/i);
  return m ? Number(m[1]) : null;
}

function normalizeState(s) {
  return String(s || '')
    .replace(/,?\s*and\s+holds?\s+this\s+(pose|look|position)[^.]*\.?/gi, '')
    .replace(/,?\s*(frozen|nearly still|completely still)[^.]*\.?/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*[.;,]\s*$/, '')
    .trim()
    .toLowerCase();
}

function parseTimecode(tc) {
  if (!tc) return null;
  const m = String(tc).match(/(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4] };
}

function parseDuration(d) {
  if (!d) return null;
  const m = String(d).match(/(\d{1,2}):(\d{2})/);
  return m ? +m[1] * 60 + +m[2] : null;
}

function tagsIn(text) {
  return [...new Set((String(text || '').match(/@[A-Za-z][A-Za-z0-9_]*/g) || []))];
}

function validateFile(file) {
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(m);
  const W = (m) => warnings.push(m);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { errors: [`JSON không parse được: ${e.message}`], warnings };
  }

  const project = data.project || {};
  if (project.manifest_mode === 'flat') {
    const errors = [];
    const warnings = [];
    const E = (m) => errors.push(m);
    const W = (m) => warnings.push(m);
    const scenes = Array.isArray(data.scenes) ? data.scenes : [];
    const assets = Array.isArray(project.reference_assets) ? project.reference_assets : [];
    const assetByTag = new Map(assets.map((a) => [a.tag, a]));
    if (!scenes.length) E('Không có scenes[]');
    if (!assets.length) E('project.reference_assets thiếu danh sách asset phẳng');
    for (const key of ['style_anchor', 'screen_direction', 'light_direction_anchor', 'palette_anchor', 'camera_height_anchor'])
      if (!project[key]) E(`project.${key} thiếu`);
    if (!project.main_character_reference) E('project.main_character_reference thiếu');
    if (!project.total_scenes || project.total_scenes !== scenes.length) E('project.total_scenes không khớp scenes.length');
    for (const asset of assets) {
      if (!asset.tag || !asset.type) E('reference_assets có item thiếu tag/type');
      if (['character', 'prop'].includes(asset.type) && !asset.appearance_lock) E(`${asset.tag}: thiếu appearance_lock`);
      if (asset.type === 'character' && !asset.source_file && !asset.asset_file) W(`${asset.tag}: thiếu source_file/asset_file`);
      if (asset.type !== 'character' && !asset.asset_file) W(`${asset.tag}: thiếu asset_file`);
      const assetPath = asset.asset_file || asset.source_file;
      if (assetPath && !fs.existsSync(path.resolve(ROOT, assetPath))) E(`${asset.tag}: asset file không tồn tại: ${assetPath}`);
    }
    const formatLock = data.format_lock || project.format_lock || '';
    if (!formatLock) E('format_lock thiếu');
    scenes.forEach((s, idx) => {
      const id = `scene ${s.scene_number ?? idx + 1}`;
      if (s.scene_number !== idx + 1) E(`${id}: scene_number không liên tục`);
      for (const key of ['start_state', 'end_state', 'scene_action', 'camera_move', 'prompt']) if (!s[key]) E(`${id}: thiếu ${key}`);
      if (!s.background_reference || !assetByTag.has(s.background_reference)) E(`${id}: background_reference không có trong project.reference_assets`);
      const prompt = String(s.prompt || '');
      for (const key of ['style_anchor', 'light_direction_anchor', 'palette_anchor', 'camera_height_anchor', 'screen_direction'])
        if (project[key] && !prompt.includes(project[key])) E(`${id}: prompt thiếu nguyên văn project.${key}`);
      if (formatLock && !prompt.includes(formatLock)) E(`${id}: prompt thiếu format_lock`);
      for (const state of ['start_state', 'scene_action', 'end_state']) if (s[state] && !prompt.includes(String(s[state]).replace(/\s+/g, ' ').trim())) E(`${id}: prompt thiếu nguyên văn ${state}`);
      const promptTags = tagsIn(prompt);
      const ingredients = Array.isArray(s.ingredients) ? s.ingredients : [];
      for (const tag of promptTags) {
        const asset = assetByTag.get(tag);
        if (!asset) E(`${id}: tag ${tag} không có trong project.reference_assets`);
        else if (['character', 'prop'].includes(asset.type) && asset.appearance_lock && !prompt.includes(asset.appearance_lock.replace(/\s+/g, ' ').trim())) E(`${id}: prompt thiếu appearance_lock của ${tag}`);
        if (!ingredients.includes(tag)) E(`${id}: ingredients thiếu ${tag}`);
      }
      for (const tag of ingredients) if (!promptTags.includes(tag)) E(`${id}: ingredients có ${tag} nhưng prompt không gọi`);
      if (s.transition_in && !TRANSITIONS.includes(s.transition_in)) E(`${id}: transition_in không hợp lệ`);
      const tc = parseTimecode(s.timecode);
      if (!tc) E(`${id}: timecode không hợp lệ`);
      else if (tc.end - tc.start !== Number(s.durationSeconds)) E(`${id}: timecode lệch durationSeconds`);
      if (idx && tc) {
        const prev = scenes[idx - 1];
        const prevTc = parseTimecode(prev.timecode);
        if (prevTc && tc.start !== prevTc.end) E(`${id}: timecode không nối tiếp cảnh trước`);
        const a = normalizeState(prev.end_state), b = normalizeState(s.start_state);
        if (a !== b && !['exit-enter', 'look-off', 'establishing'].includes(s.transition_in)) E(`${id}: start_state không khớp end_state cảnh trước`);
      }
      for (const bad of forbiddenIn(prompt)) E(`${id}: prompt chứa cụm cấm ${bad}`);
    });
    return { errors, warnings };
  }
  const chapters = Array.isArray(data.chapters) ? data.chapters : [];
  const scenes = Array.isArray(data.scenes) ? data.scenes : [];
  const formatLock = data.format_lock || project.format_lock || '';

  if (!scenes.length) E('Không có scenes[]');
  if (!chapters.length) E('Không có chapters[] (WORKFLOW mục 2)');

  // ---------- project-level anchors ----------
  for (const key of ['style_anchor', 'screen_direction']) {
    if (!project[key]) E(`project.${key} thiếu — neo toàn video bắt buộc`);
  }
  for (const key of ['light_direction_anchor', 'palette_anchor', 'camera_height_anchor']) {
    if (!project[key]) W(`project.${key} thiếu — nên có để các chapter cùng một "chất phim"`);
  }
  if (!formatLock) E('format_lock thiếu (ở root hoặc project)');
  if (formatLock && !/family[-\s]?friendly/i.test(formatLock)) W('format_lock nên có "family-friendly" (tránh policy block)');

  const globalTags = new Set(
    (project.global_ingredients || []).map((i) => (typeof i === 'string' ? i : i.tag)).filter(Boolean),
  );
  if (project.main_character_reference) globalTags.add(project.main_character_reference);

  // ---------- Lớp 0: reference manifest (ảnh reference thật → appearance_lock) ----------
  const ingTag = (i) => (typeof i === 'string' ? i : i?.tag);
  const mainTag = project.main_character_reference;
  const mainIng = (project.global_ingredients || []).find((i) => typeof i === 'object' && i.tag === mainTag);
  if (!mainTag) E('project.main_character_reference thiếu');
  if (mainTag && !mainIng) E(`project.global_ingredients thiếu bản ghi của nhân vật chính ${mainTag}`);
  // auto mode: character_lock được assemble ghép từ appearance_lock theo nhân vật có mặt trong cảnh
  const autoCharacterLock = Boolean(mainIng?.appearance_lock);
  if (mainIng) {
    if (!mainIng.appearance_lock)
      E(`${mainTag}: thiếu appearance_lock — câu mô tả kiểu tóc + trang phục ĐÚNG NHƯ ảnh reference đã upload (skill Lớp 0)`);
    if (!mainIng.source_file)
      E(`${mainTag}: thiếu source_file — đường dẫn ảnh reference thật đã dùng để viết appearance_lock`);
    else if (project.example !== true && !fs.existsSync(path.resolve(ROOT, mainIng.source_file)))
      W(`${mainTag}: source_file "${mainIng.source_file}" không tồn tại trên máy — kiểm tra lại ảnh đã upload lên Flow`);
    if (!mainIng.render_style) E(`${mainTag}: thiếu render_style (photoreal | stylized-3d | 2d-cartoon) — phải theo ảnh reference`);
    if (mainIng.appearance_lock && /\b(chubby|skin|lips|body proportions|cheeks|weight|plump)\b/i.test(mainIng.appearance_lock))
      W(`${mainTag}: appearance_lock đang tả cơ thể/da/má — chỉ tả kiểu tóc + trang phục (tránh policy block)`);
  }
  const renderStyle = String(mainIng?.render_style || project.render_style || '').toLowerCase();
  if (renderStyle) {
    const styleText = `${project.style_anchor || ''} ${formatLock} ${project.visual_style || ''}`;
    if (renderStyle === 'photoreal' && !/photoreal|live-action/i.test(styleText))
      E('render_style=photoreal nhưng style_anchor / format_lock / visual_style không nói photorealistic live-action');
    if (/3d|stylized|cartoon|anim/.test(renderStyle) && /(?<!no )photorealistic live-action|\breal (toddler|child|boy|girl)\b/i.test(styleText))
      E(`render_style=${renderStyle} nhưng style_anchor / format_lock / visual_style vẫn yêu cầu photorealistic live-action — phong cách phải theo ảnh reference`);
  }
  // mọi nhân vật / đạo cụ khai báo (global hoặc chapter) phải có appearance_lock khi chạy auto mode
  if (autoCharacterLock) {
    const seen = new Set();
    const all = [
      ...(project.global_ingredients || []).map((i) => ['global', i]),
      ...chapters.flatMap((c) => (c.ingredients || []).map((i) => [c.chapter_id, i])),
    ];
    for (const [where, i] of all) {
      if (typeof i !== 'object' || !i.tag || seen.has(`${where}:${i.tag}`)) continue;
      seen.add(`${where}:${i.tag}`);
      if (['character', 'prop'].includes(i.type) && i.scope !== 'global' && !i.appearance_lock && where !== 'global')
        E(`${where}: ingredient ${i.tag} (${i.type}) thiếu appearance_lock — câu mô tả cố định lặp nguyên văn trong mọi cảnh có ${i.tag}`);
    }
  }

  // ---------- chapters ----------
  const chapterById = new Map();
  for (const ch of chapters) {
    if (!ch.chapter_id) {
      E('chapter thiếu chapter_id');
      continue;
    }
    chapterById.set(ch.chapter_id, ch);
    if (!ch.flow_chapter_name) E(`${ch.chapter_id}: thiếu flow_chapter_name`);
    else if (!/^Chương \d+ – .+/.test(ch.flow_chapter_name))
      W(`${ch.chapter_id}: flow_chapter_name nên theo mẫu "Chương <số> – <Tên>" (en dash) — hiện: "${ch.flow_chapter_name}"`);
    if (!Array.isArray(ch.scene_range) || ch.scene_range.length !== 2) E(`${ch.chapter_id}: scene_range phải là [from, to]`);
    const pb = ch.prompt_blocks || {};
    for (const k of ['background_lock', 'continuity_lock', 'lighting_lock']) {
      if (!pb[k]) E(`${ch.chapter_id}: prompt_blocks.${k} thiếu`);
    }
    if (!pb.character_lock && !autoCharacterLock)
      E(`${ch.chapter_id}: prompt_blocks.character_lock thiếu (hoặc khai báo appearance_lock cho ${mainTag || 'nhân vật chính'} để assemble tự ghép)`);
    // chapter manifest đầy đủ
    const chScenes = scenes.filter((s) => s.chapter_id === ch.chapter_id);
    const chSceneNums = chScenes.map((s) => s.scene_number);
    if (!chScenes.length) E(`${ch.chapter_id}: chapter không có cảnh nào trong scenes[]`);
    if (!Array.isArray(ch.scene_numbers)) E(`${ch.chapter_id}: thiếu scene_numbers (danh sách đầy đủ số cảnh — chạy npm run flow:assemble)`);
    else if (JSON.stringify(ch.scene_numbers) !== JSON.stringify(chSceneNums))
      E(`${ch.chapter_id}: scene_numbers ${JSON.stringify(ch.scene_numbers)} ≠ cảnh thực tế ${JSON.stringify(chSceneNums)}`);
    if (ch.scene_count != null && ch.scene_count !== chScenes.length)
      E(`${ch.chapter_id}: scene_count=${ch.scene_count} ≠ ${chScenes.length}`);
    if (!Array.isArray(ch.ingredients) || !ch.ingredients.length) E(`${ch.chapter_id}: thiếu ingredients[]`);
    if (!Array.isArray(ch.recommended_setup) || !ch.recommended_setup.length) W(`${ch.chapter_id}: thiếu recommended_setup`);
    const chIngTags = (ch.ingredients || []).map(ingTag).filter(Boolean);
    if (mainTag && !chIngTags.includes(mainTag) && chScenes.some((s) => (s.ingredients || []).includes(mainTag)))
      E(`${ch.chapter_id}: ingredients không liệt kê ${mainTag} dù có cảnh dùng — danh sách upload của chapter chưa đủ`);
    const usedInCh = new Set(chScenes.flatMap((s) => s.ingredients || []));
    for (const t of chIngTags) {
      if (!usedInCh.has(t)) W(`${ch.chapter_id}: ingredient ${t} được khai báo nhưng không cảnh nào trong chapter dùng`);
    }
    if (Array.isArray(ch.upload_checklist)) {
      for (const t of [...globalTags, ...chIngTags]) if (!ch.upload_checklist.includes(t)) E(`${ch.chapter_id}: upload_checklist thiếu ${t}`);
    } else W(`${ch.chapter_id}: thiếu upload_checklist (chạy npm run flow:assemble)`);
    const setupText = (ch.recommended_setup || []).join(' ');
    for (const t of chIngTags) if (setupText && !setupText.includes(t)) W(`${ch.chapter_id}: recommended_setup không nhắc upload ${t}`);
    if (ch.costume == null) W(`${ch.chapter_id}: thiếu costume (chuỗi trang phục, giống hệt giữa các chapter nếu không đổi)`);
    for (const k of ['camera_family', 'time_of_day']) {
      if (!ch[k]) W(`${ch.chapter_id}: thiếu ${k} (neo chapter)`);
    }
    for (const p of forbiddenIn(pb.continuity_lock))
      E(`${ch.chapter_id}: prompt_blocks.continuity_lock chứa cụm cấm "${p}" — Veo không nhìn thấy clip khác`);
    const chTags = (ch.ingredients || []).map((i) => (typeof i === 'string' ? i : i.tag)).filter(Boolean);
    ch.__tags = new Set([...globalTags, ...chTags]);
    for (const ing of ch.ingredients || []) {
      if (typeof ing === 'object' && ing.scope === 'chapter' && !ing.image_prompt)
        W(`${ch.chapter_id}: ingredient ${ing.tag} thiếu image_prompt`);
    }
  }

  // scene_range coverage: mọi cảnh 1..N phải thuộc đúng 1 chapter, không hở, không trùng
  const covered = new Map();
  for (const ch of chapters) {
    if (!Array.isArray(ch.scene_range)) continue;
    for (let n = ch.scene_range[0]; n <= ch.scene_range[1]; n++) {
      if (covered.has(n)) E(`scene ${n} nằm trong 2 chapter: ${covered.get(n)} và ${ch.chapter_id}`);
      covered.set(n, ch.chapter_id);
    }
  }
  for (let n = 1; n <= scenes.length; n++) if (!covered.has(n)) E(`scene ${n} không thuộc scene_range của chapter nào — danh sách chapter chưa đủ`);
  if (project.chapter_count != null && Number(project.chapter_count) !== chapters.length)
    E(`project.chapter_count=${project.chapter_count} ≠ chapters.length=${chapters.length}`);
  // thứ tự chapter phải tăng dần theo cảnh
  for (let i = 1; i < chapters.length; i++) {
    const a = chapters[i - 1].scene_range, b = chapters[i].scene_range;
    if (Array.isArray(a) && Array.isArray(b) && b[0] !== a[1] + 1)
      E(`${chapters[i].chapter_id}: scene_range bắt đầu ${b[0]} không nối tiếp ${chapters[i - 1].chapter_id} (kết ${a[1]})`);
  }

  // ---------- đối chiếu Brief ↔ JSON (danh sách chapter phải giống nhau ở mọi file) ----------
  if (project.example === true) {
    // file mẫu trong data/g-flow/examples: không có Brief thật
  } else if (project.brief) {
    const briefPath = path.resolve(ROOT, project.brief);
    if (!fs.existsSync(briefPath)) W(`project.brief "${project.brief}" không tồn tại`);
    else {
      const brief = fs.readFileSync(briefPath, 'utf8');
      for (const ch of chapters) {
        if (ch.flow_chapter_name && !brief.includes(ch.flow_chapter_name))
          E(`Brief không nhắc đúng tên chapter "${ch.flow_chapter_name}" — bảng chapter trong Brief mục 4 chưa đủ / lệch tên`);
        if (ch.chapter_id && !new RegExp(`\\|\\s*${ch.chapter_id}\\s*\\|`).test(brief))
          E(`Brief mục 4 thiếu dòng bảng cho ${ch.chapter_id}`);
        if (ch.flow_chapter_name && !new RegExp(`^#{3,5}\\s+${escapeRe(ch.flow_chapter_name)}\\s*$`, 'm').test(brief))
          E(`Brief mục "Ảnh cần tạo trước" thiếu heading riêng "#### ${ch.flow_chapter_name}" (mỗi chapter một heading, kể cả chapter dùng lại ảnh)`);
        for (const t of (ch.ingredients || []).map(ingTag).filter(Boolean)) {
          if (!brief.includes(t)) E(`Brief không nhắc tag ${t} của ${ch.chapter_id}`);
        }
      }
      const briefChapterRows = (brief.match(/^\|\s*ch\d+\s*\|/gm) || []).length;
      if (briefChapterRows !== chapters.length)
        E(`Brief có ${briefChapterRows} dòng chapter trong bảng mục 4 nhưng JSON có ${chapters.length} chapter`);
      const m = brief.match(/tạo\s+(\d+)\s+chapter/i);
      if (m && Number(m[1]) !== chapters.length) E(`Brief checklist ghi "tạo ${m[1]} chapter" nhưng JSON có ${chapters.length} chapter`);
      if (mainIng?.source_file && !brief.includes(path.basename(mainIng.source_file)))
        W(`Brief không nhắc file ảnh reference "${path.basename(mainIng.source_file)}" của ${mainTag}`);
    }
  } else W('project.brief thiếu — không đối chiếu được danh sách chapter với Brief');

  // ---------- scenes ----------
  const totalScenes = Number(project.total_scenes);
  if (totalScenes && totalScenes !== scenes.length) E(`project.total_scenes=${totalScenes} nhưng scenes.length=${scenes.length}`);

  const audioSec = parseDuration(project.audio_duration);
  let cutOnActionCount = 0;
  let strongMoveStreak = 0;
  let prev = null;
  let prevCh = null;

  scenes.forEach((s, idx) => {
    const n = s.scene_number ?? idx + 1;
    const id = `scene ${n}`;
    if (s.scene_number !== idx + 1) E(`${id}: scene_number phải là ${idx + 1}`);

    const ch = chapterById.get(s.chapter_id);
    if (!ch) E(`${id}: chapter_id "${s.chapter_id}" không tồn tại`);
    else {
      if (Array.isArray(ch.scene_range) && (n < ch.scene_range[0] || n > ch.scene_range[1]))
        E(`${id}: ngoài scene_range của ${ch.chapter_id} ${JSON.stringify(ch.scene_range)}`);
      if (s.flow_chapter_name !== ch.flow_chapter_name)
        E(`${id}: flow_chapter_name "${s.flow_chapter_name}" ≠ chapter "${ch.flow_chapter_name}"`);
    }

    const isChapterStart = !prev || prev.chapter_id !== s.chapter_id;
    const isLast = idx === scenes.length - 1;

    // required continuity fields
    for (const k of ['start_state', 'end_state', 'scene_action', 'camera_move', 'prompt']) {
      if (!s[k]) E(`${id}: thiếu ${k}`);
    }
    if (!s.transition_in) W(`${id}: thiếu transition_in (hold | cut-on-action | exit-enter | match-pose | look-off | establishing)`);
    else if (!TRANSITIONS.includes(s.transition_in)) E(`${id}: transition_in "${s.transition_in}" không hợp lệ`);
    if (s.transition_in === 'cut-on-action') cutOnActionCount++;

    // duration / timecode
    if (!isLast && Number(s.durationSeconds) !== 8) E(`${id}: durationSeconds phải = 8 (Veo 3.1), hiện ${s.durationSeconds}`);
    if (isLast && Number(s.durationSeconds) > 8) E(`${id}: durationSeconds > 8`);
    const tc = parseTimecode(s.timecode);
    if (!tc) E(`${id}: timecode "${s.timecode}" không đúng mẫu mm:ss–mm:ss`);
    else {
      if (tc.end - tc.start !== Number(s.durationSeconds)) E(`${id}: timecode dài ${tc.end - tc.start}s ≠ durationSeconds ${s.durationSeconds}`);
      if (idx === 0 && tc.start !== 0) E(`${id}: timecode phải bắt đầu 00:00`);
      if (prev && prev.__tc && tc.start !== prev.__tc.end) E(`${id}: timecode bắt đầu ${s.timecode} không nối tiếp cảnh trước (${prev.timecode})`);
      if (isLast && audioSec != null && tc.end !== audioSec) W(`${id}: timecode kết ${tc.end}s ≠ audio_duration ${audioSec}s`);
      s.__tc = tc;
    }

    // forbidden phrases
    for (const p of forbiddenIn(s.prompt)) E(`${id}: prompt chứa cụm cấm "${p}"`);
    for (const field of ['start_state', 'end_state', 'scene_action']) {
      for (const p of forbiddenIn(s[field])) E(`${id}: ${field} chứa cụm cấm "${p}"`);
      if (/\bsame (spot|place|position)\b|where (he|she) (was|stood)/i.test(s[field] || ''))
        W(`${id}: ${field} dùng "same spot/place" — hãy lặp lại vị trí thật (screen-left/center/right + mốc bối cảnh)`);
    }

    // prompt must contain verbatim blocks
    const prompt = String(s.prompt || '');
    const mustContain = [];
    if (project.style_anchor) mustContain.push(['project.style_anchor', project.style_anchor]);
    if (formatLock) mustContain.push(['format_lock', formatLock]);
    for (const k of ['light_direction_anchor', 'palette_anchor']) if (project[k]) mustContain.push([`project.${k}`, project[k]]);
    if (ch?.prompt_blocks) {
      for (const [k, v] of Object.entries(ch.prompt_blocks)) if (v) mustContain.push([`${ch.chapter_id}.prompt_blocks.${k}`, v]);
    }
    for (const [label, text] of mustContain) {
      if (!prompt.includes(String(text).trim())) E(`${id}: prompt không chứa nguyên văn ${label}`);
    }
    if (s.start_state && !prompt.includes(normalizeSpaces(s.start_state))) E(`${id}: prompt không chứa nguyên văn start_state`);
    if (s.end_state && !prompt.includes(normalizeSpaces(s.end_state))) E(`${id}: prompt không chứa nguyên văn end_state`);
    if (s.scene_action && !prompt.includes(normalizeSpaces(s.scene_action))) E(`${id}: prompt không chứa nguyên văn scene_action`);
    if (s.camera_move && !prompt.includes(normalizeSpaces(s.camera_move))) E(`${id}: prompt không chứa nguyên văn camera_move`);
    if (!/opens on exactly this first frame|starting state \(first frame\)/i.test(prompt))
      W(`${id}: prompt nên có câu "The clip opens on exactly this first frame:"`);
    if (!/ends on exactly this final frame|ending state \(final frame\)/i.test(prompt))
      W(`${id}: prompt nên có câu "The clip ends on exactly this final frame:"`);

    // end_state quality
    if (s.end_state) {
      if (!isLast && !/holds? (this|the) (pose|look|position)|frozen for the final second|only the empty .{0,40} (is )?visible/i.test(s.end_state))
        E(`${id}: end_state phải kết bằng "...and holds this pose, nearly still, for the final second."`);
      if (isLast && !/completely still|final two seconds/i.test(s.end_state + ' ' + s.scene_action))
        W(`${id}: cảnh cuối nên có "keep the final two seconds completely still"`);
      if (!/facing|faces|looking toward|looks toward|turned toward|back to (the )?camera|exits? the frame|only the empty/i.test(s.end_state))
        W(`${id}: end_state không ghi hướng mặt (facing camera / screen-right / ...)`);
      if (!/screen-left|screen-right|center|centre|left edge|right edge/i.test(s.end_state))
        W(`${id}: end_state không ghi vị trí trong khung (screen-left / center / screen-right)`);
    }
    if (s.start_state && !/facing|faces|looking|only the empty|no character|walks into the frame|enters/i.test(s.start_state))
      W(`${id}: start_state không ghi hướng mặt`);

    // Lớp 0: nhân vật / đạo cụ có mặt trong cảnh phải được khoá bằng appearance_lock nguyên văn
    const stateTags = tagsIn([s.start_state, s.scene_action, s.end_state].join(' '));
    const lookup = (tag) => {
      const fromCh = (ch?.ingredients || []).find((i) => ingTag(i) === tag);
      const fromGlobal = (project.global_ingredients || []).find((i) => ingTag(i) === tag);
      return { ...(typeof fromGlobal === 'object' ? fromGlobal : {}), ...(typeof fromCh === 'object' ? fromCh : {}) };
    };
    const livingInScene = [];
    for (const t of stateTags) {
      const info = lookup(t);
      if (info.type === 'character') livingInScene.push(t);
      if (['character', 'prop'].includes(info.type) && info.appearance_lock && !prompt.includes(normalizeSpaces(info.appearance_lock)))
        E(`${id}: ${t} có mặt trong cảnh nhưng prompt không chứa nguyên văn appearance_lock của ${t}`);
    }
    if (livingInScene.length && !/Only @[A-Za-z0-9_@, and]+ may appear as (a |the )?living character/i.test(prompt))
      E(`${id}: prompt thiếu câu "Only @... may appear as living character(s)"`);
    if (!livingInScene.length && !/No people or animals appear in this clip/i.test(prompt))
      W(`${id}: cảnh không có nhân vật nên có câu "No people or animals appear in this clip."`);
    if (mainTag && stateTags.includes(mainTag) && !/approved uploaded character reference for @/i.test(prompt))
      E(`${id}: prompt thiếu câu "Use the approved uploaded character reference for ${mainTag}"`);
    if (renderStyle && /3d|stylized|anim/.test(renderStyle) && /\b3d render\b|\bstylized\b|\banimated\b/i.test(s.negativePrompt || ''))
      E(`${id}: negativePrompt cấm "3D render / stylized / animated" trong khi ảnh reference là ${renderStyle} — nhân vật sẽ không khớp reference`);
    if (renderStyle === 'photoreal' && !/cartoon|3d render/i.test(s.negativePrompt || ''))
      W(`${id}: negativePrompt nên có "cartoon, 3D render" khi reference là ảnh thật`);

    // tags vs ingredients
    const promptTags = tagsIn(prompt);
    const ing = Array.isArray(s.ingredients) ? s.ingredients : [];
    for (const t of promptTags) {
      const info = lookup(t);
      if (info.type === 'character' && !stateTags.includes(t))
        W(`${id}: ${t} được tag trong prompt nhưng không xuất hiện trong start_state / scene_action / end_state — Veo có thể tự chèn nhân vật này`);
    }
    for (const t of promptTags) if (!ing.includes(t)) E(`${id}: tag ${t} có trong prompt nhưng không có trong ingredients`);
    for (const t of ing) {
      if (!promptTags.includes(t)) E(`${id}: ingredient ${t} không được gọi trong prompt`);
      if (ch && !ch.__tags.has(t)) E(`${id}: ingredient ${t} không thuộc global_ingredients hay ${ch.chapter_id}.ingredients`);
    }

    // ---------- handoff with previous scene ----------
    if (prev) {
      const prevEnd = normalizeState(prev.end_state);
      const curStart = normalizeState(s.start_state);
      if (!isChapterStart) {
        if (prevEnd && curStart && prevEnd !== curStart) {
          if (s.transition_in === 'exit-enter' || s.transition_in === 'look-off') {
            // allowed to differ, but previous end must show exit / look-off
            if (s.transition_in === 'exit-enter' && !/exits? the frame|out of (the )?frame|only the empty/i.test(prev.end_state || ''))
              E(`${id}: transition_in=exit-enter nhưng end_state cảnh ${prev.scene_number} không cho nhân vật ra khỏi khung`);
            if (s.transition_in === 'look-off' && !/looks? toward screen-(right|left)|past the edge/i.test(prev.end_state || ''))
              E(`${id}: transition_in=look-off nhưng end_state cảnh ${prev.scene_number} không có cái nhìn ra ngoài khung`);
          } else {
            E(`${id}: start_state ≠ end_state của cảnh ${prev.scene_number} (phải chép nguyên văn, bỏ câu "holds this pose")`);
          }
        }
      } else {
        // chapter bridge
        if (s.transition_in && !BRIDGE_TRANSITIONS.includes(s.transition_in))
          W(`${id}: mở chapter mới nên dùng transition_in exit-enter | match-pose | establishing (hiện ${s.transition_in})`);
        if (prev.end_state && !/screen-right|exits? the frame|toward the (door|gate|exit)|points? (toward|to)/i.test(prev.end_state))
          W(`scene ${prev.scene_number}: cảnh cuối chapter nên kết với nhân vật hướng/đi/chỉ về screen-right (bridge_out)`);
        if (prevCh && ch && prevCh.costume && ch.costume && prevCh.costume !== ch.costume && prevCh.setting !== ch.setting)
          W(`${id}: đổi cả bối cảnh lẫn trang phục cùng lúc khi sang ${ch.chapter_id} — quy tắc "đổi một biến", cần cảnh cầu nối`);
        if (prevCh && ch && prevCh.time_of_day && ch.time_of_day) {
          const order = ['dawn', 'morning', 'late morning', 'noon', 'midday', 'afternoon', 'late afternoon', 'golden hour', 'sunset', 'dusk', 'evening', 'night'];
          const a = order.findIndex((k) => String(prevCh.time_of_day).toLowerCase().includes(k));
          const b = order.findIndex((k) => String(ch.time_of_day).toLowerCase().includes(k));
          if (a >= 0 && b >= 0 && b < a) W(`${id}: time_of_day lùi từ "${prevCh.time_of_day}" về "${ch.time_of_day}"`);
        }
        if (s.shotSize && prev.shotSize && s.shotSize === prev.shotSize && s.camera_move === prev.camera_move)
          W(`${id}: cảnh mở chapter cùng shotSize + camera_move với cảnh cuối chapter trước`);
      }

      // props handoff (tags in states)
      const prevProps = tagsIn(prev.end_state);
      const curProps = tagsIn(s.start_state);
      if (!isChapterStart || !['exit-enter', 'establishing'].includes(s.transition_in || '')) {
        for (const t of curProps) if (!prevProps.includes(t) && !isChapterStart) E(`${id}: ${t} có trong start_state nhưng không có trong end_state cảnh ${prev.scene_number}`);
      }

      // cut grammar
      const a = shotLevel(prev.shotSize, 'last');
      const b = shotLevel(s.shotSize, 'first');
      if (a != null && b != null) {
        const diff = Math.abs(a - b);
        if (diff >= 3) W(`${id}: nhảy shot size ${diff} nấc ("${prev.shotSize}" → "${s.shotSize}") — tối đa 2`);
        if (diff === 0 && s.transition_in !== 'match-pose' && angleLevel(prev.cameraLensAndAngle) === angleLevel(s.cameraLensAndAngle))
          W(`${id}: cùng shot size và cùng góc với cảnh trước ("${s.shotSize}") — jump cut`);
      }
      if (Math.abs(angleLevel(prev.cameraLensAndAngle) - angleLevel(s.cameraLensAndAngle)) > 1)
        W(`${id}: góc máy nhảy từ "${prev.cameraLensAndAngle}" sang "${s.cameraLensAndAngle}" (low ↔ high) — tối đa 1 nấc`);
      if (prev.shotSize && s.shotSize && prev.shotSize === s.shotSize && prev.cameraDirection && prev.cameraDirection === s.cameraDirection)
        W(`${id}: lặp y hệt shotSize + cameraDirection của cảnh trước`);

      const la = lensMm(prev.cameraLensAndAngle);
      const lb = lensMm(s.cameraLensAndAngle);
      if (la && lb && Math.abs(la - lb) > 25) W(`${id}: đổi tiêu cự ${la}mm → ${lb}mm quá mạnh; giữ camera_family ± 1 nấc`);

      if (STRONG_MOVES.test(prev.camera_move || prev.cameraDirection || '') && STRONG_MOVES.test(s.camera_move || s.cameraDirection || ''))
        W(`${id}: hai cảnh liền nhau đều máy chuyển động mạnh — sau orbit/tracking nên là static hoặc push-in chậm`);

      // energy
      if (Number.isFinite(+prev.energy) && Number.isFinite(+s.energy)) {
        const d = +s.energy - +prev.energy;
        const intoChorus = /chorus/i.test(s.song_section || '') && !/chorus/i.test(prev.song_section || '');
        const intoOutro = /outro/i.test(s.song_section || '') && !/outro/i.test(prev.song_section || '');
        if (Math.abs(d) > (intoChorus || intoOutro ? 2 : 1)) W(`${id}: energy nhảy ${prev.energy} → ${s.energy} (tối đa 1 nấc, ±2 khi vào Chorus / Outro)`);
      }
    } else if (s.transition_in && s.transition_in !== 'establishing' && s.transition_in !== 'hold') {
      W(`${id}: cảnh 1 nên là establishing hoặc hold`);
    }

    if (STRONG_MOVES.test(s.camera_move || s.cameraDirection || '')) strongMoveStreak++;
    else strongMoveStreak = 0;
    if (strongMoveStreak >= 3) W(`${id}: 3 cảnh liền nhau đều máy chuyển động mạnh`);

    if (!s.energy) W(`${id}: thiếu energy (1–5)`);
    if (!s.negativePrompt) W(`${id}: thiếu negativePrompt`);
    if (s.lyrics == null) W(`${id}: thiếu lyrics`);

    prev = s;
    prevCh = ch || prevCh;
  });

  if (scenes.length && cutOnActionCount / scenes.length > 0.3)
    W(`cut-on-action chiếm ${cutOnActionCount}/${scenes.length} cảnh (> 30%)`);

  // style anchor identical: already checked via includes. Check character_lock identical across chapter scenes is implied by includes.

  return { errors, warnings };
}

function normalizeSpaces(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Trả về các cụm cấm có trong text, bỏ cụm là con của cụm dài hơn đã khớp. */
function forbiddenIn(text) {
  let lower = String(text || '').toLowerCase();
  const found = [];
  // dài trước, ngắn sau; xoá vùng đã khớp để cụm ngắn không báo trùng ("the previous numbered clip")
  for (const p of [...FORBIDDEN_PHRASES].sort((a, b) => b.length - a.length)) {
    if (lower.includes(p)) {
      found.push(p);
      lower = lower.split(p).join(' '.repeat(p.length));
    }
  }
  return found;
}

// ---------- main ----------
let targets = files.length
  ? files.map((f) => path.resolve(process.cwd(), f))
  : fs
      .readdirSync(path.join(ROOT, 'data', 'g-flow'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(ROOT, 'data', 'g-flow', f));

let totalErrors = 0;
let totalWarnings = 0;
for (const file of targets) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const { errors, warnings } = validateFile(file);
  totalErrors += errors.length;
  totalWarnings += warnings.length;
  const status = errors.length ? '❌' : warnings.length ? '⚠️ ' : '✅';
  console.log(`\n${status} ${rel}  (${errors.length} error, ${warnings.length} warning)`);
  for (const e of errors) console.log(`   ERROR  ${e}`);
  for (const w of warnings) console.log(`   warn   ${w}`);
}

console.log(`\nTổng: ${totalErrors} error, ${totalWarnings} warning${strict ? ' (--strict)' : ''}`);
process.exit(totalErrors || (strict && totalWarnings) ? 1 : 0);
