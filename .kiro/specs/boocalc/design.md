# BooCalc — Technical Design

## Architecture

Single-page app, zero external dependencies. Source files in `src/`, inlined
standalone build in `dist/index.html`.

```
src/
  index.html          — app shell, semantic markup
  style.css           — all visual design, animations, responsive
  engine.js           — pure calculator logic (no DOM)
  ghosts.js           — SVG ghost definitions (20 variants)
  animator.js         — DOM geometry, flight animation, emotion scenes
  ui.js               — wires DOM ↔ engine ↔ animator, keyboard, i18n
dist/
  index.html          — standalone single-file build
tests/
  engine.test.mjs     — arithmetic, edge cases, all acceptance cases
build.mjs             — inline script: reads src/, writes dist/index.html
package.json
README.md
LICENSE
DEVELOPMENT_LOG.md
```

## Calculator Engine (engine.js)

### State machine
```
state: {
  display: string          // what the display shows
  left: number | null      // left operand
  operator: string | null  // pending operator: + − × ÷
  right: string            // current input buffer (string to avoid float parse)
  justResult: boolean      // true after = was pressed
  error: boolean
}
```

### Input buffer approach
Keep the current operand as a string buffer ("1", "1.", "1.5", "-1.5").
Convert to number only when operator or = is pressed. This avoids intermediate
float issues. Final display uses `toPrecision(12)` then strip trailing zeros.

### Arithmetic
```js
function applyOp(a, op, b) {
  switch(op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? ERROR : a / b;
  }
}
```

### Precedence note
Brief says acceptance case 2+3×4=14 (sequential = (2+3)×4 = 20?). Re-reading:
"2+3×4=14" means standard math precedence. Engine implements a two-level
precedence stack: × and ÷ bind tighter than + and −. The pending-operator chain
accumulates terms. See implementation notes in engine.js.

Actually re-reading: "standard arithmetic precedence" is stated. So 2+3×4 = 2+(3×4) = 14. ✓

### Precision
```js
function cleanNum(n) {
  // toPrecision(12) then parseFloat removes trailing zeros
  return parseFloat(n.toPrecision(12));
}
```

## Ghost System (ghosts.js)

20 SVG ghost functions, each returns an SVG string. Variants:

| Key | Ghost ID | Accessory | Expression | Accent color |
|-----|----------|-----------|------------|--------------|
| AC  | ghost-ac | witch hat | surprised  | #c8a0d0 |
| ±   | ghost-pm | star wand  | wink       | #a0c8d0 |
| %   | ghost-pct| speech bubble ready | smirk | #d0c8a0 |
| ÷   | ghost-div| split tail | calm      | #a0b8d0 |
| 7   | ghost-7  | tiny bow   | happy      | #d0a0b8 |
| 8   | ghost-8  | glasses    | grin       | #b0d0a0 |
| 9   | ghost-9  | flower crown | gentle  | #d0b0a0 |
| ×   | ghost-mul| heart eyes | loving    | #d0a0a0 |
| 4   | ghost-4  | scarf      | cozy       | #a0c0d8 |
| 5   | ghost-5  | party hat  | excited    | #d0c0a0 |
| 6   | ghost-6  | music notes| singing    | #c0a0d0 |
| −   | ghost-sub| tear ready | sad        | #a0b0d0 |
| 1   | ghost-1  | tiny crown | proud      | #d0d0a0 |
| 2   | ghost-2  | bunny ears | playful    | #d0a0c0 |
| 3   | ghost-3  | leaf       | serene     | #a0d0b0 |
| +   | ghost-add| sparkles   | bouncy     | #d0b8a0 |
| ⌫   | ghost-bs | eraser     | sheepish   | #c0c0b0 |
| 0   | ghost-0  | round plain| classic    | #e0e0e8 |
| ,   | ghost-com| comma mark | quirky     | #c8b0d0 |
| =   | ghost-eq | disco ball | dancer     | #d0c0d8 |

