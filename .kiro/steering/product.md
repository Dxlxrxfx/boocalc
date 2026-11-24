# BooCalc — Product Steering

## What it is
A kawaii ghost calculator set in a charming cemetery. Each button press summons a
distinct ghost that flies from the key to the display. The calculator is fully
functional with standard arithmetic precedence.

## Color palette
- Background sky: `#1a1240` → `#3d2b6b` (lavender dusk gradient)
- Cemetery ground: `#2a2a1e` with muted sage `#4a5240`
- Stone/tombstone: `#5a5a6a`, `#7a7a8a`, weathered `#8a8878`
- Moss accent: `#4a6040`, `#6a8060`
- Display: `#0d0a1a` with `#e8e0f0` text
- Ivory mist: `#f0ece8`
- Lavender accent: `#b89ac8`
- Ghost body: white/near-white with soft pastel accents

## Ghost system
20 unique SVG ghost variants, one per key. Variants differ by silhouette, face
expression, accessory (hat, bow, star, flower, etc.) and soft color accent.
Key-to-ghost mapping is fixed so the same key always summons the same ghost.

## Six operator emotion scenes
| Operator | Scene |
|----------|-------|
| + (add) | Ghosts bounce excitedly |
| − (sub) | Ghosts cry with tear drops |
| × (mul) | Ghosts move together and hug |
| ÷ (div) | Ghosts arrange into groups |
| % | Central ghost: "Esperabas que hiciera algo?" / "Were you expecting me to do something?" |
| = | Ghosts dance; result revealed with flourish |

## Keypad layout (4 col × 5 row)
```
AC  ±   %   ÷
7   8   9   ×
4   5   6   −
1   2   3   +
⌫   0   ,   =
```

## Language
Default Spanish. ES/EN toggle available. Percent joke kept verbatim in Spanish.

## Non-negotiables
- No eval / new Function
- No floating-point artifacts (0.1+0.2 = 0.3)
- Percent = operand ÷ 100 (not bank contextual)
- Division by zero → readable Spanish error, recoverable via AC
- Motion off + prefers-reduced-motion: no travelling ghosts, full functionality
- Sound off by default, never blocks MVP
- Fits 390px mobile without horizontal scroll
- Ghost flight uses real DOM geometry, accurate after resize/scroll
- Animations on pointer-events:none layer, bounded, no runaway counts


## Later user direction (ChatGPT integration, 24 November 2026)

Use exact complete bitmap frames with transparent display padding and isolation,
not the original atlas grid divisions. × and ÷ each have a single character.
Show comma/point art according to ES/EN and preserve a square header character.
Retain the slower 1.2-second flight and optional quiet key sounds. Digits 1–7
play Do/Re/Mi/Fa/Sol/La/Si in octave 4; 8/9/0 play Do/Re/Mi in octave 5.
All notes keep a 0.58-second duration. Other keys use Do4.
