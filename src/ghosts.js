/**
 * BooCalc — Ghost SVG Library
 * 20 unique kawaii ghost variants, one per calculator key.
 * Each function returns an SVG string (60×70px viewBox).
 * Variants differ in silhouette, face, accessory, and soft accent color.
 */

'use strict';

// ─── Shared SVG primitives ────────────────────────────────────────────────────

/**
 * Base ghost body path.
 * cx, cy = center top of body. w = half-width. h = body height.
 */
function ghostBody(cx, cy, w, h, fill, stroke) {
  const x = cx - w;
  const bx = cx + w;
  const bottom = cy + h;
  // Wavy bottom hem — 3 bumps
  const bumpH = 10;
  const bw = (w * 2) / 3;
  return `
    <path d="
      M ${x} ${cy + w * 0.9}
      Q ${x} ${cy - w * 0.3} ${cx} ${cy - w * 0.3}
      Q ${bx} ${cy - w * 0.3} ${bx} ${cy + w * 0.9}
      L ${bx} ${bottom - bumpH}
      Q ${cx + bw} ${bottom} ${cx} ${bottom - bumpH}
      Q ${cx - bw} ${bottom} ${x} ${bottom - bumpH}
      Z
    " fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}

/**
 * Simple round ghost body (wider, more blob-like).
 */
function roundBody(cx, cy, rx, ry, fill, stroke) {
  const bottom = cy + ry;
  const bumpH = 8;
  const bw = rx * 0.7;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry * 0.7}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <rect x="${cx - rx}" y="${cy}" width="${rx * 2}" height="${ry * 0.3 + bumpH}" fill="${fill}"/>
    <path d="
      M ${cx - rx} ${cy}
      L ${cx - rx} ${bottom - bumpH}
      Q ${cx - bw / 2} ${bottom} ${cx} ${bottom - bumpH}
      Q ${cx + bw / 2} ${bottom} ${cx + rx} ${bottom - bumpH}
      L ${cx + rx} ${cy}
    " fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
}

function eyes(cx, cy, col = '#2a1a3a') {
  return `
    <ellipse cx="${cx - 7}" cy="${cy}" rx="3" ry="3.5" fill="${col}"/>
    <ellipse cx="${cx + 7}" cy="${cy}" rx="3" ry="3.5" fill="${col}"/>
    <ellipse cx="${cx - 6}" cy="${cy - 1}" rx="1" ry="1" fill="white" opacity=".7"/>
    <ellipse cx="${cx + 8}" cy="${cy - 1}" rx="1" ry="1" fill="white" opacity=".7"/>`;
}

function cheeks(cx, cy) {
  return `
    <ellipse cx="${cx - 11}" cy="${cy + 3}" rx="5" ry="3.5" fill="#f4a0b0" opacity=".55"/>
    <ellipse cx="${cx + 11}" cy="${cy + 3}" rx="5" ry="3.5" fill="#f4a0b0" opacity=".55"/>`;
}

function smileHappy(cx, cy) {
  return `<path d="M ${cx - 6} ${cy} Q ${cx} ${cy + 7} ${cx + 6} ${cy}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>`;
}

function smileSad(cx, cy) {
  return `<path d="M ${cx - 6} ${cy + 5} Q ${cx} ${cy - 1} ${cx + 6} ${cy + 5}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>`;
}

function smileSmirk(cx, cy) {
  return `<path d="M ${cx - 4} ${cy + 3} Q ${cx + 2} ${cy + 1} ${cx + 6} ${cy + 4}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>`;
}

function mouthO(cx, cy) {
  return `<ellipse cx="${cx}" cy="${cy + 2}" rx="3.5" ry="3" fill="#2a1a3a"/>`;
}

function mouthGrin(cx, cy) {
  return `
    <path d="M ${cx - 7} ${cy} Q ${cx} ${cy + 9} ${cx + 7} ${cy}" fill="#2a1a3a" stroke="#2a1a3a" stroke-width="1"/>
    <path d="M ${cx - 7} ${cy} Q ${cx} ${cy + 9} ${cx + 7} ${cy}" fill="none" stroke="#2a1a3a" stroke-width="1.5"/>`;
}

