# BooCalc 👻

**A friendly cemetery where every calculation summons a ghost.**

BooCalc is a functional calculator with tombstone number keys and twenty original
kawaii ghost characters. Each key releases its own ghost; arithmetic operators
turn the characters into an expressive little cast.

Created by Rafael Enrique Arancibia Macías for **Kiroween 2026 — Costume Contest**.

[Hosted application](https://boo-calculadora-fantasmas.rxfxdxlx.chatgpt.site)

The hosted application's audience is managed separately from this repository.
The standalone build below works locally without an account or internet access.

## Try it

[Download the standalone calculator](https://github.com/Dxlxrxfx/boocalc/raw/refs/heads/main/dist/index.html) and open it in a modern browser. Alternatively, download this repository and open **`dist/index.html`**.
It contains the application, styles and original SVG illustrations in one file.
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

The original Spanish percent joke is **“Esperabas que hiciera algo?”**.
Percent still performs a real calculation.

The cemetery uses weathered stone, moss, muted lavender, ivory mist and a smiling
moon. The characters are friendly. The same key consistently summons the same
character, with a different face, accessory or silhouette for every key.

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
system's reduced-motion preference is honored. The application is silent.

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
- Twenty distinct SVG outputs for twenty keypad characters.
- Browser checks of the six reaction scenes, keyboard input, language switching,
  motion toggle and help.
- A 390 × 844 browser iframe viewport showed all twenty keys within its bounds.
- Standalone JavaScript is syntax-checked during the build.

Physical-device touch and real assistive-technology testing remain to be done.
The app provides a playful general-purpose calculator with twelve-digit precision.

## Source map

| File | Purpose |
| --- | --- |
| `src/engine.js` | Pure arithmetic and input state. |
| `src/ghosts.js` | Twenty original ghost SVG variants. |
| `src/animator.js` | Key-to-display flight and reaction scenes. |
| `src/ui.js` | Input, display, language and controls. |
| `src/index.html`, `src/style.css` | Layout and cemetery artwork. |
| `tests/` | Arithmetic and regression checks. |
| `build.mjs` | Self-contained HTML build. |
| `submission/` | Contest description and demo plan. |

## License

MIT. Copyright © 2026 Rafael Enrique Arancibia Macías. See [LICENSE](LICENSE).
