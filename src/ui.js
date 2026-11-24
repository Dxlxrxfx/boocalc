/**
 * BooCalc — UI Layer
 * Wires DOM ↔ engine ↔ animator. Keyboard handler. i18n. Controls.
 */

'use strict';

import {
  createState, inputDigit, inputDecimal, inputOperator,
  inputEquals, inputPercent, inputNegate, inputBackspace,
  inputClear, getDisplayValue, buildExprString,
  OP_ADD, OP_SUB, OP_MUL, OP_DIV,
} from './engine.js';

import { initAnimator, flyGhost, playScene, setMotion, setLang as setAnimLang } from './animator.js';
import { getButtonMarkup, getGhostMarkup } from './ghosts.js';
import { playBoo, setBooEnabled } from './sound.js';

// ─── i18n ─────────────────────────────────────────────────────────────────────

const STRINGS = {
  es: {
    brandLine: 'Un fantasma detrás de cada número.',
    displayCaption: 'Entre números y apariciones',
    displayLabel: 'Pantalla de la calculadora',
    resultLabel: 'Resultado actual',
    keypadLabel: 'Teclado numérico',
    controlsLabel: 'Controles',
    helpTitle:    'Cómo funciona BooCalc',
    helpPct:      'Porciento: operando ÷ 100. 50% = 0,5; nunca contextual.',
    helpAdd:      '+ Suma: ¡los fantasmas rebotan de emoción!',
    helpSub:      '− Resta: los fantasmas lloran 😢',
    helpMul:      '× Multiplicación: los fantasmas se abrazan 🤗',
    helpDiv:      '÷ División: los fantasmas se agrupan',
    helpPctScene: '% Porciento: aparece el fantasma preguntón',
    helpEq:       '= Resultado: ¡los fantasmas bailan! 🎉',
    helpClose:    'Cerrar',
    motionLabel:  'Animaciones',
    soundLabel:   'Sonido',
    langLabel:    'Idioma',
    helpBtn:      'Ayuda',
    srDigit:      d => `dígito ${d}`,
    srOp:         o => `operador ${o}`,
    srEquals:     'resultado',
    srClear:      'limpiar',
    srBackspace:  'borrar',
    srDecimal:    'decimal',
    srNegate:     'cambiar signo',
    srPercent:    'porciento',
    errorMsg:     'Error: ÷ entre 0',
    acLabel:      'Limpiar todo',
    pmLabel:      'Cambiar signo',
    pctLabel:     'Porciento',
    divLabel:     'Dividir',
    mulLabel:     'Multiplicar',
    subLabel:     'Restar',
    addLabel:     'Sumar',
    bsLabel:      'Borrar último',
    decLabel:     'Separador decimal',
    eqLabel:      'Igual',
    on:           'Activado',
    off:          'Desactivado',
  },
  en: {
    brandLine: 'A little ghost behind every number.',
    displayCaption: 'Where numbers come to life',
    displayLabel: 'Calculator display',
    resultLabel: 'Current result',
    keypadLabel: 'Number keypad',
    controlsLabel: 'Controls',
    helpTitle:    'How BooCalc works',
    helpPct:      'Percent: operand ÷ 100. 50% = 0.5; never contextual.',
    helpAdd:      '+ Add: ghosts bounce excitedly!',
    helpSub:      '− Subtract: ghosts cry 😢',
    helpMul:      '× Multiply: ghosts hug 🤗',
    helpDiv:      '÷ Divide: ghosts arrange in groups',
    helpPctScene: '% Percent: the inquisitive ghost appears',
    helpEq:       '= Equals: ghosts dance! 🎉',
    helpClose:    'Close',
    motionLabel:  'Animation',
    soundLabel:   'Sound',
    langLabel:    'Language',
    helpBtn:      'Help',
    srDigit:      d => `digit ${d}`,
    srOp:         o => `operator ${o}`,
    srEquals:     'result',
    srClear:      'clear',
    srBackspace:  'backspace',
    srDecimal:    'decimal',
    srNegate:     'toggle sign',
    srPercent:    'percent',
    errorMsg:     'Error: ÷ by 0',
    acLabel:      'Clear all',
    pmLabel:      'Toggle sign',
    pctLabel:     'Percent',
    divLabel:     'Divide',
    mulLabel:     'Multiply',
    subLabel:     'Subtract',
    addLabel:     'Add',
    bsLabel:      'Backspace',
    decLabel:     'Decimal separator',
    eqLabel:      'Equals',
    on:           'On',
    off:          'Off',
  },
};