// Drop shadow filter
const FILTER_SHADOW = `<filter id="gs" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
</filter>`;

function svgWrap(id, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70" width="60" height="70" role="img" aria-hidden="true" data-ghost="${id}">
  <defs>${FILTER_SHADOW}</defs>
  <g filter="url(#gs)">
  ${content}
  </g>
</svg>`;
}

// ─── 20 Ghost Variants ────────────────────────────────────────────────────────

/** AC — Witch hat, surprised expression, lavender accent */
export function ghostAC() {
  const fill = '#e8e4f8', stroke = '#b89ac8';
  const cx = 30, cy = 36;
  return svgWrap('ac', `
    ${ghostBody(cx, cy, 18, 28, fill, stroke)}
    <!-- Witch hat -->
    <polygon points="30,8 22,24 38,24" fill="#3a2a5a" stroke="#5a4a7a" stroke-width="1"/>
    <rect x="19" y="22" width="22" height="4" rx="2" fill="#5a4a7a"/>
    <!-- Hat star -->
    <polygon points="30,12 31.2,15.6 35,15.6 32,17.8 33.2,21.4 30,19.2 26.8,21.4 28,17.8 25,15.6 28.8,15.6" fill="#f0d060" transform="scale(.5) translate(30,8)"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${mouthO(cx, cy + 2)}
  `);
}

/** ± — Star wand, winking, teal accent */
export function ghostPM() {
  const fill = '#e4f4f8', stroke = '#80c8d0';
  const cx = 30, cy = 36;
  return svgWrap('pm', `
    ${ghostBody(cx, cy, 18, 28, fill, stroke)}
    <!-- Wand -->
    <line x1="44" y1="20" x2="52" y2="12" stroke="#c0a040" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="52,8 53.5,12.5 58,12.5 54.3,15.3 55.8,19.8 52,17 48.2,19.8 49.7,15.3 46,12.5 50.5,12.5" fill="#f8e040" transform="scale(.7) translate(21,0)"/>
    <!-- Eyes: wink right -->
    <ellipse cx="${cx - 7}" cy="${cy - 4}" rx="3" ry="3.5" fill="#2a1a3a"/>
    <ellipse cx="${cx - 6}" cy="${cy - 5}" rx="1" ry="1" fill="white" opacity=".7"/>
    <path d="M ${cx + 4} ${cy - 5} Q ${cx + 7} ${cy - 2} ${cx + 10} ${cy - 5}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
  `);
}

/** % — Smirk, speech-bubble ready, golden accent */
export function ghostPCT() {
  const fill = '#f8f4e0', stroke = '#c8b060';
  const cx = 30, cy = 38;
  return svgWrap('pct', `
    ${ghostBody(cx, cy, 18, 26, fill, stroke)}
    <!-- Raised eyebrow -->
    <path d="M ${cx - 10} ${cy - 7} Q ${cx - 7} ${cy - 10} ${cx - 4} ${cy - 7}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileSmirk(cx, cy + 3)}
  `);
}

/** ÷ — Split tail silhouette, calm eyes, sky blue accent */
export function ghostDIV() {
  const fill = '#e0ecf8', stroke = '#7098c0';
  const cx = 30, cy = 34;
  return svgWrap('div', `
    <!-- Split tail body -->
    <path d="
      M 12 ${cy + 8}
      Q 12 ${cy - 10} ${cx} ${cy - 10}
      Q 48 ${cy - 10} 48 ${cy + 8}
      L 48 56
      Q 42 60 36 55
      Q 30 62 24 55
      Q 18 60 12 56
      Z
    " fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${eyes(cx, cy - 2)}
    ${cheeks(cx, cy)}
    ${smileHappy(cx, cy + 5)}
  `);
}

/** 7 — Tiny bow, happy, rose accent */
export function ghost7() {
  const fill = '#f8e8f0', stroke = '#d088a8';
  const cx = 30, cy = 36;
  return svgWrap('7', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Bow -->
    <path d="M 22,18 Q 26,22 30,18 Q 34,22 38,18 Q 34,14 30,18 Q 26,14 22,18 Z" fill="${stroke}" opacity=".9"/>
    <circle cx="30" cy="18" r="2.5" fill="#f8d0e0"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
  `);
}

