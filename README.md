# BooCalc 👻

**A friendly cemetery where every calculation summons a ghost.**

BooCalc is a functional calculator with tombstone number keys and twenty illustrated
kawaii ghost characters. Each key releases its own ghost; arithmetic operators
turn the characters into an expressive little cast.

Created by Rafael Enrique Arancibia Macías for **Kiroween 2026 — Costume Contest**.

[Hosted application](https://boo-calculadora-fantasmas.rxfxdxlx.chatgpt.site)

The hosted application's audience is managed separately from this repository.
The standalone build below works locally without an account or internet access.

## Try it

[Download the standalone calculator](https://github.com/Dxlxrxfx/boocalc/raw/refs/heads/main/dist/index.html) and open it in a modern browser. Alternatively, download this repository and open **`dist/index.html`**.
It contains the application, styles and transparent sprite atlas in one file.
There are no external packages, fonts, services or API keys.

To work from source, use Node.js 18 or later:

```sh
npm test
npm run build
```

## Six reactions

| Operator | Reaction |
| --- | --- |
| `+` | Ghosts bounce excitedly. |
| `−` | Ghosts cry little tears. |
| `×` | Two ghosts move together and hug. |
| `÷` | Ghosts gather into small groups. |
| `%` | A central ghost asks: “Were you expecting me to do something?” |
| `=` | Ghosts dance as the result appears. |

Number keys play musical “booo” notes: 1 C, 2 D, 3 E, 4 F, 5 G, 6 A,
7 B, then 8 C, 9 D and 0 E in the next octave. Notes keep the same duration.

The original Spanish percent joke is **“Esperabas que hiciera algo?”**.
Percent still performs a real calculation.

The cemetery uses weathered stone, moss, muted lavender, ivory mist and a smiling
moon. The characters are friendly. The same key consistently summons the same
character, with a different face, accessory or silhouette for every key.
Each illustrated stone and ghost uses its own complete source rectangle and
isolation path. The decimal stone shows a comma in Spanish and a point in English;
keyboard dot and comma input are accepted, and results follow the selected locale.

## Calculator behavior

- Standard precedence: `2 + 3 × 4 = 14`.
- Percent divides the current operand by 100: `50% = 0.5` and `200 + 10% = 200.1`.
- Results use twelve significant digits; `0.1 + 0.2` displays `0.3`.
- Division by zero and out-of-range results produce readable errors.
- A digit after a result starts a new calculation; an operator continues from it.
- Replacing a pending operator, changing sign and backspace are supported.
- An unfinished trailing operator is ignored on equals.

Keyboard: digits, dot or comma, `+ - * /`, `%`, `Enter` or `=`, `Backspace`, `Escape`.
The UI supports Spanish and English. Motion can be disabled; the operating
system's reduced-motion preference is honored. Each calculator key plays a soft, synthesized “booo”. Sound can be muted
independently of motion; the mute preference is remembered on the device.
The sound starts only after a key press, with no audio downloads or microphone.

## Kiro development evidence

The repository includes `.kiro/` at its root:

- `.kiro/specs/boocalc/requirements.md`
- `.kiro/specs/boocalc/design.md`
- `.kiro/specs/boocalc/tasks.md`
- `.kiro/steering/product.md`
- `.kiro/agents/boocalc.json`

Kiro CLI produced the specifications and initial implementation: calculator
engine, original ghost SVGs, motion system, UI, styles, build script and tests.
ChatGPT prepared the brief from Rafael's concept, reviewed and refined the code,
and ran the test and browser checks. See [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md)
for the contribution split and observed validation. The agent configuration
retains its original development-workspace paths as provenance.

## Validation

- **51 passing arithmetic and regression tests.**
- Twenty distinct illustrated ghost frames and twenty matching button frames.
- Browser checks of the six reaction scenes, keyboard input, language switching,
  motion toggle and help.
- Browser iframe checks at 390 × 844 and 375 × 667 showed all twenty keys and controls within their bounds.
- Standalone JavaScript is syntax-checked during the build.

Physical-device touch and real assistive-technology testing remain to be done.
The app provides a playful general-purpose calculator with twelve-digit precision.

## Source map

| File | Purpose |
| --- | --- |
| `src/engine.js` | Pure arithmetic and input state. |
| `src/ghosts.js`, `src/sprite-frames.js` | Complete bitmap frames and isolation paths. |
| `src/assets/boocalc-sprites.webp`, `src/assets/boocalc-supplement.webp` | Original art, individual operator ghosts and decimal-point stone. |
| `src/animator.js` | Key-to-display flight and reaction scenes. |
| `src/sound.js` | Original quiet “booo” synthesis and bounded playback. |
| `src/ui.js` | Input, display, language and controls. |
| `src/index.html`, `src/style.css` | Layout and cemetery artwork. |
| `tests/` | Arithmetic and regression checks. |
| `build.mjs` | Self-contained HTML build. |
| `submission/` | Contest description and demo plan. |

## License

MIT. Copyright © 2026 Rafael Enrique Arancibia Macías. See [LICENSE](LICENSE).

## Illustrated sprite integration

The current version uses the user-approved AI-generated BooCalc artwork. A
supplement provides individual ×/÷ ghosts and a decimal-point stone. ChatGPT
integrated these images; Kiro authored the initial SVG character system.

Exact rectangles and native SVG clipping isolate the bitmap artwork, retain
complete tails, broom and moss, and remove neighboring fragments. Frames have
transparent display padding. Source images are not rewritten. The normal build
embeds both images for offline use. See [ASSETS.md](ASSETS.md).

The ghost flight lasts 1.2 seconds with a gentle sway. Reactions run at a slower
pace. Audio is independent of motion. Each note lasts 0.58 seconds; higher notes
are synthesized directly instead of speeding up a recording.

Latest validation: all 51 arithmetic tests passed, 41 active frame masks retain
their measured source silhouettes with no foreign solid pixels, and ten generated
notes match their intended frequencies. Full browser verification of this latest
change was blocked by the browser's URL policy. The earlier browser checks above
predate the frame correction. See [ASSET_VALIDATION.md](ASSET_VALIDATION.md).