let _lang = 'es';
function t(key) { return STRINGS[_lang][key] || STRINGS.en[key] || key; }

// ─── App state ────────────────────────────────────────────────────────────────

let _calcState = createState();
let _motionOn  = true;
let _soundOn = true;
let _sceneVersion = 0;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

let _displayValue, _displayExpr, _srAnnounce;
let _overlay, _displayPanel;

// ─── Keyboard map ────────────────────────────────────────────────────────────

const KEYBOARD_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.': 'com', ',': 'com',
  '+': 'add', '-': 'sub', '*': 'mul', '/': 'div',
  'Enter': 'eq', '=': 'eq',
  'Backspace': 'bs',
  'Escape': 'ac',
  '%': 'pct',
};

// ─── Dispatch a calculator action ────────────────────────────────────────────

function dispatch(action, ghostId, keyEl) {
  const prev = _calcState;
  _calcState = action(_calcState);
  updateDisplay();

  // Animate
  if (keyEl) {
    flyGhost(keyEl, ghostId).then(() => {
      // After ghost lands, play operator scene if applicable
    });
  }
}

// ─── Key press handler ───────────────────────────────────────────────────────

function handleKey(keyId, keyEl) {
  playBoo(keyId);
  if (keyEl) {
    keyEl.classList.add('pressed');
    setTimeout(() => keyEl.classList.remove('pressed'), 110);
  }
  const ghostId = keyEl ? keyEl.dataset.ghost : keyId;

  // Helper for operator press + scene
  function doOp(op, scene) {
    const version = ++_sceneVersion;
    const prev = _calcState;
    _calcState = inputOperator(_calcState, op);
    updateDisplay();
    if (keyEl) {
      flyGhost(keyEl, ghostId).then(() => { if (version === _sceneVersion) playScene(scene, ghostId); });
    } else {
      playScene(scene, ghostId);
    }
  }

  switch (keyId) {
    case 'ac':
      _sceneVersion++;
      _calcState = inputClear(_calcState);
      updateDisplay();
      if (keyEl) flyGhost(keyEl, ghostId);
      break;
    case 'pm':
      _calcState = inputNegate(_calcState);
      updateDisplay();
      if (keyEl) flyGhost(keyEl, ghostId);
      break;
    case 'pct': {
      const version = ++_sceneVersion;
      _calcState = inputPercent(_calcState);
      updateDisplay();
      if (keyEl) {
        flyGhost(keyEl, ghostId).then(() => { if (version === _sceneVersion) playScene('pct', ghostId); });
      } else {
        playScene('pct', ghostId);
      }
      break;
    }
    case 'div': doOp(OP_DIV, 'div'); break;
    case 'mul': doOp(OP_MUL, 'mul'); break;
    case 'sub': doOp(OP_SUB, 'sub'); break;
    case 'add': doOp(OP_ADD, 'add'); break;
    case 'bs':
      _calcState = inputBackspace(_calcState);
      updateDisplay();
      if (keyEl) flyGhost(keyEl, ghostId);
      break;
    case 'com-dec':
      _calcState = inputDecimal(_calcState);
      updateDisplay();
      if (keyEl) flyGhost(keyEl, ghostId);
      break;
    case 'com':
      _calcState = inputDecimal(_calcState);
      updateDisplay();
      if (keyEl) flyGhost(keyEl, ghostId);
      break;
    case 'eq': {
      const version = ++_sceneVersion;
      _calcState = inputEquals(_calcState);
      updateDisplay();
      const eqEl = document.querySelector('[data-key="eq"]');
      const eqGhost = eqEl ? eqEl.dataset.ghost : 'eq';
      const srcEl = keyEl || eqEl;
      if (srcEl) {
        flyGhost(srcEl, eqGhost).then(() => { if (version === _sceneVersion) playScene('eq', eqGhost); });
      } else {
        playScene('eq', eqGhost);
      }
      triggerResultFlourish();
      break;
    }
    default:
      // Digit
      if (/^[0-9]$/.test(keyId)) {
        _calcState = inputDigit(_calcState, keyId);
        updateDisplay();
        if (keyEl) flyGhost(keyEl, ghostId);
      }
  }
}

