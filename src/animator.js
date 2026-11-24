/**
 * BooCalc — Animator
 * Handles ghost flight from key → display and all six emotion scenes.
 * Runs on a pointer-events:none overlay. Respects reduced-motion preference.
 */

'use strict';

import { getGhostMarkup } from './ghosts.js';

// ─── State ────────────────────────────────────────────────────────────────────

const MAX_SPRITES = 12;
const GHOST_SIZE = 72;
let _motionEnabled = true;
let _liveSprites = 0;
let _overlay = null;
let _displayEl = null;
let _lang = 'es';
const _recentGhosts = [];

// ─── Initialise ───────────────────────────────────────────────────────────────

/**
 * Call once after DOM ready.
 * overlay: the pointer-events:none animation layer element
 * displayEl: the .display-panel element (flight destination)
 */
export function initAnimator(overlay, displayEl, lang = 'es') {
  _overlay = overlay;
  _displayEl = displayEl;
  _lang = lang;

  // Respect OS preference
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) _motionEnabled = false;
  mq.addEventListener('change', e => {
    if (e.matches) _motionEnabled = false;
  });
}

export function setMotion(enabled) {
  // If OS says reduce motion, honour it even if user toggles on
  const osPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  _motionEnabled = enabled && !osPref;
  if (!_motionEnabled && _overlay) {
    // Clear any live sprites when motion is disabled
    Array.from(_overlay.querySelectorAll('.ghost-sprite')).forEach(el => removeSprite(el));
  }
}

export function setLang(lang) {
  _lang = lang;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function overlayOffset() {
  if (!_overlay) return { x: 0, y: 0 };
  const r = _overlay.getBoundingClientRect();
  return { x: r.left, y: r.top };
}

function createSprite(ghostId) {
  const div = document.createElement('div');
  div.className = 'ghost-sprite';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = getGhostMarkup(ghostId);
  _overlay.appendChild(div);
  _liveSprites++;
  div.addEventListener('animationend', () => removeSprite(div), { once: true });
  return div;
}

function removeSprite(el) {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
    _liveSprites = Math.max(0, _liveSprites - 1);
  }
}

function makeRoom(count) {
  if (!_overlay) return;
  while (_liveSprites + count > MAX_SPRITES) {
    const oldest = _overlay.querySelector('.ghost-sprite:not(.ghost-flight)') || _overlay.querySelector('.ghost-sprite');
    if (!oldest) { _liveSprites = 0; break; }
    removeSprite(oldest);
  }
}

function placeSpriteAt(sprite, x, y) {
  // x, y relative to overlay
  sprite.style.left = (x - GHOST_SIZE / 2) + 'px';
  sprite.style.top  = (y - GHOST_SIZE / 2) + 'px';
}

// ─── Flight animation ─────────────────────────────────────────────────────────

/**
 * Fly a ghost from keyEl to the display.
 * @param {Element} keyEl  — the pressed button
 * @param {string}  ghostId — ghost variant key
 * @returns {Promise<void>}
 */
