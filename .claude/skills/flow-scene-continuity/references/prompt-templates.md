# Prompt templates (English, copy verbatim)

Thay `<...>` bằng nội dung thật. Mọi khối "lock" được **lặp nguyên văn** ở mọi cảnh trong phạm vi của nó (global hoặc chapter).

## 1. Global anchors (`project.*`) — in every scene of every chapter

```text
style_anchor:
Shot on a cinematic 35mm lens look with shallow depth of field, soft warm color grade with gentle teal shadows, subtle fine film grain, soft natural contrast, clean highlights, no HDR glow. The entire music video shares this exact same photographic look in every clip.

light_direction_anchor:
The main key light always comes from screen-left and slightly above, so shadows fall gently toward screen-right in every clip of the whole video. Only the color temperature and brightness of the light may change between chapters, never its direction.

palette_anchor:
Color palette for the whole video: <main color 1>, <main color 2>, <main color 3>, with <accent color> as the single accent. Every location, costume and prop stays inside this palette.

screen_direction:
Story travel direction is left-to-right. The character faces or moves toward screen-right whenever traveling. Never cross the 180-degree line relative to the main character; never mirror the layout.

camera_height_anchor:
Camera stays at child eye level, about 1 meter above the ground, unless the camera move explicitly says low angle or high angle.

anchor_props (one fixed sentence per prop):
@<PropTag> is one fixed prop: <color, size, material, one identifying detail>. It looks identical in every clip.
```

## 2. Chapter locks (`chapters[].prompt_blocks`) — identical in every scene of the chapter

```text
character_lock:
Use the approved uploaded character reference for @NhatMinh. Keep his face and hairstyle exactly as in the reference image. Chapter costume, identical in every clip of this chapter: <top>, <bottom>, <shoes>, <accessory>. Do not redesign, recolor or restyle the costume. Only @NhatMinh <and @X> may appear as living characters.

background_lock:
@<Background> is the fixed approved background reference of <Chương N – Tên>. It is the exact same <location>: screen-left <object A>, rear-center <object B>, screen-right <object C>, <floor/ground>, <walls/sky>. Preserve the exact layout, positions, scale, colors and materials. Do not mirror, rotate, redesign or randomly decorate the location. Do not add extra doors, windows, furniture, people or animals. Keep <A> on screen-left and <C> on screen-right. Never swap left and right.

continuity_lock (self-contained — no reference to other clips):
This clip is one shot inside a longer music video. Everything needed is described in this prompt. Keep the camera at child eye level, keep the character scale, light direction, weather, season and time of day exactly as described here. Only the props named in the first-frame description exist in the frame; do not invent extra props, people or animals. Each prop stays exactly where the first-frame description places it unless the scene action explicitly moves it. No teleporting, no sudden costume or hairstyle change, no new location interpretation.

lighting_lock:
Lighting for this chapter: <warm golden late-afternoon sunlight / soft bright morning daylight / warm indoor lamp light>, key light from screen-left and slightly above, soft shadows toward screen-right, <color temperature>, faces always clearly lit. Keep identical brightness, light direction, white balance and shadow softness in every clip of this chapter.

camera_family (inside continuity_lock or as its own sentence):
Camera family for this chapter: <35mm> lens look, child eye level; only <28mm> or <50mm> may be used when the camera move says so.
```

## 3. Format lock (global, identical everywhere)

```text
Create one continuous 8-second video in 16:9 landscape format. Photorealistic cinematic live-action family-friendly children's music video: realistic fabrics and lighting, natural gentle movement, soft cinematic depth of field, bright clean colors. Use one camera angle or one smooth camera movement only. No abrupt cuts, montage or internal scene transition. Keep the final two seconds visually stable. Do not generate text in the image. No subtitles, captions, dialogue, speech, logo or watermark.
```

## 4. Scene body (the only part that changes per scene)