/** 8 — Glasses, grin, lime green accent */
export function ghost8() {
  const fill = '#ecf8e4', stroke = '#90c870';
  const cx = 30, cy = 36;
  return svgWrap('8', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Glasses -->
    <rect x="17" y="${cy - 8}" width="10" height="8" rx="4" fill="none" stroke="#2a1a3a" stroke-width="1.5"/>
    <rect x="33" y="${cy - 8}" width="10" height="8" rx="4" fill="none" stroke="#2a1a3a" stroke-width="1.5"/>
    <line x1="27" y1="${cy - 4}" x2="33" y2="${cy - 4}" stroke="#2a1a3a" stroke-width="1.5"/>
    <line x1="17" y1="${cy - 4}" x2="13" y2="${cy - 6}" stroke="#2a1a3a" stroke-width="1.5"/>
    <line x1="43" y1="${cy - 4}" x2="47" y2="${cy - 6}" stroke="#2a1a3a" stroke-width="1.5"/>
    <!-- Eyes behind glasses -->
    <ellipse cx="${cx - 7}" cy="${cy - 4}" rx="2.5" ry="2.5" fill="#2a1a3a"/>
    <ellipse cx="${cx + 7}" cy="${cy - 4}" rx="2.5" ry="2.5" fill="#2a1a3a"/>
    ${cheeks(cx, cy - 2)}
    ${mouthGrin(cx, cy + 4)}
  `);
}

/** 9 — Flower crown, gentle expression, peach accent */
export function ghost9() {
  const fill = '#f8ede4', stroke = '#d0906a';
  const cx = 30, cy = 36;
  return svgWrap('9', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Flower crown -->
    <circle cx="20" cy="22" r="4" fill="#f4d060" opacity=".9"/>
    <circle cx="30" cy="18" r="4.5" fill="#f8a0b8" opacity=".9"/>
    <circle cx="40" cy="22" r="4" fill="#b0d890" opacity=".9"/>
    <circle cx="20" cy="22" r="2" fill="#f8f0d0"/>
    <circle cx="30" cy="18" r="2.5" fill="#f8f0d0"/>
    <circle cx="40" cy="22" r="2" fill="#f8f0d0"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
  `);
}

/** × — Heart eyes, loving, coral accent */
export function ghostMUL() {
  const fill = '#f8e8e8', stroke = '#d08880';
  const cx = 30, cy = 36;
  return svgWrap('mul', `
    ${ghostBody(cx, cy, 18, 28, fill, stroke)}
    <!-- Heart eyes -->
    <path d="M ${cx - 10} ${cy - 6} C ${cx - 10} ${cy - 10} ${cx - 4} ${cy - 10} ${cx - 4} ${cy - 6} C ${cx - 4} ${cy - 2} ${cx - 10} ${cy} ${cx - 10} ${cy} C ${cx - 10} ${cy} ${cx - 16} ${cy - 2} ${cx - 16} ${cy - 6} C ${cx - 16} ${cy - 10} ${cx - 10} ${cy - 10} ${cx - 10} ${cy - 6} Z" fill="#e04060"/>
    <path d="M ${cx + 10} ${cy - 6} C ${cx + 10} ${cy - 10} ${cx + 16} ${cy - 10} ${cx + 16} ${cy - 6} C ${cx + 16} ${cy - 2} ${cx + 10} ${cy} ${cx + 10} ${cy} C ${cx + 10} ${cy} ${cx + 4} ${cy - 2} ${cx + 4} ${cy - 6} C ${cx + 4} ${cy - 10} ${cx + 10} ${cy - 10} ${cx + 10} ${cy - 6} Z" fill="#e04060"/>
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 4)}
  `);
}

