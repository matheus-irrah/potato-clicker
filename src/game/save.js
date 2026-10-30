import { PRODUCERS, UPGRADES_BY_ID } from './data.js';
import { createState, earn, getPps } from './engine.js';

export const SAVE_KEY = 'potato-clicker-save';
export const SAVE_VERSION = 1;
export const OFFLINE_RATE = 0.5;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

export function serialize(state, now) {
  return {
    v: SAVE_VERSION,
    bank: state.bank,
    totalEarned: state.totalEarned,
    clicks: state.clicks,
    producers: { ...state.producers },
    upgrades: [...state.upgrades],
    savedAt: now,
  };
}

function nonNegative(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid save: bad ${field}`);
  }
  return value;
}

/** Builds a state from saved data. Throws on anything that isn't a valid save. */
export function deserialize(data) {
  if (!data || typeof data !== 'object' || data.v !== SAVE_VERSION) {
    throw new Error('Invalid save: unknown format');
  }
  const state = createState();
  state.bank = nonNegative(data.bank, 'bank');
  state.totalEarned = nonNegative(data.totalEarned, 'totalEarned');
  state.clicks = nonNegative(data.clicks, 'clicks');
  for (const p of PRODUCERS) {
    const owned = data.producers?.[p.id];
    state.producers[p.id] = Number.isInteger(owned) && owned > 0 ? owned : 0;
  }
  if (Array.isArray(data.upgrades)) {
    for (const id of data.upgrades) {
      if (Object.hasOwn(UPGRADES_BY_ID, id)) state.upgrades.add(id);
    }
  }
  const savedAt = typeof data.savedAt === 'number' && Number.isFinite(data.savedAt) ? data.savedAt : null;
  return { state, savedAt };
}

export function encodeSave(state, now) {
  return btoa(JSON.stringify(serialize(state, now)));
}

/** Decodes an exported save string. Throws if it isn't one. */
export function decodeSave(text) {
  let data;
  try {
    data = JSON.parse(atob(String(text).trim()));
  } catch {
    throw new Error('Invalid save: not an exported save string');
  }
  return deserialize(data);
}

/** Credits offline earnings for the time since savedAt. Returns the amount earned. */
export function applyOfflineEarnings(state, savedAt, now) {
  if (savedAt == null) return 0;
  const seconds = Math.min(Math.max((now - savedAt) / 1000, 0), OFFLINE_CAP_SECONDS);
  const amount = getPps(state, now) * seconds * OFFLINE_RATE;
  if (amount > 0) earn(state, amount);
  return amount;
}

export function saveGame(storage, state, now) {
  storage.setItem(SAVE_KEY, JSON.stringify(serialize(state, now)));
}

/** Loads the saved game, or a new one if there is no readable save. */
export function loadGame(storage, now) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw) {
      const { state, savedAt } = deserialize(JSON.parse(raw));
      const offline = applyOfflineEarnings(state, savedAt, now);
      return { state, offline };
    }
  } catch {
    // Unreadable save: fall through to a new game.
  }
  return { state: createState(), offline: 0 };
}

export function clearSave(storage) {
  storage.removeItem(SAVE_KEY);
}
