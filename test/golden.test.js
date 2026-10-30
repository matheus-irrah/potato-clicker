import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, getPps } from '../src/game/engine.js';
import {
  FRENZY_DURATION_MS, GOLDEN_LIFETIME_MS, GOLDEN_MAX_DELAY_MS, GOLDEN_MIN_DELAY_MS,
  clickGolden, isGoldenVisible, updateGolden,
} from '../src/game/golden.js';

const T0 = 1_000_000;
const always = (v) => () => v;

test('first update schedules a spawn 60-180 s out', () => {
  for (const r of [0, 0.5, 0.999]) {
    const s = createState();
    updateGolden(s, T0, always(r));
    const delay = s.golden.nextAt - T0;
    assert.ok(delay >= GOLDEN_MIN_DELAY_MS && delay <= GOLDEN_MAX_DELAY_MS, `delay ${delay}`);
  }
});

test('spawns when due, then expires after 12 s and reschedules', () => {
  const s = createState();
  updateGolden(s, T0, always(0));
  const spawnAt = T0 + GOLDEN_MIN_DELAY_MS;
  assert.equal(updateGolden(s, spawnAt - 1), null);
  assert.equal(updateGolden(s, spawnAt), 'spawned');
  assert.ok(isGoldenVisible(s, spawnAt));
  assert.equal(updateGolden(s, spawnAt + GOLDEN_LIFETIME_MS - 1), null);
  const expireAt = spawnAt + GOLDEN_LIFETIME_MS;
  assert.equal(updateGolden(s, expireAt, always(0.5)), 'expired');
  assert.ok(!isGoldenVisible(s, expireAt));
  const delay = s.golden.nextAt - expireAt;
  assert.ok(delay >= GOLDEN_MIN_DELAY_MS && delay <= GOLDEN_MAX_DELAY_MS);
});

function spawned(state) {
  updateGolden(state, T0, always(0));
  updateGolden(state, T0 + GOLDEN_MIN_DELAY_MS);
  return T0 + GOLDEN_MIN_DELAY_MS;
}

test('clicking when nothing is visible does nothing', () => {
  const s = createState();
  assert.equal(clickGolden(s, T0), null);
});

test('Frenzy multiplies PPS by 7 for 30 s', () => {
  const s = createState();
  s.producers.farmer = 10;
  const now = spawned(s);
  assert.deepEqual(clickGolden(s, now, always(0.1)), { type: 'frenzy' });
  assert.equal(getPps(s, now), 70);
  assert.equal(getPps(s, now + FRENZY_DURATION_MS - 1), 70);
  assert.equal(getPps(s, now + FRENZY_DURATION_MS), 10);
  assert.ok(!isGoldenVisible(s, now));
});

test('second Frenzy restarts the timer instead of stacking', () => {
  const s = createState();
  s.producers.farmer = 10;
  s.frenzyUntil = T0 + 5_000;
  s.golden = { nextAt: T0, visibleUntil: T0 + GOLDEN_LIFETIME_MS };
  clickGolden(s, T0, always(0.1));
  assert.equal(s.frenzyUntil, T0 + FRENZY_DURATION_MS);
  assert.equal(getPps(s, T0), 70);
});

test('Lucky Harvest capped by bank', () => {
  const s = createState();
  s.bank = 1000;
  s.producers.farmer = 100;
  const now = spawned(s);
  const result = clickGolden(s, now, always(0.9));
  assert.equal(result.type, 'lucky');
  assert.equal(result.amount, 113);
  assert.equal(s.bank, 1113);
});

test('Lucky Harvest capped by 900 s of production', () => {
  const s = createState();
  s.bank = 1e9;
  s.producers.farmer = 1;
  const now = spawned(s);
  assert.equal(clickGolden(s, now, always(0.9)).amount, 913);
});
