import { earn, getPps } from './engine.js';

export const GOLDEN_MIN_DELAY_MS = 60_000;
export const GOLDEN_MAX_DELAY_MS = 180_000;
export const GOLDEN_LIFETIME_MS = 12_000;
export const FRENZY_DURATION_MS = 30_000;

export function scheduleGolden(state, now, rng = Math.random) {
  state.golden.nextAt = now + GOLDEN_MIN_DELAY_MS + rng() * (GOLDEN_MAX_DELAY_MS - GOLDEN_MIN_DELAY_MS);
  state.golden.visibleUntil = 0;
}

export function isGoldenVisible(state, now) {
  return state.golden.visibleUntil > 0 && now < state.golden.visibleUntil;
}

/**
 * Advances the Golden Potato schedule. Returns 'spawned', 'expired' or null
 * so the UI knows when to show or hide it.
 */
export function updateGolden(state, now, rng = Math.random) {
  const g = state.golden;
  if (!g.nextAt) {
    scheduleGolden(state, now, rng);
    return null;
  }
  if (g.visibleUntil > 0) {
    if (now < g.visibleUntil) return null;
    scheduleGolden(state, now, rng);
    return 'expired';
  }
  if (now >= g.nextAt) {
    g.visibleUntil = now + GOLDEN_LIFETIME_MS;
    return 'spawned';
  }
  return null;
}

export function luckyHarvestAmount(state, now) {
  return Math.min(state.bank * 0.1, 900 * getPps(state, now)) + 13;
}

/** Applies a Golden Potato click. Returns { type: 'frenzy' | 'lucky', amount? } or null if none is visible. */
export function clickGolden(state, now, rng = Math.random) {
  if (!isGoldenVisible(state, now)) return null;
  let result;
  if (rng() < 0.5) {
    state.frenzyUntil = now + FRENZY_DURATION_MS;
    result = { type: 'frenzy' };
  } else {
    const amount = luckyHarvestAmount(state, now);
    earn(state, amount);
    result = { type: 'lucky', amount };
  }
  scheduleGolden(state, now, rng);
  return result;
}
