# Spec Delta

## Purpose

Keeps the player's progress across page reloads and visits, lets them move a save between browsers, and lets them start over.

## ADDED Requirements

### Requirement: Autosave
The game SHALL save its state to the browser's local storage every 10 seconds and when the page is hidden or closed. Saved state SHALL include bank, lifetime total, clicks, owned producers, owned upgrades, and the save time. Temporary effects (Frenzy, on-screen Golden Potato) SHALL NOT be saved.

#### Scenario: Reload keeps progress
- **WHEN** the player has 500 potatoes and 3 Peelers and reloads the page after a save
- **THEN** the game resumes with 500 potatoes (plus offline earnings) and 3 Peelers

### Requirement: Loading and corrupt saves
On start the game SHALL load the saved state if present. If no save exists, or the save cannot be read, the game SHALL start a new game and SHALL NOT crash. Unknown producer or upgrade ids in a save SHALL be ignored.

#### Scenario: Corrupt save
- **WHEN** local storage contains an unreadable save
- **THEN** the game starts as a new game

### Requirement: Offline earnings
When loading a save, the game SHALL credit `PPS × secondsAway × 0.5`, with secondsAway capped at 8 hours, and SHALL tell the player how much was earned while away when the amount is at least 1 potato.

#### Scenario: Away for one hour
- **WHEN** the saved PPS is 10 and the player returns 3,600 seconds later
- **THEN** 18,000 potatoes are added and a "while you were away" message shows the amount

#### Scenario: Cap
- **WHEN** the saved PPS is 1 and the player returns 24 hours later
- **THEN** 14,400 potatoes are added

### Requirement: Export and import
The game SHALL let the player export the save as a single text string and import such a string to replace the current state. An invalid import string SHALL be rejected with a message and SHALL leave the current state unchanged.

#### Scenario: Round trip
- **WHEN** the player exports a save and imports that string in another browser
- **THEN** the second browser shows the same bank, producers and upgrades

#### Scenario: Bad import
- **WHEN** the player imports "not a save"
- **THEN** an error message is shown and the game state is unchanged

### Requirement: Hard reset
The game SHALL offer a reset that, after explicit confirmation, deletes the save and starts a new game.

#### Scenario: Confirmed reset
- **WHEN** the player confirms the reset
- **THEN** the bank, producers, upgrades and statistics return to new-game values
