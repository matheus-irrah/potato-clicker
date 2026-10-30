import { PRODUCERS } from '../game/data.js';
import {
  availableUpgrades, getPpc, getPps, getProducerOutput, isFrenzy, isProducerRevealed, price,
} from '../game/engine.js';
import { formatNumber } from '../game/format.js';

const TOAST_MS = 4000;

export function potatoSvg(golden = false) {
  const id = golden ? 'g' : 'p';
  const [light, dark, eye] = golden
    ? ['#ffe27a', '#d99a00', '#b07800']
    : ['#d9a86c', '#9a6a35', '#7a4f22'];
  return `
<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="${id}-skin" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <path fill="url(#${id}-skin)" d="M30 70 C25 30 80 12 120 18 C165 24 190 55 182 92 C175 130 130 150 88 146 C45 142 34 110 30 70 Z"/>
  <g fill="${eye}" opacity="0.7">
    <ellipse cx="70" cy="55" rx="5" ry="3"/>
    <ellipse cx="128" cy="45" rx="4" ry="2.5"/>
    <ellipse cx="150" cy="95" rx="5" ry="3"/>
    <ellipse cx="95" cy="110" rx="4" ry="2.5"/>
    <ellipse cx="55" cy="98" rx="3" ry="2"/>
  </g>
  <path d="M60 40 C80 28 105 26 120 30" stroke="#fff" stroke-opacity="0.35" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
}

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * Builds the DOM once and returns functions to update it from state.
 * handlers: onClickPotato(x, y), onBuyProducer(id), onBuyUpgrade(id), onClickGolden(),
 *           onExport() => string, onImport(text) => error message | null, onReset()
 */
export function createUI(doc, handlers) {
  const $ = (id) => doc.getElementById(id);
  const els = {
    bank: $('bank'), pps: $('pps'), potato: $('potato'), frenzy: $('frenzy'),
    total: $('stat-total'), clicks: $('stat-clicks'), ppc: $('stat-ppc'),
    shop: $('shop'), upgrades: $('upgrades'), noUpgrades: $('no-upgrades'),
    golden: $('golden'), floaters: $('floaters'), toasts: $('toasts'),
    dialog: $('save-dialog'), dialogTitle: $('save-dialog-title'), dialogHint: $('save-dialog-hint'),
    saveText: $('save-text'), saveError: $('save-error'), saveCopy: $('save-copy'), saveLoad: $('save-load'),
  };

  // Potato
  els.potato.innerHTML = potatoSvg();
  els.potato.addEventListener('click', (e) => {
    let { clientX: x, clientY: y } = e;
    if (e.detail === 0) {
      // Keyboard activation: float the label from the potato's centre.
      const r = els.potato.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 3;
    }
    handlers.onClickPotato(x, y);
    els.potato.animate(
      [{ transform: 'scale(0.92)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
      { duration: 160, easing: 'ease-out' },
    );
  });

  // Producers: one row per producer, updated in place.
  const rows = PRODUCERS.map((p) => {
    const btn = el('button', 'producer');
    btn.type = 'button';
    const icon = el('span', 'p-icon', p.icon);
    const main = el('span', 'p-main');
    const name = el('span', 'p-name');
    const desc = el('span', 'p-desc');
    const cost = el('span', 'p-price');
    main.append(name, desc, cost);
    const owned = el('span', 'p-owned');
    btn.append(icon, main, owned);
    btn.addEventListener('click', () => handlers.onBuyProducer(p.id));
    els.shop.append(btn);
    return { p, btn, icon, name, desc, cost, owned };
  });

  // Upgrades: rebuilt only when the set of available upgrades changes.
  let upgradeKey = '';
  let upgradeButtons = [];
  function renderUpgradeList(state) {
    const list = availableUpgrades(state);
    const key = list.map((u) => u.id).join(',');
    if (key === upgradeKey) return;
    upgradeKey = key;
    els.upgrades.replaceChildren();
    upgradeButtons = list.map((u) => {
      const btn = el('button', 'upgrade');
      btn.type = 'button';
      btn.title = `${u.name} — ${u.description}`;
      btn.append(el('span', 'u-icon', u.icon), el('span', 'u-name', u.name), el('span', 'u-price', `🥔 ${formatNumber(u.price)}`));
      btn.setAttribute('aria-label', `${u.name}: ${u.description} Costs ${formatNumber(u.price)} potatoes.`);
      btn.addEventListener('click', () => handlers.onBuyUpgrade(u.id));
      els.upgrades.append(btn);
      return { u, btn };
    });
    els.noUpgrades.hidden = list.length > 0;
  }

  // Golden Potato
  els.golden.innerHTML = potatoSvg(true);
  els.golden.addEventListener('click', () => handlers.onClickGolden());

  function showGolden() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    els.golden.style.left = `${Math.round(w * (0.08 + Math.random() * 0.76))}px`;
    els.golden.style.top = `${Math.round(h * (0.15 + Math.random() * 0.65))}px`;
    els.golden.hidden = false;
  }

  function hideGolden() {
    els.golden.hidden = true;
  }

  function floatText(x, y, text) {
    const f = el('span', 'floater', text);
    f.style.left = `${x}px`;
    f.style.top = `${y}px`;
    f.addEventListener('animationend', () => f.remove());
    els.floaters.append(f);
  }

  function toast(message, kind = '') {
    const t = el('div', `toast ${kind}`, message);
    els.toasts.append(t);
    setTimeout(() => t.remove(), TOAST_MS);
  }

  // Save dialog
  function openDialog(mode) {
    const exporting = mode === 'export';
    els.dialogTitle.textContent = exporting ? 'Export save' : 'Import save';
    els.dialogHint.textContent = exporting
      ? 'Copy this text and keep it somewhere safe. Paste it into "Import save" to restore your farm.'
      : 'Paste an exported save. This replaces your current farm.';
    els.saveText.value = exporting ? handlers.onExport() : '';
    els.saveText.readOnly = exporting;
    els.saveCopy.hidden = !exporting;
    els.saveLoad.hidden = exporting;
    els.saveError.hidden = true;
    els.dialog.showModal();
    if (exporting) els.saveText.select();
    else els.saveText.focus();
  }

  $('export-btn').addEventListener('click', () => openDialog('export'));
  $('import-btn').addEventListener('click', () => openDialog('import'));
  $('reset-btn').addEventListener('click', () => handlers.onReset());
  els.saveCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(els.saveText.value);
      toast('Save copied to clipboard.');
    } catch {
      els.saveText.select();
      toast('Press Ctrl/Cmd+C to copy.');
    }
  });
  els.saveLoad.addEventListener('click', () => {
    const error = handlers.onImport(els.saveText.value);
    if (error) {
      els.saveError.textContent = error;
      els.saveError.hidden = false;
    } else {
      els.dialog.close();
    }
  });

  let lastTitle = '';
  function render(state, now) {
    const bankText = formatNumber(Math.floor(state.bank));
    setText(els.bank, bankText);
    setText(els.pps, formatNumber(getPps(state, now)));
    setText(els.total, formatNumber(Math.floor(state.totalEarned)));
    setText(els.clicks, formatNumber(state.clicks));
    setText(els.ppc, formatNumber(getPpc(state, now)));

    const title = `${bankText} potatoes · Potato Clicker`;
    if (title !== lastTitle) doc.title = lastTitle = title;

    const frenzy = isFrenzy(state, now);
    els.frenzy.hidden = !frenzy;
    if (frenzy) {
      setText(els.frenzy, `🔥 Potato Frenzy! Production ×7 for ${Math.ceil((state.frenzyUntil - now) / 1000)}s`);
    }

    for (const r of rows) {
      const revealed = isProducerRevealed(state, r.p.id);
      const cost = price(r.p.id, state.producers[r.p.id]);
      setText(r.name, revealed ? r.p.name : '???');
      setText(r.desc, revealed ? `${r.p.description} +${formatNumber(getProducerOutput(state, r.p.id))}/s each` : '');
      setText(r.icon, revealed ? r.p.icon : '❔');
      setText(r.cost, `🥔 ${formatNumber(cost)}`);
      setText(r.owned, state.producers[r.p.id] ? String(state.producers[r.p.id]) : '');
      r.btn.disabled = state.bank < cost;
      r.btn.classList.toggle('hidden-producer', !revealed);
    }

    renderUpgradeList(state);
    for (const { u, btn } of upgradeButtons) btn.disabled = state.bank < u.price;
  }

  return { render, floatText, toast, showGolden, hideGolden };
}
