import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_SCRIPT, getDemoDurationMs } from '../src/demo.js';
import { createState, inputClear, inputDigit, inputDecimal, inputOperator, inputEquals, inputPercent, getDisplayValue } from '../src/engine.js';

test('the continuous demo computes its advertised results with the real engine', () => {
  let state = createState();
  const operators = { add: '+', sub: '−', mul: '×', div: '÷' };
  let checks = 0;
  for (const scene of DEMO_SCRIPT) {
    for (const action of scene.actions) {
      if (!action.key) continue;
      if (action.key === 'ac') state = inputClear(state);
      else if (action.key === 'eq') state = inputEquals(state);
      else if (action.key === 'pct') state = inputPercent(state);
      else if (action.key === 'com') state = inputDecimal(state);
      else if (operators[action.key]) state = inputOperator(state, operators[action.key]);
      else state = inputDigit(state, action.key);
    }
    if (scene.expect !== undefined) {
      assert.equal(getDisplayValue(state, 'en'), scene.expect, scene.title);
      checks++;
    }
  }
  assert.equal(checks, 9);
});

test('the presentation fits the contest limit and leaves time for every full reaction', () => {
  assert.ok(getDemoDurationMs() > 60000 && getDemoDurationMs() < 150000);
  const required = { add: 3400, sub: 3400, mul: 3300, div: 4000, pct: 5100, eq: 4000 };
  for (const [reaction, minimum] of Object.entries(required)) {
    const scene = DEMO_SCRIPT.find(item => item.reaction === reaction);
    assert.ok(scene, reaction);
    assert.ok(scene.actions.some(action => action.key === reaction && action.wait >= minimum), reaction);
  }
});
