# Asset correction validation

The original audit applies to version 3. This change addresses its findings and
adds the user's requested musical note sequence. The source artwork is preserved;
this is a correction to frame selection/isolation plus three supplemental assets.

| Finding | Change | Check |
| --- | --- | --- |
| Seven clipped ghosts | Complete per-character rectangles, including the broom and tails | All measured solid pixels retained |
| Foreign fragments in 7, 6, 2 | Per-frame native SVG isolation | No foreign solid pixels in active masks |
| Minor moss cuts | Full stone rectangles and transparent display space | All twenty stone silhouettes retained |
| Fused ×/÷ characters | New individual matching ghosts | One source silhouette per operator frame |
| Stretched header | Square viewport/container at each existing breakpoint | CSS dimensions inspected |
| English comma | Dedicated decimal-point artwork selected for EN | Frame selector and UI update inspected |
| Incorrect mute-track color after reload | Track color uses `aria-pressed` directly | CSS selector uses the persisted state |
| Unused side SVGs | Six unused decorations removed | Main background retained |
| Flat tear accents | Shaded droplet and light highlight | Source inspected |

`src/assets/frame-validation.json` records the 41 active frame geometry checks.
The authoring tool compares exact masks with source alpha components at threshold
64. It reports zero lost source silhouette pixels and zero foreign solid pixels.
These are geometry checks; they do not certify all partially transparent pixels
or a browser's final rendering. A decoded-mask contact sheet was visually reviewed.
The normal build needs Node only; Python tooling is optional for asset authoring.

Musical sound checks cover 1 Do4, 2 Re4, 3 Mi4, 4 Fa4, 5 Sol4, 6 La4, 7 Si4,
8 Do5, 9 Re5, 0 Mi5. Each signal contains finite samples, lasts 0.58 seconds and
keeps a quiet peak. Spectral measurements were within 1.5 cents of the intended
fundamental. Calculator operators use Do4. All 51 arithmetic tests passed.

Full browser verification was blocked by the browser URL policy. No workaround
was attempted. Complete-page layout, reload interaction and real-device listening
remain to be checked. Earlier successful browser checks predate these corrections.
