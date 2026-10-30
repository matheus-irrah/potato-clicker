import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/game/engine.js';
import {
  SAVE_KEY, applyOfflineEarnings, clearSave, decodeSave, deserialize,
  encodeSave, loadGame, saveGame, serialize,
} from '../src/game/save.js';

const T0 = 1_700_000_000_000;

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

function sampleState() {
  const s = createState();
  s.bank = 500;
  s.totalEarned = 800;
  s.clicks = 42;
  s.producers.peeler = 3;
  s.upgrades.add('hands');
  s.frenzyUntil = T0 + 10_000;
  s.golden = { nextAt: T0, visibleUntil: T0 + 5_000 };
  return s;
}

test('reload keeps progress but not temporary effects', () => {
  const storage = memoryStorage();
  saveGame(storage, sampleState(), T0);
  const { state } = loadGame(storage, T0);
  assert.equal(state.bank, 500);
  assert.equal(state.totalEarned, 800);
  assert.equal(state.clicks, 42);
  assert.equal(state.producers.peeler, 3);
  assert.deepEqual([...state.upgrades], ['hands']);
  assert.equal(state.frenzyUntil, 0);
  assert.deepEqual(state.golden, { nextAt: 0, visibleUntil: 0 });
});

test('saved data excludes temporary effects', () => {
  const data = serialize(sampleState(), T0);
  assert.ok(!('frenzyUntil' in data));
  assert.ok(!('golden' in data));
  assert.equal(data.savedAt, T0);
});

test('no save starts a new game', () => {
  const { state, offline } = loadGame(memoryStorage(), T0);
  assert.deepEqual(state, createState());
  assert.equal(offline, 0);
});

test('corrupt save starts a new game', () => {
  for (const raw of ['{not json', '"hello"', '{"v":1,"bank":-5}', '{"v":99}']) {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, raw);
    assert.deepEqual(loadGame(storage, T0).state, createState(), raw);
  }
});

test('unknown producer and upgrade ids are ignored', () => {
  const data = serialize(sampleState(), T0);
  data.producers.timeMachine = 5;
  data.upgrades.push('nope', '__proto__');
  const { state } = deserialize(data);
  assert.ok(!('timeMachine' in state.producers));
  assert.deepEqual([...state.upgrades], ['hands']);
});

test('offline earnings for one hour away', () => {
  const s = createState();
  s.producers.farmer = 10;
  assert.equal(applyOfflineEarnings(s, T0, T0 + 3600_000), 18_000);
  assert.equal(s.bank, 18_000);
  assert.equal(s.totalEarned, 18_000);
});

test('offline earnings are capped at 8 hours', () => {
  const s = createState();
  s.producers.farmer = 1;
  assert.equal(applyOfflineEarnings(s, T0, T0 + 24 * 3600_000), 14_400);
});

test('clock going backwards gives no offline earnings', () => {
  const s = createState();
  s.producers.farmer = 1;
  assert.equal(applyOfflineEarnings(s, T0, T0 - 1000), 0);
  assert.equal(s.bank, 0);
});

test('loadGame applies offline earnings', () => {
  const storage = memoryStorage();
  const s = createState();
  s.producers.farmer = 10;
  saveGame(storage, s, T0);
  const { state, offline } = loadGame(storage, T0 + 3600_000);
  assert.equal(offline, 18_000);
  assert.equal(state.bank, 18_000);
});

test('export/import round trip', () => {
  const text = encodeSave(sampleState(), T0);
  assert.equal(typeof text, 'string');
  const { state } = decodeSave(`  ${text}\n`);
  assert.equal(state.bank, 500);
  assert.equal(state.producers.peeler, 3);
  assert.deepEqual([...state.upgrades], ['hands']);
});

test('bad import is rejected', () => {
  assert.throws(() => decodeSave('not a save'), /Invalid save/);
  assert.throws(() => decodeSave(btoa('{"v":1}')), /Invalid save/);
});

test('clearSave removes the save', () => {
  const storage = memoryStorage();
  saveGame(storage, sampleState(), T0);
  clearSave(storage);
  assert.equal(storage.getItem(SAVE_KEY), null);
});