export function flyGhost(keyEl, ghostId) {
  if (!_recentGhosts.includes(ghostId)) _recentGhosts.push(ghostId);
  else { _recentGhosts.splice(_recentGhosts.indexOf(ghostId), 1); _recentGhosts.push(ghostId); }
  if (_recentGhosts.length > 10) _recentGhosts.shift();
  if (!_motionEnabled || !_overlay || !_displayEl) return Promise.resolve();
  makeRoom(1);

  const off = overlayOffset();
  const from = centerOf(keyEl);
  const displayRect = _displayEl.getBoundingClientRect();
  const to = {x: displayRect.left + displayRect.width / 2, y: displayRect.top + displayRect.height * .43};

  const startX = from.x - off.x;
  const startY = from.y - off.y;
  const endX   = to.x   - off.x;
  const endY   = to.y   - off.y;

  // Arc midpoint — curve upward
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 60;

  const sprite = createSprite(ghostId);
  sprite.classList.add('ghost-flight');
  placeSpriteAt(sprite, startX, startY);
  sprite.style.opacity = '1';
  sprite.style.transform = 'scale(1)';

  const duration = 760;
  let startedAt = null;

  return new Promise(resolve => {
    const tick = now => {
      if (!sprite.parentNode) { resolve(); return; }
      if (startedAt === null) startedAt = now;
      const t = Math.min(1, (now - startedAt) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Quadratic bezier
      const x = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * midX + ease * ease * endX;
      const y = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * midY + ease * ease * endY;

      placeSpriteAt(sprite, x, y);

      // Spin during flight
      const rot = ease * 360;
      const scale = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2 * 0.9;
      sprite.style.transform = `rotate(${rot}deg) scale(${scale})`;
      sprite.style.opacity = t < 0.8 ? '1' : String(1 - (t - 0.8) / 0.2);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // Evaporate
        sprite.style.transition = 'opacity 0.15s, transform 0.15s';
        sprite.style.opacity = '0';
        sprite.style.transform = 'scale(0)';
        setTimeout(() => { removeSprite(sprite); resolve(); }, 160);
      }
    };
    requestAnimationFrame(tick);
  });
}

// ─── Emotion scenes ───────────────────────────────────────────────────────────

/**
 * Run an emotion scene in the display area after the base ghost lands.
 * scene: 'add' | 'sub' | 'mul' | 'div' | 'pct' | 'eq'
 */
export function playScene(scene, ghostId) {
  if (!_motionEnabled || !_overlay || !_displayEl) return;
  Array.from(_overlay.querySelectorAll('.ghost-sprite:not(.ghost-flight)')).forEach(removeSprite);
  makeRoom(scene === 'sub' ? 8 : scene === 'div' ? 6 : 3);

  switch (scene) {
    case 'add': sceneAdd(ghostId); break;
    case 'sub': sceneSub(ghostId); break;
    case 'mul': sceneMul(ghostId); break;
    case 'div': sceneDiv(ghostId); break;
    case 'pct': scenePct(ghostId); break;
    case 'eq':  sceneEq(ghostId);  break;
  }
}

function displayCenter() {
  const off = overlayOffset();
  const r = _displayEl.getBoundingClientRect();
  const c = {x:r.left + r.width / 2,y:r.top + r.height * .43};
  return { x: c.x - off.x, y: c.y - off.y };
}

function companion(index, fallback) {
  const others = _recentGhosts.filter(id => id !== fallback).reverse();
  return others[index % Math.max(1, others.length)] || ['0', '2', '8', '3'][index % 4];
}

// Helper: spawn a ghost at a display-relative position with CSS animation class
function spawnAt(ghostId, x, y, cls, delay = 0) {
  if (_liveSprites >= MAX_SPRITES) return null;
  const sprite = createSprite(ghostId);
  placeSpriteAt(sprite, x, y);
  sprite.style.animationDelay = delay + 'ms';
  sprite.classList.add(...cls.split(/\s+/));
  // Auto-remove after animation
  setTimeout(() => removeSprite(sprite), delay + 1800);
  return sprite;
}

/** + bounce scene: 3 ghosts bounce excitedly in the display */
function sceneAdd(ghostId) {
  const c = displayCenter();
  const r = _displayEl.getBoundingClientRect();
  const w = r.width;
  spawnAt(ghostId, c.x - w * 0.25, c.y, 'scene-bounce', 0);
  spawnAt(companion(0, ghostId), c.x, c.y, 'scene-bounce', 120);
  spawnAt(companion(1, ghostId), c.x + w * 0.25, c.y, 'scene-bounce', 240);
}

/** − cry scene: ghosts with tears visible, slight shake */
function sceneSub(ghostId) {
  const c = displayCenter();
  const r = _displayEl.getBoundingClientRect();
  const w = r.width;
  spawnAt(ghostId, c.x - w * 0.2, c.y, 'scene-cry', 0);
  spawnAt(companion(0, ghostId), c.x + w * 0.2, c.y, 'scene-cry', 180);
  // Tear drops
  _spawnTears(c.x - w * 0.2, c.y);
  _spawnTears(c.x + w * 0.2, c.y);
}

