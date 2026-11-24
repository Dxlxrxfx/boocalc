/**
 * BooCalc — Engine Tests
 * Uses Node built-in test runner (node:test).
 * Run: node --test tests/engine.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createState,
  inputDigit,
  inputDecimal,
  inputOperator,
  inputEquals,
  inputPercent,
  inputNegate,
  inputBackspace,
  inputClear,
  applyOp,
  evalTerms,
  cleanNum,
  getDisplayValue,
  buildExprString,
  formatDisplay,
  ERROR_DIV_ZERO,
  OP_ADD, OP_SUB, OP_MUL, OP_DIV,
} from '../src/engine.js';

// ─── Helper: sequence of actions → state ─────────────────────────────────────

function seq(actions) {
  let s = createState();
  for (const a of actions) s = a(s);
  return s;
}

function digit(d) { return s => inputDigit(s, d); }
function dec()    { return s => inputDecimal(s); }
function op(o)    { return s => inputOperator(s, o); }
function eq()     { return s => inputEquals(s); }
function pct()    { return s => inputPercent(s); }
function neg()    { return s => inputNegate(s); }
function bs()     { return s => inputBackspace(s); }
function clr()    { return s => inputClear(s); }

function displayNum(state) {
  const v = getDisplayValue(state, 'en');
  return parseFloat(v.replace(',', '.'));
}

// ─── cleanNum ─────────────────────────────────────────────────────────────────

test('cleanNum removes float noise', () => {
  assert.equal(cleanNum(0.1 + 0.2), 0.3);
  assert.equal(cleanNum(1.0000000000001), 1);
});

// ─── applyOp ──────────────────────────────────────────────────────────────────

test('applyOp basic', () => {
  assert.equal(applyOp(2, OP_ADD, 3), 5);
  assert.equal(applyOp(9, OP_SUB, 12), -3);
  assert.equal(applyOp(1.5, OP_MUL, 4), 6);
  assert.equal(applyOp(12, OP_DIV, 4), 3);
});

test('applyOp division by zero', () => {
  assert.equal(applyOp(5, OP_DIV, 0), ERROR_DIV_ZERO);
});

// ─── evalTerms ────────────────────────────────────────────────────────────────

test('evalTerms simple add', () => {
  assert.equal(evalTerms([2, OP_ADD, 3]), 5);
});

test('evalTerms precedence 2+3×4=14', () => {
  assert.equal(evalTerms([2, OP_ADD, 3, OP_MUL, 4]), 14);
});

test('evalTerms precedence 9−12=−3', () => {
  assert.equal(evalTerms([9, OP_SUB, 12]), -3);
});

test('evalTerms 1.5×4=6', () => {
  assert.equal(evalTerms([1.5, OP_MUL, 4]), 6);
});

test('evalTerms 12÷4=3', () => {
  assert.equal(evalTerms([12, OP_DIV, 4]), 3);
});

test('evalTerms division by zero propagates', () => {
  assert.equal(evalTerms([5, OP_DIV, 0]), ERROR_DIV_ZERO);
});

test('evalTerms 0.1+0.2=0.3', () => {
  assert.equal(evalTerms([0.1, OP_ADD, 0.2]), 0.3);
});

// ─── Acceptance cases ─────────────────────────────────────────────────────────

test('acceptance: 2+3=5', () => {
  const s = seq([digit('2'), op(OP_ADD), digit('3'), eq()]);
  assert.equal(displayNum(s), 5);
  assert.ok(s.justResult);
});

test('acceptance: 9−12=−3', () => {
  const s = seq([digit('9'), op(OP_SUB), digit('1'), digit('2'), eq()]);
  assert.equal(displayNum(s), -3);
});

test('acceptance: 1.5×4=6', () => {
  const s = seq([digit('1'), dec(), digit('5'), op(OP_MUL), digit('4'), eq()]);
  assert.equal(displayNum(s), 6);
});

test('acceptance: 12÷4=3', () => {
  const s = seq([digit('1'), digit('2'), op(OP_DIV), digit('4'), eq()]);
  assert.equal(displayNum(s), 3);
});

test('acceptance: 2+3×4=14 (precedence)', () => {
  const s = seq([digit('2'), op(OP_ADD), digit('3'), op(OP_MUL), digit('4'), eq()]);
  assert.equal(displayNum(s), 14);
});

test('acceptance: 0.1+0.2=0.3', () => {
  const s = seq([digit('0'), dec(), digit('1'), op(OP_ADD), digit('0'), dec(), digit('2'), eq()]);
  assert.equal(displayNum(s), 0.3);
});

// ─── Percent ──────────────────────────────────────────────────────────────────

test('50% = 0.5', () => {
  const s = seq([digit('5'), digit('0'), pct()]);
  assert.equal(displayNum(s), 0.5);
});

test('200+10% = 200.1 (percent is always /100, not contextual)', () => {
  // 10% = 0.1, then 200 + 0.1 = 200.1
  const s = seq([digit('2'), digit('0'), digit('0'), op(OP_ADD), digit('1'), digit('0'), pct(), eq()]);
  assert.equal(displayNum(s), 200.1);
});

// ─── Division by zero ────────────────────────────────────────────────────────

test('division by zero sets error state', () => {
  const s = seq([digit('5'), op(OP_DIV), digit('0'), eq()]);
  assert.ok(s.error);
});

test('error message shown', () => {
  const s = seq([digit('5'), op(OP_DIV), digit('0'), eq()]);
  assert.ok(getDisplayValue(s, 'es').startsWith('Error'));
  assert.ok(getDisplayValue(s, 'en').startsWith('Error'));
});

test('AC recovers from error', () => {
  const s = seq([digit('5'), op(OP_DIV), digit('0'), eq(), clr()]);
  assert.ok(!s.error);
  assert.equal(s.buffer, '0');
});

// ─── Operator replacement ────────────────────────────────────────────────────

test('operator replacement: 2,+,×,3,= → 6', () => {
  const s = seq([digit('2'), op(OP_ADD), op(OP_MUL), digit('3'), eq()]);
  assert.equal(displayNum(s), 6);
});

// ─── Negation ────────────────────────────────────────────────────────────────

test('negate positive → negative', () => {
  const s = seq([digit('5'), neg()]);
  assert.equal(displayNum(s), -5);
});

test('negate negative → positive', () => {
  const s = seq([digit('5'), neg(), neg()]);
  assert.equal(displayNum(s), 5);
});

test('negate zero stays zero', () => {
  const s = seq([neg()]);
  assert.equal(displayNum(s), 0);
});

test('negative input: −3+9=6 using negate after digit', () => {
  const s = seq([digit('3'), neg(), op(OP_ADD), digit('9'), eq()]);
  assert.equal(displayNum(s), 6);
});

// ─── Fresh result / continue ─────────────────────────────────────────────────

test('fresh digit after result starts new calculation', () => {
  const s = seq([digit('2'), op(OP_ADD), digit('3'), eq(), digit('7')]);
  assert.equal(displayNum(s), 7);
  assert.ok(!s.justResult);
});

test('operator after result continues with result', () => {
  const s = seq([digit('2'), op(OP_ADD), digit('3'), eq(), op(OP_MUL), digit('4'), eq()]);
  assert.equal(displayNum(s), 20);
});

// ─── Backspace ───────────────────────────────────────────────────────────────

test('backspace removes last digit', () => {
  const s = seq([digit('1'), digit('2'), digit('3'), bs()]);
  assert.equal(displayNum(s), 12);
});

test('backspace on single digit gives 0', () => {
  const s = seq([digit('5'), bs()]);
  assert.equal(displayNum(s), 0);
});

test('backspace after result clears to 0', () => {
  const s = seq([digit('5'), eq(), bs()]);
  assert.equal(displayNum(s), 0);
});

// ─── Decimal ─────────────────────────────────────────────────────────────────

test('decimal only once', () => {
  const s = seq([digit('1'), dec(), dec(), digit('5')]);
  assert.equal(displayNum(s), 1.5);
});

test('comma and dot both work as decimal', () => {
  // inputDecimal handles both — here we just call inputDecimal
  const s = seq([digit('3'), dec(), digit('1'), digit('4')]);
  assert.equal(displayNum(s), 3.14);
});

// ─── Chained operations ───────────────────────────────────────────────────────

test('chained: 2+3=5 then ×4=20', () => {
  const s = seq([digit('2'), op(OP_ADD), digit('3'), eq(), op(OP_MUL), digit('4'), eq()]);
  assert.equal(displayNum(s), 20);
});

// ─── Clear ───────────────────────────────────────────────────────────────────

test('AC resets state', () => {
  const s = seq([digit('9'), digit('9'), op(OP_ADD), digit('1'), clr()]);
  assert.equal(displayNum(s), 0);
  assert.equal(s.terms.length, 0);
});

// ─── Display format ──────────────────────────────────────────────────────────

test('formatDisplay uses comma for ES', () => {
  assert.equal(formatDisplay('3.14', 'es'), '3,14');
});

test('formatDisplay uses dot for EN', () => {
  assert.equal(formatDisplay('3.14', 'en'), '3.14');
});

test('buildExprString with pending op', () => {
  const s = seq([digit('2'), op(OP_ADD)]);
  const expr = buildExprString(s, 'en');
  assert.ok(expr.includes('2'));
  assert.ok(expr.includes('+'));
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

test('no input before operator uses 0', () => {
  // Start fresh, press op immediately → should handle gracefully
  const s = seq([op(OP_ADD), digit('5'), eq()]);
  assert.equal(displayNum(s), 5);
});

test('double equals is no-op', () => {
  const s = seq([digit('4'), op(OP_ADD), digit('2'), eq(), eq()]);
  assert.equal(displayNum(s), 6);
});
