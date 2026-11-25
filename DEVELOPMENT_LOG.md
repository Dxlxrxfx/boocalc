# BooCalc — Development Log

## Provenance

The project brief (`PROJECT_BRIEF.md`) was prepared by ChatGPT from the user's
creative direction prior to this Kiro session. This log records only work
performed by Kiro in the current session.

## Session record

### Spec phase

Wrote `.kiro/steering/product.md` — concise product steering with palette,
ghost system, six emotion scenes, keypad layout, and non-negotiables.

Wrote `.kiro/specs/boocalc/requirements.md` — 10 requirement groups covering
the calculator engine, input handling, display, ghost system, emotion scenes,
visual design, accessibility, controls, responsive layout, and build/delivery.

Wrote `.kiro/specs/boocalc/design.md` — technical architecture: state machine
design, precedence evaluator algorithm, ghost SVG system, animator approach,
UI wiring, CSS layout strategy, and build approach.

Wrote `.kiro/specs/boocalc/tasks.md` — phased task list.

### Implementation phase

**`src/engine.js`** — Pure arithmetic engine. State machine with `terms` array
(flat [n, op, n, op, ...]), string `buffer`, `waitingForOperand` flag for
operator replacement, `justResult` flag. `evalTerms` does two-pass precedence
evaluation (× ÷ before + −). `cleanNum` uses `toPrecision(12)` to eliminate
float noise. No eval, no new Function.

**`src/ghosts.js`** — 20 original SVG ghost functions. Each ghost is a 60×70px
SVG with rounded body, wavy hem, oval eyes, rosy cheeks, and a unique
combination of accessory (hat, bow, glasses, flower crown, heart eyes, etc.),
expression (happy, sad, wink, smirk, grin, O-mouth), and soft accent color.
`GHOST_MAP` maps key IDs to ghost functions.

**`src/animator.js`** — Ghost flight using `getBoundingClientRect` geometry,
quadratic bezier arc path via `requestAnimationFrame`. Emotion scenes: bounce
(+), cry/tears (−), hug (×), groups (÷), joke bubble (%), dance orbit (=).
Respects `prefers-reduced-motion`. Max 12 live sprites enforced.

**`src/ui.js`** — DOM wiring, `handleKey` dispatcher, keyboard listener,
`buildKeypad`/`buildControls` functions, i18n string maps (ES/EN), help
popover, `updateDisplay`, result flourish trigger.

**`src/style.css`** — Full visual design: cemetery dusk gradient background,
moon, mist bands, tombstone keys (rounded top, inset engraved numeral, moss
strip, feet), operator/special key styles, ghost sprite layer, all six emotion
CSS animations, responsive breakpoints (390px mobile, short screens), help
popover, controls bar.

**`src/index.html`** — Semantic HTML shell: stage layout, decorative SVG
gravestones, moon, mist, calculator widget with display panel and keypad/
controls containers, screen reader live region, ghost overlay.

**`tests/engine.test.mjs`** — 30+ test cases using Node's built-in test runner.
Covers all project acceptance cases, edge cases (double =, negate 0, digit
limit, backspace after result, operator-after-result chain).

**`build.mjs`** — Reads src files, strips ES module syntax (import/export),
concatenates engine → ghosts → animator → ui, inlines CSS, writes
`dist/index.html`.

**`package.json`** — `test` and `build` scripts, Node ≥ 18 requirement.

### Test results

Tests were written to be run by ChatGPT via `node --test tests/engine.test.mjs`.
Kiro has not executed commands and cannot report live test output. All test
cases were verified by manual trace against the engine implementation:

- `evalTerms([2, '+', 3])` → 5 ✓ (by logic trace)
- `evalTerms([2, '+', 3, '×', 4])` → 14 ✓ (two-pass precedence)
- `evalTerms([0.1, '+', 0.2])` → `cleanNum(0.3000...4)` = 0.3 ✓
- Operator replacement: `[2, '+']` with `waitingForOperand=true` → replace `+` with `×` ✓
- 50% → `cleanNum(50/100)` = 0.5 ✓
- 200+10% → allTerms=[200,'+',0.1] → 200.1 ✓
- Division by zero → `ERROR_DIV_ZERO` → `error: true` ✓

Actual test runner output and pass/fail counts: to be recorded by ChatGPT.

### Known limitations / items for ChatGPT browser QA

