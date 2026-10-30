# Design

## Context

Greenfield repository. See proposal.md for motivation and the specs for behavior. Constraints: static hosting on GitHub Pages, no build step, and game rules that can be unit-tested without a browser.

## Goals / Non-Goals

**Goals:**
- All game rules in pure functions over a plain state object, testable with `node --test`.
- A thin DOM layer that renders state and forwards input; no rules in the UI.
- Deterministic tests: time and randomness are passed in, never read inside rules.

**Non-Goals:**
- Prestige/ascension, achievements, sound, selling buildings, buying in bulk.
- Cheat protection (saves are client-side and editable by design).
- Arbitrary-precision numbers: JS doubles reach ~1e308, far beyond this content.

## Decisions

### Layout

```
index.html            entry page, loads src/main.js as an ES module
styles.css
src/game/data.js      producer and upgrade catalogs (pure data)
src/game/engine.js    createState, click, buyProducer, buyUpgrade, tick, getPps, getPpc, price, visibility
src/game/golden.js    spawn schedule and effect rolls
src/game/save.js      serialize / deserialize / encode for export / offline earnings
src/game/format.js    number formatting
src/ui/render.js      DOM rendering and event wiring
src/main.js           bootstraps: load save, start loop, autosave
test/*.test.js        node:test suites, one per game module
```

**Why plain ES modules over a framework or bundler:** the UI is a handful of lists and counters; a framework would add a build step and dependencies with no payoff. Browsers and Node 20 both load the same `src/game/*.js` files, so tests exercise the shipped code.

### State shape

```js
{ bank, totalEarned, clicks,
  producers: { peeler: 0, ... },        // owned counts by id
  upgrades: Set<string>,                // owned upgrade ids
  frenzyUntil: 0,                       // epoch ms, not saved
  golden: { nextAt, visibleUntil } }    // epoch ms, not saved
```

Rules mutate the passed state and return a result (`true/false` for purchases) so the UI can stay simple. Every function that depends on time takes `now`; anything random takes an `rng` function defaulting to `Math.random`.

### Game loop

`requestAnimationFrame` drives rendering; a `tick(state, dtSeconds, now)` call per frame adds `PPS × dt`. Browsers pause rAF in hidden tabs, so dt is not clamped: when a tab becomes visible again, the whole gap is credited at full rate, which keeps production running while the game is open. This doesn't double-count with offline earnings, because offline earnings are only applied on page load, using the save time written when the page was hidden or closed. Rendering uses keyed DOM nodes created once and updated in place, to avoid rebuilding the shop 60 times per second.

### Upgrade definitions

Upgrades are data with an `unlock(state)` predicate and an `effect` (`{ type: 'click', mult }`, `{ type: 'producer', id, mult }`, `{ type: 'clickPps', frac }`). Producer upgrades are generated from the producer catalog so prices stay in sync with the table in the spec.

### Save format

`localStorage['potato-clicker-save']` holds JSON `{ v: 1, bank, totalEarned, clicks, producers, upgrades: [...], savedAt }`. Export is `btoa` of that JSON (UTF-8-safe because the JSON is ASCII). Deserialization validates types, drops unknown ids, and throws on garbage so callers can fall back to a new game or show an import error. The `v` field allows later migrations.

### Visuals

The potato and Golden Potato are inline SVG (no image assets). Click feedback uses absolutely positioned spans with a CSS animation, removed on `animationend`. Layout is two columns (potato | shop) collapsing to one column under 760 px.

## Risks / Trade-offs

- [Float drift in long sessions] → Irrelevant at display precision; bank is floored only for display.
- [Clearing browser data wipes progress] → Export/import provides a manual backup.
- [A Frenzy that ends while the tab is hidden] → The returning frame is credited at the current (non-Frenzy) rate, slightly under-crediting. Accepted.

## Migration Plan

New deployment via GitHub Pages workflow on push to `main`. Rollback is reverting the commit.
