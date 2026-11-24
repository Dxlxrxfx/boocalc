// Independent review regressions added by ChatGPT after running Kiro's tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as calc from '../src/engine.js';

function run(keys) {
  let state = calc.createState();
  for (const key of keys) {
    if (/^[0-9]$/.test(key)) state = calc.inputDigit(state, key);
    else if (key === '.') state = calc.inputDecimal(state);
    else if (key === '=') state = calc.inputEquals(state);
    else if (key === '±') state = calc.inputNegate(state);
    else if (key === '%') state = calc.inputPercent(state);
    else if (key === '⌫') state = calc.inputBackspace(state);
    else state = calc.inputOperator(state, key);
  }
  return state;
}

for (const [keys, expected] of [
  ['2+0×3=', 2],
  ['20÷5×2=', 8],
  ['8−2×3+4=', 6],
  ['2+.5=', 2.5],
  ['2+3=±×4=', -20],
  ['2+⌫3=', 23],
  ['2+3×=', 5],
  ['5÷0=7', 7],
  ['2+±3=', -1],
  ['10−0=', 10],
]) {
  test(`review: ${keys} produces ${expected}`, () => {
    const state = run(keys);
    assert.equal(state.error, false);
    assert.equal(Number(state.buffer), expected);
  });
}

test('overflow becomes a readable range error', () => {
  const state = run(Array(30).fill('999999999999').join('×') + '=');
  assert.equal(state.error, true);
  assert.equal(calc.getDisplayValue(state, 'es'), 'Error: fuera de rango');
});
