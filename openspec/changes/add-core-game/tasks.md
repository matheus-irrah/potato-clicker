# Tasks

## 1. Setup

- [ ] 1.1 Add `package.json` (`"type": "module"`, `npm test` → `node --test test/`), `.gitignore`, and `index.html`/`styles.css` skeleton; verify `npm test` runs with zero suites without error

## 2. Game rules

- [ ] 2.1 Implement `src/game/format.js` and verify `test/format.test.js` covers the three formatting scenarios from the harvesting spec
- [ ] 2.2 Implement `src/game/data.js` with the producer and upgrade catalogs from the specs; verify `test/data.test.js` checks the seven producers, their order and numbers, and that each producer has two upgrades at 10× and 100× base price
- [ ] 2.3 Implement `src/game/engine.js` (state, click, PPC, PPS, price, buy producer, buy upgrade, tick, reveal); verify `test/engine.test.js` covers every harvesting, producers and upgrades scenario
- [ ] 2.4 Implement `src/game/golden.js` (schedule, expiry, Frenzy, Lucky Harvest) with injected `now`/`rng`; verify `test/golden.test.js` covers spawn window, expiry, Frenzy timer restart and Lucky Harvest formula
- [ ] 2.5 Implement `src/game/save.js` (serialize, deserialize, export/import encoding, offline earnings); verify `test/save.test.js` covers round trip, corrupt save, unknown ids, bad import, offline earnings and the 8-hour cap

## 3. User interface

- [ ] 3.1 Implement `src/ui/render.js` and `src/main.js`: potato with click feedback, bank/PPS/stats, shop with reveal and disabled states, upgrades list, Golden Potato, Frenzy timer, toasts; verify by loading the page in a browser and clicking through a purchase
- [ ] 3.2 Wire autosave (10 s + `visibilitychange`/`beforeunload`), load with offline-earnings message, export/import dialogs and confirmed reset; verify by reloading the page and seeing progress kept and the away message
- [ ] 3.3 Style `styles.css` (two-column → one-column under 760 px, SVG potato, animations); verify the layout at phone width has no horizontal scroll

## 4. Delivery

- [ ] 4.1 Add `.github/workflows/ci.yml` (run `npm test` on push/PR) and `.github/workflows/pages.yml` (deploy repo root to GitHub Pages); verify both workflows succeed on GitHub
- [ ] 4.2 Write `README.md` (how to play, run locally, run tests, SDD workflow with OpenSpec); verify the documented commands run as written
- [ ] 4.3 Integration check: open the deployed Pages URL and play from a new game through buying a producer and an upgrade
