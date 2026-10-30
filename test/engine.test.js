import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  availableUpgrades, buyProducer, buyUpgrade, click, createState, earn,
  getPpc, getPps, isProducerRevealed, price, tick,
} from '../src/game/engine.js';
import { PRODUCERS } from '../src/game/data.js';

const NOW = 1_000_000;

describe('harvesting', () => {
  test('first click of a new game gives 1 potato', () => {
    const s = createState();
    assert.equal(s.bank, 0);
    assert.equal(getPpc(s, NOW), 1);
    click(s, NOW);
    assert.equal(s.bank, 1);
    assert.equal(s.clicks, 1);
  });

  test('click with upgraded PPC adds PPC', () => {
    const s = createState();
    s.upgrades.add('hands').add('shovel');
    assert.equal(click(s, NOW), 4);
    assert.equal(s.bank, 4);
  });

  test('spending does not reduce lifetime total', () => {
    const s = createState();
    earn(s, 100);
    assert.ok(buyProducer(s, 'peeler'));
    assert.equal(s.bank, 85);
    assert.equal(s.totalEarned, 100);
  });
});

describe('producers', () => {
  test('new game owns zero of all seven producers', () => {
    const s = createState();
    assert.equal(Object.keys(s.producers).length, 7);
    assert.ok(Object.values(s.producers).every((n) => n === 0));
  });

  test('first purchase price is base price', () => {
    assert.equal(price('peeler', 0), 15);
  });

  test('price after 10 purchases', () => {
    assert.equal(price('peeler', 10), 61);
  });

  test('affordable purchase deducts price', () => {
    const s = createState();
    s.bank = 20;
    assert.equal(buyProducer(s, 'peeler'), true);
    assert.equal(s.bank, 5);
    assert.equal(s.producers.peeler, 1);
  });

  test('unaffordable purchase changes nothing', () => {
    const s = createState();
    s.bank = 10;
    assert.equal(buyProducer(s, 'peeler'), false);
    assert.equal(s.bank, 10);
    assert.equal(s.producers.peeler, 0);
  });

  test('production over time', () => {
    const s = createState();
    s.producers.farmer = 1;
    tick(s, 10, NOW);
    assert.equal(s.bank, 10);
    assert.equal(s.totalEarned, 10);
  });

  test('PPS sums all producers', () => {
    const s = createState();
    s.producers.peeler = 10;
    s.producers.tractor = 2;
    assert.equal(getPps(s, NOW), 10 * 0.1 + 2 * 8);
  });

  test('progressive reveal on a new game', () => {
    const s = createState();
    assert.equal(isProducerRevealed(s, 'peeler'), true);
    assert.equal(isProducerRevealed(s, 'tractor'), false);
  });

  test('reveal by lifetime total or owning the previous producer', () => {
    const s = createState();
    s.totalEarned = 550;
    assert.equal(isProducerRevealed(s, 'tractor'), true);
    const t = createState();
    t.producers.farmer = 1;
    assert.equal(isProducerRevealed(t, 'tractor'), true);
    assert.equal(isProducerRevealed(t, 'cellar'), false);
  });

  test('every producer id is known', () => {
    for (const p of PRODUCERS) assert.equal(price(p.id, 0), p.basePrice);
  });
});

describe('upgrades', () => {
  test('two click doublers give PPC 4', () => {
    const s = createState();
    s.upgrades.add('hands').add('shovel');
    assert.equal(getPpc(s, NOW), 4);
  });

  test('Mashing Technique adds 1% of PPS to clicks', () => {
    const s = createState();
    s.producers.farmer = 1000;
    s.upgrades.add('mashing');
    assert.equal(getPps(s, NOW), 1000);
    assert.equal(getPpc(s, NOW), 11);
  });

  test('doubling a producer', () => {
    const s = createState();
    s.producers.farmer = 2;
    s.upgrades.add('farmer-1');
    assert.equal(getPps(s, NOW), 4);
  });

  test('second producer upgrade needs 10 owned', () => {
    const s = createState();
    s.producers.peeler = 9;
    let ids = availableUpgrades(s).map((u) => u.id);
    assert.ok(ids.includes('peeler-1'));
    assert.ok(!ids.includes('peeler-2'));
    s.producers.peeler = 10;
    ids = availableUpgrades(s).map((u) => u.id);
    assert.ok(ids.includes('peeler-2'));
  });

  test('buy an unlocked upgrade', () => {
    const s = createState();
    s.clicks = 10;
    s.bank = 150;
    assert.equal(buyUpgrade(s, 'hands'), true);
    assert.equal(s.bank, 50);
    assert.equal(getPpc(s, NOW), 2);
    assert.ok(!availableUpgrades(s).some((u) => u.id === 'hands'));
    assert.equal(buyUpgrade(s, 'hands'), false);
  });

  test('locked upgrade cannot be bought', () => {
    const s = createState();
    s.clicks = 5;
    s.bank = 1000;
    assert.equal(buyUpgrade(s, 'hands'), false);
    assert.equal(s.bank, 1000);
  });

  test('unaffordable upgrade cannot be bought', () => {
    const s = createState();
    s.clicks = 10;
    s.bank = 99;
    assert.equal(buyUpgrade(s, 'hands'), false);
    assert.equal(s.bank, 99);
  });

  test('available upgrades are sorted by price', () => {
    const s = createState();
    s.clicks = 1000;
    s.producers.peeler = 10;
    s.producers.farmer = 1;
    const prices = availableUpgrades(s).map((u) => u.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });
});
