/**
 * BooCalc — Calculator Engine
 * Pure logic, zero DOM, no eval, no new Function.
 *
 * Design:
 *   State holds a flat `terms` array: [n0, op1, n1, op2, n2, ...]
 *   The current input `buffer` holds the in-progress right-hand operand.
 *   `waitingForOperand` is true when an operator was just entered and no
 *   new digit has been typed yet — used to detect operator replacement.
 *
 * Precedence:
 *   evalTerms does two passes: first collapses × and ÷, then + and −.
 *   Gives standard math: 2+3×4 = 14.
 *
 * Percent: operand ÷ 100. Never contextual. 50% → 0.5.
 *
 * Float precision: toPrecision(12) + parseFloat strips noise.
 *   0.1 + 0.2 = 0.3 ✓
 */

'use strict';

// ─── Operators ────────────────────────────────────────────────────────────────

export const OP_ADD = '+';
export const OP_SUB = '−';
export const OP_MUL = '×';
export const OP_DIV = '÷';

export const ERROR_DIV_ZERO = '__DIV_ZERO__';

const HIGH_PREC = new Set([OP_MUL, OP_DIV]);

// ─── Precision ────────────────────────────────────────────────────────────────

export function cleanNum(n) {
  if (!isFinite(n)) return n;
  return parseFloat(n.toPrecision(12));
}

// ─── Arithmetic ───────────────────────────────────────────────────────────────

export function applyOp(a, op, b) {
  switch (op) {
    case OP_ADD: return cleanNum(a + b);
    case OP_SUB: return cleanNum(a - b);
    case OP_MUL: return cleanNum(a * b);
    case OP_DIV: return b === 0 ? ERROR_DIV_ZERO : cleanNum(a / b);
    default:     throw new Error(`Unknown op: ${op}`);
  }
}

// ─── Evaluator ────────────────────────────────────────────────────────────────

/**
 * Evaluate [n0, op1, n1, op2, n2, ...] with standard precedence.
 * Returns a number or ERROR_DIV_ZERO.
 */
export function evalTerms(terms) {
  if (terms.length === 0)  return 0;
  if (terms.length === 1)  return cleanNum(terms[0]);

  // Pass 1: collapse × ÷ into additive terms
  const add = [];   // will hold [n, op, n, op, ...] for + − only
  let acc = terms[0];
  for (let i = 1; i < terms.length; i += 2) {
    const op  = terms[i];
    const rhs = terms[i + 1];
    if (HIGH_PREC.has(op)) {
      const r = applyOp(acc, op, rhs);
      if (r === ERROR_DIV_ZERO) return ERROR_DIV_ZERO;
      acc = r;
    } else {
      add.push(acc, op);
      acc = rhs;
    }
  }
  add.push(acc);

  // Pass 2: collapse + −
  let total = add[0];
  for (let i = 1; i < add.length; i += 2) {
    const r = applyOp(total, add[i], add[i + 1]);
    if (r === ERROR_DIV_ZERO) return ERROR_DIV_ZERO;
    total = r;
  }
  return total;
}

// ─── State ────────────────────────────────────────────────────────────────────

export function createState() {
  return {
    terms: [],             // completed expression so far: [n, op, n, op, ...]
    buffer: '0',           // current operand as a string
    waitingForOperand: false, // true right after an operator press
    justResult: false,     // true right after = press
    resultValue: null,     // numeric value when justResult
    error: false,
  };
}

// ─── Buffer helpers ───────────────────────────────────────────────────────────

function bufStr(state) { return state.buffer; }