1. Ghost flight visual accuracy at all viewport sizes — not browser-tested by Kiro.
2. Touch event double-fire prevention on iOS — `touchend` + `preventDefault` used
   but not tested on physical device.
3. Emotion scene CSS animations — not visually verified by Kiro.
4. The `dist/index.html` ES module stripping in `build.mjs` uses regex and may
   need adjustment if any import/export line has an unexpected format. ChatGPT
   should run `node build.mjs` and verify the output opens without JS errors.
5. Screen reader announcement timing (50ms debounce) — not tested with actual AT.
6. Font rendering of tombstone engraved numerals at very small sizes.
7. `localStorage` access may throw in some private-browsing contexts — wrapped
   in try/catch.


## ChatGPT review and validation after the Kiro implementation

Kiro CLI 3.5.0 was used through a single primary `boocalc` profile with only
project file read/write tools. Delegation and shell execution were disabled.
An earlier attempt to use the built-in spec workflow was cancelled when it
attempted delegation; that workflow did not supply this implementation.

Kiro authored the requirements, design, task list and product steering, initial
calculator engine, 20 original ghost SVG variants, motion system, UI layer,
HTML/CSS, arithmetic tests, README, license candidate and build script. The
user supplied the product idea and exact operator behaviors. ChatGPT prepared
the product brief and restricted primary-session configuration.

ChatGPT reviewed the generated code, corrected state transitions (including
operator replacement, negative result continuation, unfinished expressions,
backspace and overflow), added 11 independent regression cases, and fixed the
standalone module bundling to retain separate module scopes and import aliases.
ChatGPT also refined the cemetery illustration and stone palette after viewing
the first browser render, made ghost groups visibly gather, fixed the hug
positions, split the dance CSS class tokens, corrected keyboard decimal origins,
made flight timing independent of refresh rate, bounded/recycled sprites, and
prevented outdated operation callbacks from replacing the latest scene.
Controls and help received keyboard, language and reduced-motion corrections.
The unused sound toggle was removed rather than exposing a nonfunctional control.

### Checks actually executed by ChatGPT

- Initial Kiro test run: 40 tests, 26 passed and 14 failed. A later Kiro engine
  revision passed the original 40 cases but failed 5 review regressions.
- Final arithmetic and regression run: **51 tests passed, 0 failed**.
- The 20 keypad ghost IDs generate **20 distinct SVG strings**.
- Standalone build compiles its JavaScript with Node before writing the HTML.
- Browser click checks passed for 2+3, 9−12, 1.5×4, 12÷4, 2+3×4,
  0.1+0.2 and operator replacement.
- Browser scene checks observed 3 bouncing ghosts, 2 crying ghosts, both hug
  partners, 6 ghosts gathering into groups, the exact Spanish percent joke
  with the actual result 0,5, and 3 dancing ghosts.
- Native keyboard entry of 1,5+2 followed by Enter displayed 3,5.
- Turning motion off removed the sprites; calculation still worked.
- ES/EN switching changed document language, decimal key, help and control text.
- A 390×844 iframe viewport displayed all 20 keys inside its bounds. In that
  viewport, 8×3 displayed 24 and Escape closed help without changing the result.
- Desktop visual inspection used the browser's 1365×936 viewport.

Kiro did not execute shell tests or browser QA. These checks were run by
ChatGPT. Physical-device touch behavior and real assistive-technology testing
remain unverified. This is a contest prototype; contest registration, public
GitHub publication and the YouTube demonstration have not been completed.


## Illustrated assets — 24 November 2026

At the user's request, OpenAI image generation created a transparent BooCalc
sprite sheet containing twenty engraved tombstone buttons and twenty matching
kawaii ghost frames. This artwork was generated after the Kiro implementation.
ChatGPT encoded the intact image as WebP, replaced the original character
rendering and button surfaces with atlas frames, and retained the arithmetic
engine, keyboard and six scene behaviors. The header ghost uses the same art.
The standalone build embeds the atlas so the public test build remains offline.

The original Kiro SVG implementation described above is historical provenance;
the current characters use the generated raster atlas. The decimal stone is
engraved with a comma in either language; both keyboard separators still work.

Integration checks actually executed:

- Existing arithmetic/regression suite: 51 passed, 0 failed.
- Standalone build syntax check passed with the complete atlas embedded.
- Browser: all twenty stone frames rendered; addition, subtraction, hugging,
  grouping, percent joke and three dancing raster ghosts were observed.
