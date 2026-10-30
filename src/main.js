import { buyProducer, buyUpgrade, click, createState, tick } from './game/engine.js';
import { formatNumber } from './game/format.js';
import { clickGolden, updateGolden } from './game/golden.js';
import { clearSave, decodeSave, encodeSave, loadGame, saveGame } from './game/save.js';
import { createUI } from './ui/render.js';

const AUTOSAVE_MS = 10_000;

function getStorage() {
  try {
    const s = window.localStorage;
    s.getItem('probe');
    return s;
  } catch {
    // Storage blocked (private mode, sandbox): play without saving.
    return { getItem: () => null, setItem() {}, removeItem() {} };
  }
}

const storage = getStorage();
let { state, offline } = loadGame(storage, Date.now());

function save() {
  try {
    saveGame(storage, state, Date.now());
  } catch {
    // Quota or storage errors shouldn't stop the game.
  }
}

// Render right after each action so the bank and shop never lag a frame behind input.
const withRender = (handlers) => Object.fromEntries(
  Object.entries(handlers).map(([name, fn]) => [name, (...args) => {
    const result = fn(...args);
    ui.render(state, Date.now());
    return result;
  }]),
);

const ui = createUI(document, withRender({
  onClickPotato(x, y) {
    const gain = click(state, Date.now());
    ui.floatText(x, y, `+${formatNumber(gain)}`);
  },
  onBuyProducer(id) {
    buyProducer(state, id);
  },
  onBuyUpgrade(id) {
    buyUpgrade(state, id);
  },
  onClickGolden() {
    const result = clickGolden(state, Date.now());
    ui.hideGolden();
    if (result?.type === 'frenzy') ui.toast('🔥 Potato Frenzy! Production ×7 for 30 seconds.', 'gold');
    if (result?.type === 'lucky') ui.toast(`🍀 Lucky Harvest! +${formatNumber(result.amount)} potatoes.`, 'gold');
  },
  onExport() {
    return encodeSave(state, Date.now());
  },
  onImport(text) {
    try {
      state = decodeSave(text).state;
    } catch {
      return "That doesn't look like a Potato Clicker save.";
    }
    ui.hideGolden();
    save();
    ui.toast('Save imported.');
    return null;
  },
  onReset() {
    if (!window.confirm('Reset your farm? All potatoes, buildings and upgrades will be lost.')) return;
    clearSave(storage);
    state = createState();
    ui.hideGolden();
    save();
    ui.toast('Farm reset. Back to one potato at a time.');
  },
}));

if (offline >= 1) ui.toast(`While you were away, your farm harvested ${formatNumber(offline)} potatoes.`);

let last = performance.now();
function frame(t) {
  // Browsers pause rAF in hidden tabs; crediting the full gap on return keeps
  // production running "while the game is open".
  const dt = Math.max((t - last) / 1000, 0);
  last = t;
  const now = Date.now();
  const golden = updateGolden(state, now);
  if (golden === 'spawned') ui.showGolden();
  if (golden === 'expired') ui.hideGolden();
  tick(state, dt, now);
  ui.render(state, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
setInterval(save, AUTOSAVE_MS);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});
window.addEventListener('pagehide', save);