function bufNum(state) {
  const s = state.buffer.replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// ─── Digit ────────────────────────────────────────────────────────────────────

export function inputDigit(state, digit) {
  if (!/^[0-9]$/.test(digit)) return state;
  if (state.error) return { ...createState(), buffer: digit === '0' ? '0' : digit };

  // After a completed result: start fresh
  if (state.justResult) {
    return { ...createState(), buffer: digit === '0' ? '0' : digit };
  }

  // After an operator: start a new operand
  if (state.waitingForOperand) {
    return { ...state, buffer: digit, waitingForOperand: false };
  }

  const buf = state.buffer;
  const digits = buf.replace(/[^0-9]/g, '').length;
  if (digits >= 12) return state;

  const newBuf =
    buf === '0'  ? digit :
    buf === '-0' ? '-' + digit :
    buf + digit;

  return { ...state, buffer: newBuf };
}

// ─── Decimal ──────────────────────────────────────────────────────────────────

export function inputDecimal(state) {
  if (state.error) return { ...createState(), buffer: '0.' };
  if (state.justResult) return { ...createState(), buffer: '0.' };

  if (state.waitingForOperand) {
    return { ...state, buffer: '0.', waitingForOperand: false };
  }

  if (state.buffer.includes('.')) return state;
  return { ...state, buffer: state.buffer + '.' };
}

// ─── Operator ────────────────────────────────────────────────────────────────

export function inputOperator(state, op) {
  if (state.error) return state;
  if (![OP_ADD, OP_SUB, OP_MUL, OP_DIV].includes(op)) return state;

  // After a completed result: continue from that result
  if (state.justResult) {
    return {
      ...createState(),
      terms: [bufNum(state), op],
      buffer: state.buffer,
      waitingForOperand: true,
    };
  }

  // Operator replacement: waiting for operand and have a pending op in terms
  if (state.waitingForOperand && state.terms.length > 0 && state.terms.length % 2 === 0) {
    // terms length is even means: ends with an operator (n, op, n, op, ...)
    // Wait — terms = [n, op, n, op] is length 4 (even) ending with op.
    // Replace the last op.
    const newTerms = [...state.terms.slice(0, -1), op];
    return { ...state, terms: newTerms };
  }

  // Normal: push current buffer value and new op into terms
  const n = bufNum(state);
  const newTerms = [...state.terms, n, op];
  return {
    ...state,
    terms: newTerms,
    waitingForOperand: true,
    justResult: false,
  };
}

// ─── Equals ──────────────────────────────────────────────────────────────────

export function inputEquals(state) {
  if (state.error) return state;
  if (state.justResult) return state; // idempotent

  const rhs = bufNum(state);

  let allTerms;
  if (state.terms.length === 0) {
    // No pending operation — just show current number
    allTerms = [rhs];
  } else if (state.waitingForOperand) {
    allTerms = state.terms.slice(0, -1);
  } else {
    // terms = [n0, op1, n1, op2, ...] ending with an op (odd length after adding rhs)
    allTerms = [...state.terms, rhs];
  }

  const result = evalTerms(allTerms);

  if (result === ERROR_DIV_ZERO) {
    return { ...createState(), error: true };
  }
  if (!Number.isFinite(result)) return { ...createState(), error: true, errorCode: 'RANGE' };

  const resultStr = String(result);
  return {
    ...createState(),
    buffer: resultStr,
    justResult: true,
    resultValue: result,
  };
}

// ─── Percent ─────────────────────────────────────────────────────────────────

export function inputPercent(state) {
  if (state.error) return state;
  const n = bufNum(state);
  const result = cleanNum(n / 100);
  return { ...state, buffer: String(result), waitingForOperand: false, justResult: false, resultValue: null };
}

// ─── Negate ──────────────────────────────────────────────────────────────────

export function inputNegate(state) {
  if (state.error) return state;
  if (state.waitingForOperand) return { ...state, buffer: '-0', waitingForOperand: false };
  const buf = state.buffer;
  if (buf === '0' || buf === '0.') return state;
  const newBuf = buf.startsWith('-') ? buf.slice(1) : '-' + buf;
  return { ...state, buffer: newBuf, resultValue: state.justResult ? parseFloat(newBuf) : null };
}

// ─── Backspace ───────────────────────────────────────────────────────────────

export function inputBackspace(state) {
  if (state.error) return createState();
  if (state.justResult) return createState();
  if (state.waitingForOperand) return { ...state, terms: state.terms.slice(0, -2), waitingForOperand: false };

  const buf = state.buffer;
  if (buf.length <= 1 || (buf.length === 2 && buf[0] === '-')) {
    return { ...state, buffer: '0' };
  }
  return { ...state, buffer: buf.slice(0, -1) };
}

// ─── Clear ───────────────────────────────────────────────────────────────────

export function inputClear(state) {
  return createState();
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Format a numeric string for display using locale decimal separator.
 */
export function formatDisplay(value, lang = 'es') {
  const s = String(value);
  return lang === 'es' ? s.replace('.', ',') : s;
}

/**
 * Build the expression hint shown above the main number.
 * Reflects committed terms only (not the current buffer).
 */
export function buildExprString(state, lang = 'es') {
  if (state.error || state.terms.length === 0) return '';
  const sep = lang === 'es' ? ',' : '.';
  return state.terms.map((t, i) => {
    if (typeof t === 'string') return ' ' + t + ' ';
    return String(t).replace('.', sep);
  }).join('');
}

/**
 * Get the display value string for the current state.
 */
export function getDisplayValue(state, lang = 'es') {
  if (state.error && state.errorCode === 'RANGE') return lang === 'es' ? 'Error: fuera de rango' : 'Error: out of range';
  if (state.error) {
    return lang === 'es' ? 'Error: ÷ entre 0' : 'Error: ÷ by 0';
  }
  return formatDisplay(state.buffer, lang);
}
