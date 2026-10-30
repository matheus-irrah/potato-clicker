import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCERS, UPGRADES, UPGRADES_BY_ID } from '../src/game/data.js';

test('producer catalog matches the spec table', () => {
  assert.deepEqual(
    PRODUCERS.map((p) => [p.name, p.basePrice, p.baseOutput]),
    [
      ['Potato Peeler', 15, 0.1],
      ['Spud Farmer', 100, 1],
      ['Tractor', 1100, 8],
      ['Root Cellar', 12000, 47],
      ['Fry Factory', 130000, 260],
      ['Tuber Lab', 1400000, 1400],
      ['Spudnik Orbital Farm', 20000000, 7800],
    ],
  );
});

test('click upgrades match the spec table', () => {
  assert.deepEqual(
    ['hands', 'shovel', 'hoe', 'mashing'].map((id) => [UPGRADES_BY_ID[id].name, UPGRADES_BY_ID[id].price]),
    [
      ['Calloused Hands', 100],
      ['Steel Shovel', 500],
      ['Golden Hoe', 10000],
      ['Mashing Technique', 50000],
    ],
  );
});

test('each producer has two doubling upgrades at 10x and 100x base price', () => {
  for (const p of PRODUCERS) {
    const ups = UPGRADES.filter((u) => u.effect.type === 'producer' && u.effect.id === p.id);
    assert.equal(ups.length, 2, p.id);
    assert.deepEqual(ups.map((u) => u.price), [p.basePrice * 10, p.basePrice * 100]);
    assert.ok(ups.every((u) => u.effect.mult === 2));
  }
});

test('upgrade ids are unique', () => {
  assert.equal(new Set(UPGRADES.map((u) => u.id)).size, UPGRADES.length);
});
