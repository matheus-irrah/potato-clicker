# Spec Delta

## Purpose

Adds a random, short-lived bonus that rewards attention and breaks up the idle loop.

## ADDED Requirements

### Requirement: Golden Potato spawning
While the game is open, a Golden Potato SHALL appear at a random position on screen after a random delay between 60 and 180 seconds since the previous one was clicked, expired, or the game started. It SHALL disappear if not clicked within 12 seconds. At most one Golden Potato SHALL be on screen at a time.

#### Scenario: Expiry
- **WHEN** a Golden Potato appears and 12 seconds pass without a click
- **THEN** it disappears and the next spawn is scheduled 60 to 180 seconds later

### Requirement: Golden Potato effects
Clicking a Golden Potato SHALL grant, with equal probability, one of:
- **Potato Frenzy**: PPS is multiplied by 7 for 30 seconds. A second Frenzy while one is active SHALL restart the 30-second timer, not stack the multiplier.
- **Lucky Harvest**: the bank gains `min(10% of bank, 900 × PPS) + 13` potatoes.

The game SHALL announce which effect was granted and SHALL show the remaining Frenzy time while it is active.

#### Scenario: Frenzy
- **WHEN** PPS is 10 and the player gets a Potato Frenzy
- **THEN** PPS is 70 for the next 30 seconds and returns to 10 afterwards

#### Scenario: Lucky Harvest capped by bank
- **WHEN** the bank is 1,000, PPS is 100 and the player gets a Lucky Harvest
- **THEN** the bank becomes 1,113
