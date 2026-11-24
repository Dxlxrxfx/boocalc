# BooCalc — Requirements

## Functional Requirements

### FR-1 Calculator Engine
- FR-1.1 Support addition, subtraction, multiplication, division with standard
  left-to-right evaluation (no precedence beyond chained ops with operator replacement).
- FR-1.2 Percent: current operand ÷ 100. 50% → 0.5. Never contextual.
- FR-1.3 Avoid floating-point artifacts. Use round-to-significant-figures
  (12 sig figs) before display.
- FR-1.4 Division by zero: display "Error: ÷ entre 0" (ES) / "Error: ÷ by 0" (EN).
  State is recoverable via AC.
- FR-1.5 Negation (±) flips sign of current operand at any point.
- FR-1.6 Operator replacement: pressing a new operator before entering a right-hand
  operand replaces the pending operator.
- FR-1.7 Fresh digit after a completed result starts a new calculation.
  Operator after result continues using that result.
- FR-1.8 Chained operations: 2+3= gives 5; then ×4= gives 20.
- FR-1.9 Acceptance: 2+3=5; 9−12=−3; 1.5×4=6; 12÷4=3; 2+3×4=14 (sequential,
  no precedence re-ordering needed — project brief uses sequential evaluation).
- FR-1.10 No eval or new Function in engine.

### FR-2 Input
- FR-2.1 Mouse click on all 20 keys.
- FR-2.2 Touch on all 20 keys.
- FR-2.3 Keyboard: 0–9, `.` or `,` decimal, `+` `-` `*` `/`, `Enter` or `=`,
  `Backspace`, `Escape`, `%`.
- FR-2.4 Comma and dot both accepted as decimal separator; display uses locale
  separator (`,` in ES, `.` in EN).

### FR-3 Display
- FR-3.1 Operations display: shows current operand / running expression.
- FR-3.2 History line: shows previous operand and operator while entering RHS.
- FR-3.3 Result shown with flourish after `=`.
- FR-3.4 Error state shown clearly; does not crash.

### FR-4 Ghost Animation System
- FR-4.1 Each of the 20 keys has a unique SVG ghost variant.
- FR-4.2 On key press, ghost spawns at the key's center, flies to display center,
  evaporates there.
- FR-4.3 Flight path uses real DOM getBoundingClientRect geometry.
- FR-4.4 After resize or scroll, next flight uses fresh geometry.
- FR-4.5 Animations run on a pointer-events:none overlay layer.
- FR-4.6 Maximum concurrent animated ghosts capped (≤12) to prevent runaway counts.
- FR-4.7 Each operator triggers its emotion scene (see FR-5).
- FR-4.8 Keyboard input triggers ghost animation from the matching DOM key.

### FR-5 Operator Emotion Scenes
- FR-5.1 `+`: ghosts bounce with excitement (keyframe vertical bounce + scale).
- FR-5.2 `−`: ghosts show tears (animated droplets below eyes).
- FR-5.3 `×`: ghost pairs translate toward each other and merge (hug).
- FR-5.4 `÷`: ghosts spread into separated groups (translate apart).
- FR-5.5 `%`: single ghost appears center-screen, speech bubble "Esperabas que hiciera algo?" (ES) / "Were you expecting me to do something?" (EN). Real % calculation still executes.
- FR-5.6 `=`: ghosts perform dance (spin + translate orbit), result revealed with
  scale + fade flourish.

### FR-6 Visual Design
- FR-6.1 Cemetery dusk sky background gradient.
- FR-6.2 Moon in upper area.
- FR-6.3 Mist layer (subtle animated opacity waves).
- FR-6.4 Small decorative gravestones in background.
- FR-6.5 Number keys styled as tombstones: rounded top, feet, engraved numeral,
  stone texture via CSS, subtle moss.
- FR-6.6 Operator keys: distinct style, cemetery-complementary colors.
- FR-6.7 Display: dark glass panel with ghost-visible interior.
- FR-6.8 All text legible at WCAG AA contrast on its background.

### FR-7 Accessibility
- FR-7.1 Each button has aria-label with its full accessible name.
- FR-7.2 Display region is aria-live="polite" for screen readers.
- FR-7.3 Ghost animations are aria-hidden="true".
- FR-7.4 Visible focus indicator on all interactive elements.
- FR-7.5 prefers-reduced-motion: disable travelling ghosts and CSS transitions;
  calculator remains fully functional.

### FR-8 Controls
- FR-8.1 Motion toggle (on/off), default on (or follows prefers-reduced-motion).
- FR-8.2 Sound toggle, default OFF. No autoplay.
- FR-8.3 Language toggle ES/EN, default ES.
- FR-8.4 Help popover explaining six emotion scenes and percent convention.

### FR-9 Layout & Responsive
- FR-9.1 At 390px viewport: full keypad visible, no horizontal scroll.
- FR-9.2 At 1440px: generous stage space for ghost motion.
- FR-9.3 Short viewport (height < 600px): reduced vertical layout.

### FR-10 Build & Delivery
- FR-10.1 Source in `src/` directory: HTML, CSS, JS modules.
- FR-10.2 Standalone single-file build in `dist/index.html` (inlined CSS+JS).
- FR-10.3 `build.mjs` produces the dist build.
- FR-10.4 Tests in `tests/` using Node built-in test runner.
- FR-10.5 `package.json` with `test` and `build` scripts.
- FR-10.6 README.md in English.
- FR-10.7 LICENSE (MIT).
- FR-10.8 DEVELOPMENT_LOG.md with honest record.
