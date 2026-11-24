# BooCalc — Kiroween 2026 submission draft

Status: prepared for review. This document is not proof of registration or submission.

## Project name
BooCalc

## Elevator pitch
A friendly cemetery where every calculation summons a ghost.

## Category
Costume Contest

## Inspiration
I wanted every calculator key to feel like the home of a tiny character. A number
would be engraved on a tombstone, and pressing it would wake up a friendly ghost.
The mood is kawaii: weathered stone, moss, dusk and expressive little characters.
I connected each arithmetic operator to a different reaction so the visual world
would respond to what the person was doing.

## What it does
BooCalc performs real arithmetic with standard operator precedence. It supports
decimal input, negative numbers, percentages, chained operations and keyboard
input. Each of its twenty keys summons a distinct illustrated ghost that travels
from that key into the operation display and evaporates.

Addition makes the cast bounce excitedly. Subtraction brings little tears.
Multiplication makes the ghosts hug. Division gathers them into small groups.
Equals makes them dance while the result appears. Percent performs its calculation
and summons a central character asking, “Were you expecting me to do something?”

The UI has Spanish and English modes and an animation toggle. Decorative motion
is separated from arithmetic and honors the operating system's reduced-motion
preference. Results remain readable, and the app can run offline as one HTML file.

## How it was built
The product concept and six reactions are my creative direction. I used Kiro CLI
and ChatGPT to develop the application. Kiro generated the requirements, design,
task list and product steering in `.kiro`, then the initial calculator engine,
the initial twenty SVG characters, animation system, UI, styles, build script and test suite.

ChatGPT prepared the brief from my direction, reviewed and refined the generated
code, corrected state transitions and packaging, and ran arithmetic and browser
checks. The result uses HTML, CSS and JavaScript with a BooCalc-specific AI-generated sprite atlas,
external fonts, dependencies or paid APIs. The current illustrated buttons and ghosts were generated with OpenAI image
generation from my direction, then integrated by ChatGPT. Kiro authored the
initial SVG character system before that visual replacement. The public development log identifies
which work came from each tool.

## How Kiro was used
Kiro CLI worked as one primary session through a custom `boocalc` profile. The
profile was limited to project file reading and writing. The workflow was organized
around a concrete brief, requirement groups, an implementation design and a
tracked task list. Its resulting artifacts are retained under the repository's
root `.kiro` directory.

Kiro's implementation gave us separate modules for arithmetic, character art,
animation and UI. That separation let us validate the calculator independently
and refine the reactions without coupling decorative motion to mathematical
state. Kiro wrote the initial test suite; external review added eleven regression
cases. All fifty-one tests now pass. Kiro did not execute the shell or browser
checks; those were performed through ChatGPT's tools.

## Challenges
Input state needed careful handling: a typed zero must differ from a pending
operand, changing sign after a result must affect the next operation, and an
unfinished expression must resolve consistently. We also needed to retain module
scope while packaging the app into one offline HTML file.

For animation, ghosts needed to start at the pressed key's real position, stay
bounded during fast input, finish their scenes and disappear cleanly. Stale
callbacks had to be prevented from replacing a more recent operator's reaction.

## Accomplishments
- Twenty distinct illustrated characters with consistent key identities.
- Six working reaction scenes tied to real calculator inputs.
- A self-contained application with no external runtime dependencies.
- Fifty-one passing arithmetic and regression tests.
- Keyboard support, ES/EN copy and optional motion.
- Verified desktop use and 390 × 844 / 375 × 667 browser iframe layouts.

## What is next
Physical-device and assistive-technology testing, followed by refinements based
on feedback about character visibility and reaction timing.

## Links to complete before submission
- Source: https://github.com/Dxlxrxfx/boocalc
- Functional test build: https://github.com/Dxlxrxfx/boocalc/raw/refs/heads/main/dist/index.html
- Instructions: download the HTML file and open it in a modern browser; no account, server or internet connection is required.
- Hosted owner preview: https://boo-calculadora-fantasmas.rxfxdxlx.chatgpt.site
- Public YouTube demo: pending upload and verification.

The test build is publicly downloadable for judge access. The hosted owner preview
has separate access controls. Registration, video publication and final acceptance
of the contest rules are pending.