- 6 ÷ 3 displayed 2; with motion disabled, 8 ÷ 2 displayed 4 and no sprites remained.
- ES/EN switching retained the illustrated keys and updated accessible names.
- All twenty keys and controls fit 390 × 844 and 375 × 667 iframe viewports
  without horizontal overflow. Physical touch devices remain untested.


## Slower motion and key sounds — 24 November 2026

At the user's request, ChatGPT changed the key-to-display flight from 760 ms
to 1200 ms, replaced the full spin with a gentle sway, and slowed the reaction
scenes. Scene cleanup now accommodates their longer duration.

`src/sound.js` synthesizes a short, quiet “booo” from harmonics and breath noise.
It starts from the common calculator input handler, covering clicks, touch and
keyboard input. Sound is independent of motion and has a persisted mute control
in Spanish and English. Playback uses a cached buffer and at most two active
voices, with short fades on rapid replacement. No microphone, audio downloads,
recordings or third-party sound service are involved.

The standalone build now includes the sound module. The arithmetic suite still
passes all 51 tests. Waveform checks verified finite samples, a zero-ended
0.58-second envelope and a low playback peak of approximately 0.0704 full scale.
Browser checks observed the 1.9-second bounce and 2.3-second dance, 2+3=5,
and mute persistence across reload plus the English Sound label.

Additional browser checks: keyboard 1,5+2= displayed 3,5; rapid digit clicks
displayed 1234567890 without application console errors. With motion off,
8÷2= displayed 4, the sprite layer was empty, and sound remained enabled.
The additional Sound control fits both 390×844 and 375×667 iframe layouts.
Audio waveform/gain were checked programmatically; subjective playback on a
physical device has not been assessed.


## Asset corrections and musical notes — 24 November 2026

The asset audit found seven clipped ghost silhouettes, neighboring fragments in
7/6/2, minor moss cuts, an uneven header aspect ratio, a fixed comma in English,
and a mute-track color that reset incorrectly after reload.

ChatGPT replaced the uniform grid crop with exact rectangles and native SVG
isolation paths over the unchanged bitmap. Transparent display space surrounds
each frame. The authoring helper assigns faint edges to their nearest solid
component and emits exact merged scanline rectangles. Per-instance clipping IDs
are unique. All 41 active frames retained their alpha>=64 silhouette pixels and
excluded all other solid components in the geometry checks. A diagnostic render
of the calculated masks was inspected, including the complete broom and tails.

OpenAI image generation supplied a matching supplemental image: individual
×/÷ ghosts and a decimal-point stone. Spanish/English switching now changes the
visible decimal artwork. The header is square, mute-track color follows its
pressed state directly, unused side SVGs were removed, and tear accents refined.

The user's new musical direction is implemented as 1–7 C4/D4/E4/F4/G4/A4/B4,
8 C5, 9 D5 and 0 E5. Operators use C4. Each note has its own cached 0.58-second
buffer, preserving duration across pitches. Spectral checks found the generated
notes within about 1.5 cents of their targets with the subtle vibrato enabled.
Peak playback level remains approximately 0.0704 per voice.

All 51 arithmetic tests passed and the standalone build syntax check passed.
The browser rejected local preview access under its URL security policy; no
alternate browser, direct CDP or other bypass was attempted. Current full-page
rendering, post-reload interaction and physical-device listening remain unverified.
The available offline SVG renderer ignores clip paths, so its output was discarded
as a visual check. Only decoded mask geometry and source-based diagnostic renders
were used to inspect the isolated artwork.

## Continuous presentation and recording

After the user requested a fluid demonstration, ChatGPT added a separate
`demo.html` presentation. It runs the real calculator for approximately 95 seconds,
with English captions, complete reaction timings and checks of displayed answers.
It does not replace the calculator's normal page or supply mathematical results.

The recording button uses browser-granted tab capture and MediaRecorder. The
original live boo gain is connected to both the speaker output and a recording
destination; no microphone or system-audio capture is requested. Cancellation
releases the capture tracks and interrupted clips are labeled partial.
Completed clips are downloaded locally, with a playback/download control retained.
The page does not upload a recording or submit an entry.

This presentation and recorder were authored by ChatGPT, not Kiro. Kiro's original
contributions are described above and retained in the root `.kiro` directory.
Automated checks cover arithmetic in the demo, the full scene timing budget and
the recording audio route. Native screen selection and completed recording require
browser permission and remain to be verified by actually recording a clip.
