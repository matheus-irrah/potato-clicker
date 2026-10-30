# Proposal

## Why

There is no game yet. This change creates Potato Clicker from scratch: an original incremental (idle) browser game where the player harvests potatoes by clicking, then reinvests them in farm equipment that harvests automatically. The goal is a complete, playable first version that runs as a static page with no install.

## What Changes

- A clickable potato that yields potatoes per click, with visual feedback.
- Seven producers (from Potato Peeler to Spudnik Orbital Farm) that generate potatoes per second, with exponentially rising prices.
- One-time upgrades that multiply click power or a specific producer's output, unlocked by progress.
- A random Golden Potato that, when clicked, grants either a temporary production frenzy or an instant lump of potatoes.
- Automatic saving in the browser, offline earnings on return, export/import of saves as text, and a hard reset.
- Static deployment to GitHub Pages and CI that runs unit tests.

## Capabilities

### New Capabilities
- `harvesting`: manual clicking, potatoes-per-click, bank and lifetime statistics, number display.
- `producers`: buildings the player buys that produce potatoes per second, their pricing and production rules.
- `upgrades`: one-time purchases that multiply click or producer output and when they become available.
- `golden-potato`: the random bonus event and its effects.
- `persistence`: autosave, load, offline earnings, export/import and reset.

### Modified Capabilities
<!-- none: greenfield project -->

## Impact

- New static web app (`index.html`, `src/`), unit tests (`test/`), `package.json` for the test script only.
- GitHub Actions workflows for tests and GitHub Pages deployment.
- No runtime dependencies, no backend. Save data lives only in the player's browser `localStorage`.