/** 4 — Scarf, cozy expression, steel blue accent */
export function ghost4() {
  const fill = '#e8eef8', stroke = '#7898c8';
  const cx = 30, cy = 36;
  return svgWrap('4', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Scarf -->
    <path d="M 14 ${cy + 6} Q 30 ${cy + 2} 46 ${cy + 6} Q 46 ${cy + 12} 30 ${cy + 10} Q 14 ${cy + 12} 14 ${cy + 6} Z" fill="#c84040" opacity=".85"/>
    <path d="M 36 ${cy + 6} Q 38 ${cy + 14} 34 ${cy + 20}" stroke="#c84040" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 1)}
  `);
}

/** 5 — Party hat, excited, gold accent */
export function ghost5() {
  const fill = '#f8f4e0', stroke = '#c8a840';
  const cx = 30, cy = 36;
  return svgWrap('5', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Party hat -->
    <polygon points="${cx},10 ${cx - 12},26 ${cx + 12},26" fill="#e04888" stroke="#c03070" stroke-width="1"/>
    <circle cx="${cx}" cy="10" r="3" fill="#f8f040"/>
    <!-- Polka dots on hat -->
    <circle cx="${cx - 4}" cy="20" r="1.5" fill="white" opacity=".8"/>
    <circle cx="${cx + 4}" cy="17" r="1.5" fill="white" opacity=".8"/>
    <!-- Confetti -->
    <rect x="10" y="14" width="4" height="3" rx="1" fill="#40c8d0" transform="rotate(-20,12,16)" opacity=".8"/>
    <rect x="44" y="18" width="4" height="3" rx="1" fill="#c040c8" transform="rotate(15,46,20)" opacity=".8"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${mouthO(cx, cy + 3)}
  `);
}

/** 6 — Music notes, singing expression, violet accent */
export function ghost6() {
  const fill = '#ece8f8', stroke = '#9880d0';
  const cx = 30, cy = 36;
  return svgWrap('6', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Music notes -->
    <text x="8" y="22" font-size="11" fill="#6050a0" opacity=".9" font-family="serif">♪</text>
    <text x="42" y="20" font-size="9" fill="#6050a0" opacity=".9" font-family="serif">♫</text>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    <!-- Singing mouth -->
    <ellipse cx="${cx}" cy="${cy + 4}" rx="5" ry="4" fill="#2a1a3a"/>
    <ellipse cx="${cx}" cy="${cy + 3}" rx="4" ry="2.5" fill="#c04070"/>
  `);
}

/** − — Teary-eyed, sad, periwinkle accent */
export function ghostSUB() {
  const fill = '#e8ecf8', stroke = '#8898d0';
  const cx = 30, cy = 36;
  return svgWrap('sub', `
    ${ghostBody(cx, cy, 18, 28, fill, stroke)}
    <!-- Sad eyes -->
    <ellipse cx="${cx - 7}" cy="${cy - 4}" rx="3" ry="3.5" fill="#2a1a3a"/>
    <ellipse cx="${cx + 7}" cy="${cy - 4}" rx="3" ry="3.5" fill="#2a1a3a"/>
    <!-- Worried eyebrows -->
    <path d="M ${cx - 11} ${cy - 10} Q ${cx - 7} ${cy - 8} ${cx - 3} ${cy - 10}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M ${cx + 3} ${cy - 10} Q ${cx + 7} ${cy - 8} ${cx + 11} ${cy - 10}" fill="none" stroke="#2a1a3a" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Tear drops -->
    <ellipse cx="${cx - 7}" cy="${cy + 4}" rx="2" ry="3" fill="#a0c0f0" opacity=".8"/>
    <ellipse cx="${cx + 7}" cy="${cy + 5}" rx="2" ry="3" fill="#a0c0f0" opacity=".8"/>
    ${cheeks(cx, cy - 2)}
    ${smileSad(cx, cy + 9)}
  `);
}

/** 1 — Tiny crown, proud, yellow accent */
export function ghost1() {
  const fill = '#f8f8e0', stroke = '#c0b840';
  const cx = 30, cy = 36;
  return svgWrap('1', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Crown -->
    <path d="M 18,25 L 18,16 L 23,21 L 30,13 L 37,21 L 42,16 L 42,25 Z" fill="#f0c030" stroke="#c09020" stroke-width="1"/>
    <circle cx="30" cy="13" r="2.5" fill="#e04040"/>
    <circle cx="18" cy="16" r="2" fill="#40a0e0"/>
    <circle cx="42" cy="16" r="2" fill="#40e090"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
  `);
}

