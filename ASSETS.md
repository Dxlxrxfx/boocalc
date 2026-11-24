# BooCalc illustrated assets

The original `src/assets/boocalc-sprites.webp` is the 1586 × 992 transparent
image generated specifically for BooCalc with OpenAI image generation, at Rafael
Arancibia's request. The source artwork is retained unchanged. Its original
8 × 5 packing is **not** used as a regular grid by the current renderer.

`src/assets/boocalc-supplement.webp` is a second, 2172 × 724 transparent generated
image containing a single lavender multiplication ghost, a single blue division
ghost, and a matching decimal-point stone. It replaces the two fused character
groups in runtime use and supplies the English decimal key.

## Complete frames and isolation

`src/sprite-frames.js` records exact source rectangles and vector isolation paths.
`src/ghosts.js` displays the existing bitmap through those paths inside a square
SVG viewport with transparent space. The SVG is a clipping container for the
illustrated raster image; it is not a replacement drawing of the character.

This retains the complete broom, tails and moss, including portions crossing
the original grid lines. Per-asset isolation excludes neighboring drawings and
faint connecting edge pixels. The former global percentage clip is removed.
Every rendered instance has a unique clipping ID, including repeated ghosts.
The header also uses a square container.

There are **41 active frames**: twenty buttons, twenty individual ghost variants,
and an English point variant for the decimal button. The original comma remains
in Spanish. Legacy fused ×/÷ art remains in the original source image but is no
longer selected by the renderer.

`tools/build-sprite-frames.py` regenerates the metadata from fixed ownership of
source alpha components. It uses Pillow, NumPy and SciPy only for optional asset
authoring. The committed metadata and normal Node build require no Python or
third-party browser runtime dependencies. `src/assets/frame-validation.json`
contains the per-frame geometry checks.

The six unused legacy side-decoration SVGs were removed from the HTML. The main
cemetery background, trees, flowers and smiling moon remain. Small tear effects
have a shaded body and highlight to fit the painted characters more closely.

## Musical sound

`src/sound.js` synthesizes an original short “booo” with rounded vowel harmonics,
a breathy onset and a very small vibrato. It uses no recording, stock sound,
network service or microphone. Number keys play:

| Key | Solfège | Pitch | Frequency, Hz |
| --- | --- | --- | --- |
| 1 | Do | C4 | 261.63 |
| 2 | Re | D4 | 293.66 |
| 3 | Mi | E4 | 329.63 |
| 4 | Fa | F4 | 349.23 |
| 5 | Sol | G4 | 392.00 |
| 6 | La | A4 | 440.00 |
| 7 | Si | B4 | 493.88 |
| 8 | Do | C5 | 523.25 |
| 9 | Re | D5 | 587.33 |
| 0 | Mi | E5 | 659.26 |

Other calculator keys use C4. A buffer is synthesized and cached separately for
each note, so higher pitches keep the same **0.58-second** duration. Audio is
quiet, starts from a key gesture, has bounded overlapping voices with short
replacement fades, and has a persisted mute control independent of motion.
The control's track now derives its color directly from `aria-pressed` on reload.

The standalone build embeds both image sources and all JavaScript in one HTML
file for offline use. See `ASSET_VALIDATION.md` for checks and verification limits.
