/**
 * BooCalc illustrated sprite atlas.
 * Eight columns × five rows; every key is followed by its matching ghost.
 * The source image remains intact. CSS isolates each transparent frame.
 */

export const SPRITE_KEYS = [
  'ac', 'pm', 'pct', 'div',
  '7', '8', '9', 'mul',
  '4', '5', '6', 'sub',
  '1', '2', '3', 'add',
  'bs', '0', 'com', 'eq',
];

export function getSpriteFrame(id, kind = 'ghost') {
  const found = SPRITE_KEYS.indexOf(id);
  const index = found < 0 ? SPRITE_KEYS.indexOf('0') : found;
  return {
    column: (index % 4) * 2 + (kind === 'button' ? 0 : 1),
    row: Math.floor(index / 4),
  };
}

function getSpriteMarkup(id, kind) {
  const { column, row } = getSpriteFrame(id, kind);
  const x = (column / 7) * 100;
  const y = (row / 4) * 100;
  return `<span class="atlas-tile atlas-tile--${kind}" data-sprite="${SPRITE_KEYS.includes(id) ? id : '0'}" aria-hidden="true" style="--atlas-x:${x}%;--atlas-y:${y}%"></span>`;
}

export function getGhostMarkup(id) {
  return getSpriteMarkup(id, 'ghost');
}

export function getButtonMarkup(id) {
  return getSpriteMarkup(id, 'button');
}