// ─── Display ─────────────────────────────────────────────────────────────────

function updateDisplay() {
  const val  = getDisplayValue(_calcState, _lang);
  const expr = buildExprString(_calcState, _lang);

  _displayValue.textContent = val;
  _displayExpr.textContent  = expr;

  // Auto-shrink long numbers
  const len = val.length;
  _displayValue.style.fontSize =
    len > 14 ? '1.4rem' :
    len > 10 ? '1.8rem' :
    len > 7  ? '2.2rem' : '';

  // Screen reader
  const srText = _calcState.error ? val : (expr ? expr + ' ' + val : val);
  _srAnnounce.textContent = '';
  setTimeout(() => { _srAnnounce.textContent = srText; }, 50);
}

function triggerResultFlourish() {
  if (!_calcState.justResult) return;
  _displayValue.classList.remove('result-flourish');
  void _displayValue.offsetWidth; // reflow
  _displayValue.classList.add('result-flourish');
}

// ─── Keyboard ────────────────────────────────────────────────────────────────

function onKeyDown(e) {
  if (document.getElementById('help-popover')) return;
  if (e.target.closest?.('#controls') && (e.key === ' ' || e.key === 'Enter')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const mapped = KEYBOARD_MAP[e.key];
  if (!mapped) return;

  e.preventDefault();

  // Find matching DOM key for ghost origin
  const keyEl = document.querySelector(`[data-key="${mapped}"]`)
              || document.querySelector(`[data-key="${e.key}"]`);

  handleKey(mapped, keyEl);
}

// ─── Build keypad ─────────────────────────────────────────────────────────────

const KEY_DEFS = [
  // row 1
  { id:'ac',  label:'AC',  ghost:'ac',  cls:'key--special key--clear',    dataKey:'ac'  },
  { id:'pm',  label:'±',   ghost:'pm',  cls:'key--special',               dataKey:'pm'  },
  { id:'pct', label:'%',   ghost:'pct', cls:'key--op',                    dataKey:'pct' },
  { id:'div', label:'÷',   ghost:'div', cls:'key--op key--op-primary',    dataKey:'div' },
  // row 2
  { id:'7',   label:'7',   ghost:'7',   cls:'key--tombstone',             dataKey:'7'   },
  { id:'8',   label:'8',   ghost:'8',   cls:'key--tombstone',             dataKey:'8'   },
  { id:'9',   label:'9',   ghost:'9',   cls:'key--tombstone',             dataKey:'9'   },
  { id:'mul', label:'×',   ghost:'mul', cls:'key--op key--op-primary',    dataKey:'mul' },
  // row 3
  { id:'4',   label:'4',   ghost:'4',   cls:'key--tombstone',             dataKey:'4'   },
  { id:'5',   label:'5',   ghost:'5',   cls:'key--tombstone',             dataKey:'5'   },
  { id:'6',   label:'6',   ghost:'6',   cls:'key--tombstone',             dataKey:'6'   },
  { id:'sub', label:'−',   ghost:'sub', cls:'key--op key--op-primary',    dataKey:'sub' },
  // row 4
  { id:'1',   label:'1',   ghost:'1',   cls:'key--tombstone',             dataKey:'1'   },
  { id:'2',   label:'2',   ghost:'2',   cls:'key--tombstone',             dataKey:'2'   },
  { id:'3',   label:'3',   ghost:'3',   cls:'key--tombstone',             dataKey:'3'   },
  { id:'add', label:'+',   ghost:'add', cls:'key--op key--op-primary',    dataKey:'add' },
  // row 5
  { id:'bs',  label:'⌫',   ghost:'bs',  cls:'key--special',               dataKey:'bs'  },
  { id:'0',   label:'0',   ghost:'0',   cls:'key--tombstone',             dataKey:'0'   },
  { id:'com', label:',',   ghost:'com', cls:'key--tombstone',             dataKey:'com' },
  { id:'eq',  label:'=',   ghost:'eq',  cls:'key--op key--op-eq',         dataKey:'eq'  },
];

function getAriaLabel(def) {
  const labels = {
    ac:  () => t('acLabel'),
    pm:  () => t('pmLabel'),
    pct: () => t('pctLabel'),
    div: () => t('divLabel'),
    mul: () => t('mulLabel'),
    sub: () => t('subLabel'),
    add: () => t('addLabel'),
    bs:  () => t('bsLabel'),
    com: () => t('decLabel'),
    eq:  () => t('eqLabel'),
  };
  return labels[def.id] ? labels[def.id]() : def.label;
}

function buildKeypad(container) {
  container.innerHTML = '';
  KEY_DEFS.forEach(def => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key ' + def.cls;
    btn.dataset.key   = def.dataKey;
    btn.dataset.ghost = def.ghost;
    btn.setAttribute('aria-label', getAriaLabel(def));

    btn.innerHTML = `${getButtonMarkup(def.id)}<span class="key-label" aria-hidden="true">${def.label}</span>`;

    btn.addEventListener('click', () => handleKey(def.id, btn));
    // Touch: prevent double-fire on mobile
    btn.addEventListener('touchend', e => { e.preventDefault(); handleKey(def.id, btn); });

    container.appendChild(btn);
  });
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function buildControls(container) {
  container.innerHTML = `
    <div class="controls-row">
      <label class="ctrl-toggle">
        <span class="ctrl-label" data-i18n="motionLabel">${t('motionLabel')}</span>
        <button class="toggle-btn" id="ctrl-motion" aria-label="${t('motionLabel')}" aria-pressed="true" type="button">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-text" data-i18n-on="on" data-i18n-off="off">${t('on')}</span>
        </button>
      </label>
      <label class="ctrl-toggle">
        <span class="ctrl-label" data-i18n="soundLabel">${t('soundLabel')}</span>
        <button class="toggle-btn" id="ctrl-sound" aria-label="${t('soundLabel')}" aria-pressed="${_soundOn}" type="button">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-text">${_soundOn ? t('on') : t('off')}</span>
        </button>
      </label>
      <label class="ctrl-toggle">
        <span class="ctrl-label" data-i18n="langLabel">${t('langLabel')}</span>
        <button class="toggle-btn" id="ctrl-lang" aria-label="${t('langLabel')}" aria-pressed="${_lang === 'en'}" type="button">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-text" id="ctrl-lang-text">${_lang.toUpperCase()}</span>
        </button>
      </label>
      <button class="help-btn" id="ctrl-help" type="button">${t('helpBtn')} 👻</button>
    </div>
  `;

  document.getElementById('ctrl-motion').addEventListener('click', function() {
    _motionOn = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !_motionOn;
    setMotion(_motionOn);
    this.setAttribute('aria-pressed', String(_motionOn));
    this.querySelector('.toggle-text').textContent = _motionOn ? t('on') : t('off');
    this.closest('.ctrl-toggle').classList.toggle('toggle-off', !_motionOn);
  });


  document.getElementById('ctrl-sound').addEventListener('click', function() {
    _soundOn = !_soundOn;
    setBooEnabled(_soundOn);
    this.setAttribute('aria-pressed', String(_soundOn));
    this.querySelector('.toggle-text').textContent = _soundOn ? t('on') : t('off');
    this.closest('.ctrl-toggle').classList.toggle('toggle-off', !_soundOn);
    try { localStorage.setItem('booCalcSound', _soundOn ? 'on' : 'off'); } catch (_) {}
  });

  document.getElementById('ctrl-lang').addEventListener('click', function() {
    _lang = _lang === 'es' ? 'en' : 'es';
    setAnimLang(_lang);
    try { localStorage.setItem('booCalcLang', _lang); } catch(e) {}
    this.setAttribute('aria-pressed', String(_lang === 'en'));
    document.getElementById('ctrl-lang-text').textContent = _lang.toUpperCase();
    refreshI18n();
  });

  document.getElementById('ctrl-help').addEventListener('click', showHelp);
}

function refreshI18n() {
  document.documentElement.lang = _lang;
  _displayPanel.dataset.caption = t('displayCaption');
  _displayPanel.setAttribute('aria-label', t('displayLabel'));
  _displayValue.setAttribute('aria-label', t('resultLabel'));
  document.getElementById('keypad').setAttribute('aria-label', t('keypadLabel'));
  document.getElementById('controls').setAttribute('aria-label', t('controlsLabel'));
  updateDisplay();
  // Update all aria-labels on keys
  document.querySelectorAll('.key').forEach(btn => {
    const id = btn.dataset.key;
    const def = KEY_DEFS.find(d => d.dataKey === id);
    if (def) btn.setAttribute('aria-label', getAriaLabel(def));
  });
  // Update control labels
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.getElementById('ctrl-help').textContent = t('helpBtn') + ' 👻';
  document.getElementById('ctrl-motion').setAttribute('aria-label', t('motionLabel'));
  document.getElementById('ctrl-lang').setAttribute('aria-label', t('langLabel'));
  document.getElementById('ctrl-motion').querySelector('.toggle-text').textContent = _motionOn ? t('on') : t('off');
  document.getElementById('ctrl-sound').setAttribute('aria-label', t('soundLabel'));
  document.getElementById('ctrl-sound').querySelector('.toggle-text').textContent = _soundOn ? t('on') : t('off');
  document.querySelector('[data-key="com"] .key-label').textContent = _lang === 'es' ? ',' : '.';
}

// ─── Help popover ─────────────────────────────────────────────────────────────

function showHelp() {
  const existing = document.getElementById('help-popover');
  if (existing) { existing.remove(); return; }

  const pop = document.createElement('div');
  pop.id = 'help-popover';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-modal', 'true');
  pop.setAttribute('aria-labelledby', 'help-title');
  pop.innerHTML = `
    <div class="help-content">
      <h2 id="help-title">${t('helpTitle')}</h2>
      <ul>
        <li>📐 ${t('helpPct')}</li>
        <li>🎉 ${t('helpAdd')}</li>
        <li>😢 ${t('helpSub')}</li>
        <li>🤗 ${t('helpMul')}</li>
        <li>👥 ${t('helpDiv')}</li>
        <li>👻 ${t('helpPctScene')}</li>
        <li>💃 ${t('helpEq')}</li>
      </ul>
      <button class="help-close" type="button">${t('helpClose')}</button>
    </div>
  `;
  document.body.appendChild(pop);
  const closeHelp = () => {
    pop.remove();
    document.getElementById('ctrl-help').focus();
  };
  pop.querySelector('.help-close').addEventListener('click', closeHelp);
  pop.addEventListener('click', e => { if (e.target === pop) closeHelp(); });

  // Focus trap
  const closeBtn = pop.querySelector('.help-close');
  closeBtn.focus();
  pop.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeHelp(); }
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

export function init() {
  // Restore language
  try {
    const saved = localStorage.getItem('booCalcLang');
    if (saved === 'en' || saved === 'es') _lang = saved;
    _soundOn = localStorage.getItem('booCalcSound') !== 'off';
  } catch(e) {}
  setBooEnabled(_soundOn);

  // DOM elements
  _displayValue = document.getElementById('display-value');
  _displayExpr  = document.getElementById('display-expr');
  _srAnnounce   = document.getElementById('sr-announce');
  _overlay      = document.getElementById('ghost-overlay');
  _displayPanel = document.getElementById('display-panel');

  // Build UI
  buildKeypad(document.getElementById('keypad'));
  buildControls(document.getElementById('controls'));
  document.querySelector('.brand-ghost').innerHTML = getGhostMarkup('2');

  // Init animator
  initAnimator(_overlay, _displayPanel, _lang);
  setMotion(_motionOn);

  // Keyboard
  document.addEventListener('keydown', onKeyDown);

  // Initial display
  refreshI18n();

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    _motionOn = false;
    setMotion(false);
    const btn = document.getElementById('ctrl-motion');
    if (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.querySelector('.toggle-text').textContent = t('off');
      btn.closest('.ctrl-toggle').classList.add('toggle-off');
    }
  }
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (!event.matches) return;
    _motionOn = false;
    setMotion(false);
    const btn = document.getElementById('ctrl-motion');
    btn.setAttribute('aria-pressed', 'false');
    btn.querySelector('.toggle-text').textContent = t('off');
    btn.closest('.ctrl-toggle').classList.add('toggle-off');
  });
}
