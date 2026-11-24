/** Illustrated bitmap frames with exact rectangles, isolation and safe padding. */
import { SPRITE_ATLASES, SPRITE_FRAMES } from './sprite-frames.js';

export const SPRITE_KEYS = [
  'ac','pm','pct','div','7','8','9','mul','4','5','6','sub',
  '1','2','3','add','bs','0','com','eq',
];
let serial = 0;
const SLOT = 208;
const MAX_CONTENT = 196;

export function getSpriteFrame(id, kind = 'ghost', lang = 'es') {
  const key = SPRITE_KEYS.includes(id) ? id : '0';
  const frameKey = key === 'com' && kind === 'button' && lang === 'en'
    ? 'com-dot:button' : `${key}:${kind}`;
  return { ...SPRITE_FRAMES[frameKey], frameKey };
}

function getSpriteMarkup(id, kind, lang = 'es') {
  const key = SPRITE_KEYS.includes(id) ? id : '0';
  const frame = getSpriteFrame(key, kind, lang);
  const sheet = SPRITE_ATLASES[frame.sheet];
  const [x,y,width,height] = frame.rect;
  const viewSize = Math.max(SLOT, Math.max(width,height) * SLOT / MAX_CONTENT);
  const viewX = x + width/2 - viewSize/2;
  const viewY = y + height/2 - viewSize/2;
  const clipId = `boo-isolate-${++serial}`;
  return `<span class="atlas-tile atlas-tile--${kind}" data-sprite="${key}" data-frame="${frame.frameKey}" aria-hidden="true"><svg viewBox="${viewX} ${viewY} ${viewSize} ${viewSize}" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><path transform="translate(${x} ${y})" d="${frame.clip}" clip-rule="evenodd"/></clipPath></defs><image href="${sheet.url}" width="${sheet.width}" height="${sheet.height}" clip-path="url(#${clipId})"/></svg></span>`;

}

export function getGhostMarkup(id) { return getSpriteMarkup(id,'ghost'); }
export function getButtonMarkup(id, lang = 'es') { return getSpriteMarkup(id,'button',lang); }
