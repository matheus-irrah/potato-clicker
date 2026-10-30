# 🥔 Potato Clicker

An incremental (idle) browser game about harvesting an absurd number of potatoes.

**Play it:** https://matheus-irrah.github.io/potato-clicker/

Click the potato to harvest. Spend potatoes on farm equipment that harvests for you, then on upgrades that make everything faster. Keep an eye out for the **Golden Potato**.

## How to play

| Thing | What it does |
|---|---|
| 🥔 Big potato | Click it: +1 potato (more with upgrades) |
| Farm | Buy producers, from the humble Potato Peeler to the Spudnik Orbital Farm. Each one costs 15% more than the last. |
| Upgrades | One-time purchases that double click power or a producer's output. They appear as you play. |
| ✨ Golden Potato | Shows up every 1–3 minutes for 12 seconds. Click it for a 30-second ×7 **Potato Frenzy** or an instant **Lucky Harvest**. |
| Saving | Automatic every 10 seconds. You earn 50% of your production while away (up to 8 hours). Use **Export save** to back up or move your farm. |

## Run locally

No build step and no dependencies. ES modules need to be served over HTTP:

```sh
npm start          # python3 -m http.server 8000
# open http://localhost:8000
```

## Tests

Game rules live in pure modules under `src/game/` and are tested with Node's built-in test runner (Node 20+):

```sh
npm test
```

## Spec-driven development

This project is built with [OpenSpec](https://github.com/Fission-AI/OpenSpec). Behavior is specified before it is implemented:

```
openspec/
├── config.yaml             project context and rules for spec authoring
├── specs/                  current source of truth, one folder per capability
│   ├── harvesting/         clicking, stats, number formatting
│   ├── producers/          buildings, pricing, production
│   ├── upgrades/           click and producer multipliers
│   ├── golden-potato/      the random bonus event
│   └── persistence/        autosave, offline earnings, export/import, reset
└── changes/archive/        completed changes: proposal, design, spec deltas and tasks
```

Every spec scenario maps to a unit test in `test/`. To propose a new feature:

```sh
npm i -g @fission-ai/openspec
openspec new change add-something       # or /opsx:propose in Claude Code
# write proposal.md, specs/, design.md, tasks.md
openspec validate add-something --strict
# implement the tasks, then
openspec archive add-something           # merges spec deltas into openspec/specs/
```

## Project layout

```
index.html, styles.css   the page
src/game/                pure game rules (no DOM): data, engine, golden, save, format
src/ui/render.js         DOM rendering and input wiring
src/main.js              bootstraps the game loop and autosave
test/                    node:test suites
```

## License

MIT