Each ghost is ~60×70px SVG with:
- Rounded rectangular body, wavy bottom hem
- Two small oval eyes
- Rosy cheek circles
- Expression mouth (smile, smirk, sad arc, O-shape)
- Accessory specific to variant
- Soft drop shadow

## Animator (animator.js)

### Ghost flight
```
1. getBoundingClientRect(keyEl) → keyCenter {x, y}
2. getBoundingClientRect(displayEl) → displayCenter {x, y}
3. Create <div class="ghost-sprite" aria-hidden="true"> containing ghost SVG
4. Position absolutely relative to viewport overlay
5. Animate with Web Animations API: keyCenter → displayCenter
   cubic-bezier arc (slight upward curve via translateY offset)
6. On finish: evaporate (scale 0, opacity 0), remove element
7. Clamp live sprite count ≤ 12
```

### Emotion scenes
Run after the base ghost flight starts. Each scene creates 2–4 ghost sprites
in the display area and applies scene-specific keyframes.

**bounce (+)**: translate Y ±20px, scale 1→1.2→1, repeat 3×
**cry (−)**: add `.tear` elements that fall from under eyes, opacity 1→0
**hug (×)**: two ghosts at display edges translate toward center, overlap
**groups (÷)**: four ghosts at display, translate to corner clusters
**percent (%)**: single ghost at viewport center, speech bubble fade-in/out
**dance (=)**: 3 ghosts orbit display center in staggered rotation, result
  text scales from 0.5→1 with spring-like overshoot (1.1→1.0)

### Reduced motion
`window.matchMedia('(prefers-reduced-motion: reduce)')` or motionEnabled=false:
skip all sprite creation. Emotion scenes also suppressed.

## UI Layer (ui.js)

### i18n
Two string maps: `STRINGS.es` and `STRINGS.en`. All user-visible text looked up
via `t(key)`. Language stored in `localStorage.booCalcLang`. Default `'es'`.

### Keyboard map
```js
const KEY_MAP = {
  '0'-'9': digit,
  '.': decimal, ',': decimal,
  '+': op('+'), '-': op('−'), '*': op('×'), '/': op('÷'),
  'Enter': equals, '=': equals,
  'Backspace': backspace,
  'Escape': clear,
  '%': percent,
};
```
Keyboard ghost source: find button by `data-key` attribute.

### Display update
After every engine action: update `#display-value` and `#display-expr`.
Announce to `#sr-announce` (aria-live) with computed text.

## CSS Layout

### Desktop (≥ 768px)
```
body: flex column, min-height 100vh, cemetery background
.stage: flex row, max-width 1440px, margin auto
  .scene-left: flex 1, decorative gravestones + mist
  .calculator: flex 0 0 420px
  .scene-right: flex 1, decorative trees + moon
```

### Mobile (< 768px)
```
.stage: flex column
.scene-left/.scene-right: hidden or minimal
.calculator: width 100%, max-width 390px
```

### Calculator widget
```
.calculator
  .display-panel
    .display-expr   (small, previous op)
    .display-value  (large, current)
  .keypad (CSS grid 4×5)
    .key            (base style)
    .key--tombstone (number keys)
    .key--op        (operator keys)
    .key--special   (AC, ±, ⌫, =)
```

### Tombstone keys
```css
.key--tombstone {
  background: linear-gradient(180deg, #7a7a8a, #5a5a6a);
  border-radius: 50% 50% 0 0 / 30% 30% 0 0;  /* rounded top */
  box-shadow: inset 0 2px 4px rgba(255,255,255,.1),
              0 4px 0 #3a3a4a, /* base feet */
              0 5px 0 #2a2a3a;
  position: relative;
}
.key--tombstone::after { /* moss */
  content: '';
  position: absolute;
  bottom: 2px; left: 4px; right: 4px; height: 4px;
  background: #4a6040;
  border-radius: 2px;
}
```

## Build (build.mjs)

Reads `src/index.html`, inlines `src/style.css` as `<style>`, inlines
`src/engine.js`, `src/ghosts.js`, `src/animator.js`, `src/ui.js` as `<script>`.
Writes to `dist/index.html`. No minification required.