/** 2 — Bunny ears, playful, pink accent */
export function ghost2() {
  const fill = '#f8e8f4', stroke = '#c880b8';
  const cx = 30, cy = 36;
  return svgWrap('2', `
    <!-- Bunny ears -->
    <ellipse cx="${cx - 10}" cy="12" rx="5" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <ellipse cx="${cx - 10}" cy="12" rx="2.5" ry="7" fill="#f4b0c8" opacity=".8"/>
    <ellipse cx="${cx + 10}" cy="12" rx="5" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <ellipse cx="${cx + 10}" cy="12" rx="2.5" ry="7" fill="#f4b0c8" opacity=".8"/>
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
    <!-- Tiny nose -->
    <ellipse cx="${cx}" cy="${cy + 1}" rx="2" ry="1.5" fill="#f090b0"/>
  `);
}

/** 3 — Leaf, serene, mint accent */
export function ghost3() {
  const fill = '#e8f4ec', stroke = '#70b888';
  const cx = 30, cy = 36;
  return svgWrap('3', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Leaf accessories -->
    <ellipse cx="20" cy="20" rx="7" ry="11" fill="#70b060" opacity=".8" transform="rotate(-30,20,20)"/>
    <line x1="20" y1="12" x2="20" y2="28" stroke="#408040" stroke-width="1" opacity=".8"/>
    <ellipse cx="40" cy="22" rx="5" ry="9" fill="#90c870" opacity=".7" transform="rotate(20,40,22)"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileHappy(cx, cy + 3)}
  `);
}

/** + — Sparkles, bouncy energy, amber accent */
export function ghostADD() {
  const fill = '#f8f0e4', stroke = '#d09848';
  const cx = 30, cy = 36;
  return svgWrap('add', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Sparkles -->
    <text x="6" y="16" font-size="13" fill="#f0c030" opacity=".95">✦</text>
    <text x="43" y="20" font-size="9" fill="#f0c030" opacity=".9">✦</text>
    <text x="12" y="30" font-size="8" fill="#f0a030" opacity=".8">✧</text>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${mouthO(cx, cy + 3)}
  `);
}