```text
The clip opens on exactly this first frame: <start_state>
Scene action: <1–3 sentences, ONE main action, tagged characters, tempo words: slow / on the beat / bouncy>
Camera: <ONE move, with direction and lens>, e.g. "Slow dolly push-in at child eye level, 35mm, from medium-wide to medium."
The clip ends on exactly this final frame: <end_state> and holds this pose, nearly still, for the final second.
The location must remain recognizable as the exact same @<Background> reference from the first frame to the last frame. Do not generate a new location interpretation.
```

### `start_state` / `end_state` sentence pattern

```text
@NhatMinh <stands|sits|kneels> at <screen-left|center|screen-right> of the frame, <near|about X meters from> <landmark from background_lock>, facing <camera|screen-right|screen-left|three-quarter toward camera>, <left hand ...>, <right hand ...>, <head/eyes ...>, <expression>. <Prop @X> is <in his right hand | on the ground at his feet on screen-left | on the table at rear-center>. <Other visible prop positions>.
```

Rules: always name facing direction; always list every prop in frame with a position; never use "the same spot" or "where he was" — repeat the actual position words.

## 5. Transition sentences (append to `scene_action` as needed)

```text
hold:
He starts moving only after about half a second, from exactly the first-frame pose.

cut-on-action (end of scene N):
The clip ends mid-gesture with <his right hand raised to shoulder height, elbow bent>, frozen for the final second.
cut-on-action (start of scene N+1):
In the first second he completes the gesture: <his right hand continues up above his head>.

exit-enter (end of scene N):
He walks toward screen-right and fully exits the frame; for the final second only the empty location is visible.
exit-enter (start of scene N+1):
For the first second only the empty location is visible; then @NhatMinh walks into the frame from the left edge, wearing <costume>, carrying <prop> in his <hand>.

match-pose:
He holds exactly this pose: <pose>; the shot is framed as <shot size, angle>.

look-off (end of N):
He turns his head and looks toward screen-right, past the edge of the frame, eyes wide with curiosity, and holds this look for the final second.
look-off (N+1, the thing he sees):
No character is visible. <Object/animal> sits at <position> of <location>, lit from screen-left. The camera <slow push-in>.
```

## 6. Negative prompt (base, add topic-specific terms)

```text
cartoon, plastic skin, uncanny face, changed identity, different child, adult-looking child, extra fingers, deformed hands, duplicate character, mirrored layout, swapped left and right, changed costume, changed hairstyle, new furniture, extra people, extra animals, teleporting props, random text, subtitles, logo, watermark, black bars, portrait framing, camera shake, flicker, abrupt cut, montage, zoom transition, lens flare
```

## 7. Full example (scene 7 of a beach chapter)

```text
<character_lock> <background_lock> <continuity_lock> <lighting_lock> <style_anchor> <light_direction_anchor> <palette_anchor> <format_lock>
The clip opens on exactly this first frame: @NhatMinh kneels at the center of the frame on the dry sand, about two meters in front of the striped umbrella at rear-center, facing three-quarter toward camera, both hands resting on the rim of the red bucket @RedBucket which sits on the sand directly in front of his knees, the small yellow shovel @YellowShovel lying on the sand on screen-right of the bucket, calm focused expression.
Scene action: On the beat @NhatMinh scoops sand twice with @YellowShovel into @RedBucket, pats the top flat with both palms, then lifts his head and smiles proudly toward the camera.
Camera: Slow dolly push-in at child eye level, 35mm, from medium-wide to medium, no other movement.
The clip ends on exactly this final frame: @NhatMinh kneels at the center of the frame on the dry sand in front of the striped umbrella at rear-center, facing camera, both palms resting flat on top of the sand-filled @RedBucket in front of his knees, @YellowShovel lying on the sand on screen-right of the bucket, big proud smile, and holds this pose, nearly still, for the final second.
The location must remain recognizable as the exact same @Beach reference from the first frame to the last frame. Do not generate a new location interpretation.
```
