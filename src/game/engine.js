import { PRODUCERS, PRODUCERS_BY_ID, UPGRADES, UPGRADES_BY_ID } from './data.js';

export const PRICE_GROWTH = 1.15;
export const FRENZY_MULT = 7;

export function createState() {
  return {
    bank: 0,
    totalEarned: 0,
    clicks: 0,
    producers: Object.fromEntries(PRODUCERS.map((p) => [p.id, 0])),
    upgrades: new Set(),
    frenzyUntil: 0,
    golden: { nextAt: 0, visibleUntil: 0 },
  };
}

export function earn(state, amount) {
  state.bank += amount;
  state.totalEarned += amount;
}

function ownedEffects(state) {
  return [...state.upgrades].map((id) => UPGRADES_BY_ID[id].effect);
}

export function isFrenzy(state, now) {
  return now < state.frenzyUntil;
}

/** Output per second of one unit of a producer, including upgrades but not Frenzy. */
export function getProducerOutput(state, id) {
  const mult = ownedEffects(state)
    .filter((e) => e.type === 'producer' && e.id === id)
    .reduce((m, e) => m * e.mult, 1);
  return PRODUCERS_BY_ID[id].baseOutput * mult;
}

export function getPps(state, now) {
  const base = PRODUCERS.reduce(
    (sum, p) => sum + state.producers[p.id] * getProducerOutput(state, p.id),
    0,
  );
  return base * (isFrenzy(state, now) ? FRENZY_MULT : 1);
}

export function getPpc(state, now) {
  let ppc = 1;
  let ppsFrac = 0;
  for (const e of ownedEffects(state)) {
    if (e.type === 'click') ppc *= e.mult;
    if (e.type === 'clickPps') ppsFrac += e.frac;
  }
  return ppc + (ppsFrac ? ppsFrac * getPps(state, now) : 0);
}

export function click(state, now) {
  const gain = getPpc(state, now);
  earn(state, gain);
  state.clicks += 1;
  return gain;
}

export function price(id, owned) {
  return Math.ceil(PRODUCERS_BY_ID[id].basePrice * PRICE_GROWTH ** owned);
}

export function buyProducer(state, id) {
  const cost = price(id, state.producers[id]);
  if (state.bank < cost) return false;
  state.bank -= cost;
  state.producers[id] += 1;
  return true;
}

export function isProducerRevealed(state, id) {
  const index = PRODUCERS.findIndex((p) => p.id === id);
  if (index === 0 || state.producers[id] > 0) return true;
  if (state.totalEarned >= PRODUCERS[index].basePrice / 2) return true;
  return state.producers[PRODUCERS[index - 1].id] > 0;
}

export function isUpgradeAvailable(state, id) {
  const u = UPGRADES_BY_ID[id];
  return !state.upgrades.has(id) && u.unlock(state);
}

export function availableUpgrades(state) {
  return UPGRADES.filter((u) => isUpgradeAvailable(state, u.id)).sort((a, b) => a.price - b.price);
}

export function buyUpgrade(state, id) {
  const u = UPGRADES_BY_ID[id];
  if (!u || !isUpgradeAvailable(state, id) || state.bank < u.price) return false;
  state.bank -= u.price;
  state.upgrades.add(id);
  return true;
}

export function tick(state, dtSeconds, now) {
  earn(state, getPps(state, now) * dtSeconds);
}
