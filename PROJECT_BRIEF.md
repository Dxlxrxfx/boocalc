# BooCalc — user-approved concept

Rafael chose a functional calculator with kawaii ghosts and a cemetery visual
world. Project title: BooCalc.

## User's creative direction (preserve faithfully)

- A functional calculator. Each button summons a DIFFERENT cute ghost, emerging
  from that very button and evaporating inside the operations display.
- Kawaii, friendly, playful. Rounded ghosts, tiny eyes, rosy cheeks, expressive
  faces. The setting is a charming cemetery; no horror, gore or frightening faces.
- Every number key is a little tombstone. Use cemetery colors and matching assets:
  charcoal, slate, weathered stone, muted sage/moss, lavender dusk and ivory mist.
- Addition (+): ghosts go wild and bounce around excitedly.
- Subtraction (−): ghosts cry, with visible little tears.
- Multiplication (×): ghosts move together and hug.
- Division (÷): ghosts arrange into little groups.
- Percent (%): a ghost appears in the center saying exactly
  "Esperabas que hiciera algo?" in Spanish. It must ALSO perform a real percentage
  calculation; the joke is the animation, not a broken calculator.
- Equals (=): ghosts dance; the real result is revealed with a coordinated visual
  flourish. Calculations must remain readable and usable through the animations.

## Interaction and math decisions

Create a four-column, five-row keypad:
AC | ± | % | ÷
7  | 8 | 9 | ×
4  | 5 | 6 | −
1  | 2 | 3 | +
⌫  | 0 | , | =

Support mouse/touch and keyboard: digits, dot/comma decimal separator, + - * /,
Enter or =, Backspace, Escape, %. Clearly label the accessible name of each key.
Provide standard arithmetic precedence and support a signed current operand via ±.
Do not use eval or new Function. Keep the calculator engine pure and independently
testable. Avoid floating-point artifacts such as 0.1+0.2 showing a long fraction.
Prevent invalid input sequences and handle division by zero as a readable Spanish
error without crashing. A fresh digit after a completed result starts a new sum;
an operator after the result continues with that result. Editing, clearing,
chained operations and operator replacement must work consistently.

Percent means current operand divided by 100, consistently in all contexts.
Thus 50%=0.5 and 200+10%=200.1; explain this convention in the help popover.
Do not silently implement a contextual bank-calculator convention.

All 20 buttons must summon a distinguishable ghost variant. Use an original SVG
ghost system with different silhouettes/details/accessories/expression/soft accent
combinations, not only a single reused emoji. Original SVG/CSS illustrations are
appropriate. No external image service or copyrighted character assets required.

## Product and art direction

Make a finished playful product, not a generic dashboard. The calculator is the
focus. A spacious dusk cemetery stage surrounds its operation display with a moon,
subtle mist, moss, small gravestones and friendly environmental details. Number
keys have clear tombstone silhouettes, engraved numerals, stone texture, feet and
subtle moss. Maintain legibility and clear hierarchy. Add a small tasteful legend
or help control to discover the six operator emotions. No marketing filler.

Give the desktop layout generous space for ghost motion. On small screens the
complete keypad must fit at 390px width without horizontal overflow. Use a reduced
vertical layout for short screens. Ghosts start at the actual clicked key center,
travel toward the display using measured DOM geometry and evaporate there. Ensure
the flight remains accurate after resize/scroll and with keyboard input. Keep
animations over a non-interactive layer, pointer-events:none, and bounded to avoid
leaks and runaway particle counts during rapid typing. Keep enough ghosts present
briefly for the operation behaviors to be obvious; summon companions if needed.

Controls: motion on/off and optional sound toggle, sound OFF by default. Sound is
optional and must never block the MVP. Honor prefers-reduced-motion; never autoplay
sound. Screen-reader calculation announcements must be separate from decorative
ghost animations (aria-hidden). Include visible focus and real labels. A bilingual
ES/EN toggle is useful for contest judging; default Spanish. Keep the exact Spanish
percent joke above; English can say "Were you expecting me to do something?".

## Implementation and provenance

Build locally in this project directory. Prefer dependency-free static HTML, CSS,
JavaScript; if using multiple modules, provide a standalone downloadable HTML build
too, so the user can immediately open the artifact offline. No external fonts or
asset CDN required. Node's built-in test runner is available.

Use Kiro meaningfully for this development. First produce genuine requirements,
design and tasks through Kiro's supported spec workflow, and concise steering docs
under .kiro at the root. Then implement the app and tests. Preserve those files
for the contest. In DEVELOPMENT_LOG.md record only the work YOU actually perform
inside Kiro, observed test results and remaining limitations. The product brief
was prepared by ChatGPT from the user's idea; do not claim Kiro wrote it or invent
previous sessions. Do not invent hooks, screenshots, user testing or deployment.

Work sequentially, without spawning subagents. Do not read private files outside
this project, alter system settings, expose credentials, send messages, publish,
deploy, create remote repositories or submit to contests. Stop if auth/payment is
needed. Use no paid services. Preserve test failures honestly and fix them.

## Acceptance cases

- 2+3=5; 9−12=−3; 1.5×4=6; 12÷4=3; 2+3×4=14.
- 0.1+0.2 displays 0.3; negative inputs and +/- switching work.
- 50% produces 0.5 AND the central ghost/joke. 200+10% produces 200.1.
- Division by zero displays a readable error; AC and new input recover.
- 2,+,×,3,= should replace + with × and return 6.
- Enter, Backspace, Escape, decimal comma/dot all match their buttons.
- Every key visibly summons its own ghost at the key before it enters the display.
- All six required emotion scenes are distinct and visible.
- Motion off/reduced-motion remains fully functional and has no travelling ghosts.
- At 390px mobile and 1440px desktop controls are legible, reachable, non-overlapping.

Deliver source, tests, .kiro evidence, English README, MIT license candidate and the
standalone HTML. Run meaningful arithmetic/interaction tests. State what browser
checks you actually performed versus what remains to be checked by ChatGPT.