/** ⌫ — Eraser-shaped head detail, sheepish, gray accent */
export function ghostBS() {
  const fill = '#f0eeea', stroke = '#a09888';
  const cx = 30, cy = 36;
  return svgWrap('bs', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Eraser headband -->
    <rect x="16" y="${cy - 12}" width="28" height="7" rx="3" fill="#f0e0a0" stroke="#c0b060" stroke-width="1"/>
    <!-- Sweat drop -->
    <ellipse cx="44" cy="${cy - 8}" rx="3.5" ry="4.5" fill="#a0c8e8" opacity=".8"/>
    <path d="M 44 ${cy - 13} Q 46 ${cy - 10} 44 ${cy - 4}" fill="#a0c8e8" opacity=".8"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileSmirk(cx, cy + 3)}
  `);
}

/** 0 — Classic round plain, friendly, cool white accent */
export function ghost0() {
  const fill = '#f4f4f8', stroke = '#b0b0c0';
  const cx = 30, cy = 36;
  return svgWrap('0', `
    <!-- Extra-round plump body -->
    <ellipse cx="${cx}" cy="${cy + 4}" rx="20" ry="22" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <!-- Wavy hem overlay -->
    <path d="
      M 10 ${cy + 20}
      Q 16 ${cy + 28} 22 ${cy + 22}
      Q 30 ${cy + 30} 38 ${cy + 22}
      Q 44 ${cy + 28} 50 ${cy + 20}
    " fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${eyes(cx, cy)}
    ${cheeks(cx, cy + 2)}
    ${smileHappy(cx, cy + 7)}
  `);
}

/** , — Comma mark, quirky, lilac accent */
export function ghostCOM() {
  const fill = '#f0ecf8', stroke = '#a890c8';
  const cx = 30, cy = 36;
  return svgWrap('com', `
    ${ghostBody(cx, cy, 17, 28, fill, stroke)}
    <!-- Squiggly antenna -->
    <path d="M ${cx} ${cy - 14} Q ${cx + 8} ${cy - 20} ${cx + 4} ${cy - 26} Q ${cx} ${cy - 30} ${cx + 6} ${cy - 34}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="${cx + 6}" cy="${cy - 34}" r="3" fill="#c0a0e0"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${smileSmirk(cx, cy + 3)}
  `);
}

/** = — Disco ball detail, dancer, mauve accent */
export function ghostEQ() {
  const fill = '#f4ecf8', stroke = '#c0a0d0';
  const cx = 30, cy = 36;
  return svgWrap('eq', `
    ${ghostBody(cx, cy, 18, 28, fill, stroke)}
    <!-- Disco ball above -->
    <circle cx="${cx}" cy="12" r="8" fill="#c8d8f0" stroke="#a0b8d8" stroke-width="1"/>
    <!-- Disco grid -->
    <line x1="${cx - 8}" y1="12" x2="${cx + 8}" y2="12" stroke="#8898b8" stroke-width=".8"/>
    <line x1="${cx}" y1="4" x2="${cx}" y2="20" stroke="#8898b8" stroke-width=".8"/>
    <line x1="${cx - 6}" y1="6" x2="${cx + 6}" y2="18" stroke="#8898b8" stroke-width=".8"/>
    <line x1="${cx + 6}" y1="6" x2="${cx - 6}" y2="18" stroke="#8898b8" stroke-width=".8"/>
    <!-- Sparkle dots -->
    <circle cx="${cx - 5}" cy="9" r="1.5" fill="white" opacity=".9"/>
    <circle cx="${cx + 4}" cy="15" r="1" fill="white" opacity=".8"/>
    <!-- Stem -->
    <line x1="${cx}" y1="20" x2="${cx}" y2="${cy - 10}" stroke="#a090b8" stroke-width="1.5"/>
    <!-- Arms up -->
    <path d="M 14 ${cy + 2} Q 10 ${cy - 4} 16 ${cy - 8}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 46 ${cy + 2} Q 50 ${cy - 4} 44 ${cy - 8}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    ${eyes(cx, cy - 4)}
    ${cheeks(cx, cy - 2)}
    ${mouthGrin(cx, cy + 4)}
  `);
}

// ─── Key → ghost mapping ──────────────────────────────────────────────────────

export const GHOST_MAP = {
  'ac':  ghostAC,
  'pm':  ghostPM,
  'pct': ghostPCT,
  'div': ghostDIV,
  '7':   ghost7,
  '8':   ghost8,
  '9':   ghost9,
  'mul': ghostMUL,
  '4':   ghost4,
  '5':   ghost5,
  '6':   ghost6,
  'sub': ghostSUB,
  '1':   ghost1,
  '2':   ghost2,
  '3':   ghost3,
  'add': ghostADD,
  'bs':  ghostBS,
  '0':   ghost0,
  'com': ghostCOM,
  'eq':  ghostEQ,
};

/**
 * Returns the SVG string for a given ghost key ID.
 */
export function getGhostSVG(id) {
  const fn = GHOST_MAP[id];
  return fn ? fn() : ghost0();
}