function _spawnTears(gx, gy) {
  for (let i = 0; i < 3; i++) {
    if (_liveSprites >= MAX_SPRITES) break;
    const tear = document.createElement('div');
    tear.className = 'ghost-sprite tear-drop';
    tear.setAttribute('aria-hidden', 'true');
    tear.innerHTML = `<svg viewBox="0 0 10 14" width="10" height="14">
      <ellipse cx="5" cy="8" rx="4" ry="5" fill="#80b8e8" opacity=".85"/>
      <path d="M5,2 Q7,5 5,8 Q3,5 5,2Z" fill="#a0d0f4" opacity=".7"/>
    </svg>`;
    tear.style.left = (gx - 5 + (i - 1) * 8) + 'px';
    tear.style.top  = (gy - 10) + 'px';
    tear.style.animationDelay = (i * 150) + 'ms';
    _overlay.appendChild(tear);
    _liveSprites++;
    setTimeout(() => removeSprite(tear), 1500);
  }
}

/** × hug scene: two ghosts move toward each other */
function sceneMul(ghostId) {
  const c = displayCenter();
  const r = _displayEl.getBoundingClientRect();
  const w = r.width;
  const left  = spawnAt(ghostId, c.x - w * 0.3, c.y, 'scene-hug-left',  0);
  const right = spawnAt(companion(0, ghostId), c.x + w * 0.3, c.y, 'scene-hug-right', 0);
  left?.style.setProperty('--hug-dx', Math.max(20,w * .3 - 18) + 'px');
  right?.style.setProperty('--hug-dx', Math.max(20,w * .3 - 18) + 'px');
}

/** ÷ groups: two visible little huddles, three companions in each. */
function sceneDiv(ghostId) {
  const c = displayCenter();
  const r = _displayEl.getBoundingClientRect();
  const w = Math.min(76, r.width * 0.22);
  for (let group = 0; group < 2; group++) {
    for (let member = 0; member < 3; member++) {
      const x = c.x + (group ? w : -w) + (member - 1) * 19;
      const y = c.y + (member === 1 ? -15 : 8);
      const sprite = spawnAt(member === 0 ? ghostId : companion(group * 2 + member - 1, ghostId), x, y, 'scene-group', group * 100 + member * 70);
      sprite?.style.setProperty('--group-from', (group ? 55 : -55) + 'px');
    }
  }
}

/** % joke: central ghost with speech bubble */
function scenePct() {
  if (!_motionEnabled || !_overlay) return;
  if (_liveSprites >= MAX_SPRITES) return;

  const off = overlayOffset();
  // Center of viewport
  const vx = window.innerWidth  / 2 - off.x;
  const vy = window.innerHeight / 2 - off.y;

  const container = document.createElement('div');
  container.className = 'ghost-sprite scene-pct-container';
  container.setAttribute('aria-hidden', 'true');

  const jokeText = _lang === 'es'
    ? 'Esperabas que hiciera algo?'
    : 'Were you expecting me to do something?';

  container.innerHTML = `
    <div class="pct-bubble">${jokeText}</div>
    ${getGhostMarkup('pct')}
  `;
  container.style.left = (vx - 107.5) + 'px';
  container.style.top  = (vy - 90) + 'px';
  _overlay.appendChild(container);
  _liveSprites++;
  setTimeout(() => removeSprite(container), 2800);
}

/** = dance: 3 ghosts orbit, result flourish handled by ui.js */
function sceneEq(ghostId) {
  const c = displayCenter();
  const r = _displayEl.getBoundingClientRect();
  const w = r.width;

  // Three ghosts at different orbit starting positions
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const rx = Math.cos(angle) * w * 0.28;
    const ry = Math.sin(angle) * 20;
    spawnAt(i === 0 ? ghostId : companion(i - 1, ghostId), c.x + rx, c.y + ry, `scene-dance scene-dance-${i}`, i * 100);
  }
}
