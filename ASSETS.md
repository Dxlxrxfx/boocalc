# BooCalc illustrated assets

`src/assets/boocalc-sprites.webp` is a transparent 1586 × 992 pixel atlas,
encoded from the BooCalc-specific PNG generated with OpenAI image generation
at Rafael Arancibia's request. The direction was friendly kawaii ghosts and
engraved cemetery stones with moss, muted lavender and ivory. It is AI-generated
artwork, not a third-party stock illustration or Kiro-generated SVG.

The intact image contains eight columns and five rows. Read each row as four
button/ghost pairs; columns 1, 3, 5, 7 are buttons, and the next column is each
button's ghost. Rows follow the keypad:

| Row | Keys in pair order |
| --- | --- |
| 1 | AC, ±, %, ÷ |
| 2 | 7, 8, 9, × |
| 3 | 4, 5, 6, − |
| 4 | 1, 2, 3, + |
| 5 | Backspace, 0, comma, = |

`src/ghosts.js` contains the frame map. The CSS uses percentage background
positions and an eight-by-five background size to isolate frames without
modifying the artwork. The animation layer moves those frames from the pressed
key and runs the existing bounce, tears, hug, groups, joke and dance scenes.

The comma is engraved into the decimal-key image in both UI languages. English
results still use a decimal point, and both dot/comma keyboard input work.
Button names and results remain HTML text for assistive technology; image frames
are decorative. Motion preferences are handled by the existing animator.

The build embeds the atlas as a WebP data URL so `dist/index.html` requires no
external image files. Source development loads the WebP from `src/assets/`.

## Sound

`src/sound.js` synthesizes an original short “booo” in the browser from
harmonics and a breathy onset. It uses no voice recording, stock audio, network
service or microphone. The same source is cached and gently pitch-shifted
between keys. At most two voices remain active, with short fades for replacements.
Playback starts from calculator input and can be disabled with the Sound control.
