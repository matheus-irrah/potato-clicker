# Spec Delta

## Purpose

Gives the player buildings that harvest potatoes automatically, so the game progresses without clicking and spending decisions matter.

## ADDED Requirements

### Requirement: Producer catalog
The game SHALL offer exactly these producers, in this order, with these base prices and base outputs (potatoes per second, per unit):

| Producer | Base price | Base output/s |
|---|---|---|
| Potato Peeler | 15 | 0.1 |
| Spud Farmer | 100 | 1 |
| Tractor | 1,100 | 8 |
| Root Cellar | 12,000 | 47 |
| Fry Factory | 130,000 | 260 |
| Tuber Lab | 1,400,000 | 1,400 |
| Spudnik Orbital Farm | 20,000,000 | 7,800 |

#### Scenario: Shop lists all producers
- **WHEN** a new game starts
- **THEN** the shop lists the seven producers with their price and owned count of 0

### Requirement: Exponential pricing
The price of the next unit of a producer SHALL be `ceil(basePrice × 1.15^owned)`.

#### Scenario: First purchase price
- **WHEN** the player owns 0 Potato Peelers
- **THEN** the next Peeler costs 15

#### Scenario: Price after purchases
- **WHEN** the player owns 10 Potato Peelers
- **THEN** the next Peeler costs 61

### Requirement: Buying producers
The game SHALL let the player buy one unit of a producer when the bank is at least its current price, deducting the price and incrementing the owned count. When the bank is below the price, the purchase SHALL be refused, nothing SHALL change, and the shop entry SHALL appear disabled.

#### Scenario: Affordable purchase
- **WHEN** the bank is 20 and the player buys a Potato Peeler
- **THEN** the bank is 5 and the player owns 1 Peeler

#### Scenario: Unaffordable purchase
- **WHEN** the bank is 10 and the player tries to buy a Potato Peeler
- **THEN** the bank stays 10 and the player owns 0 Peelers

### Requirement: Passive production
The game SHALL compute potatoes per second (PPS) as the sum over producers of `owned × baseOutput × producerMultiplier`, times any active global multiplier, and SHALL add `PPS × elapsedSeconds` to the bank and lifetime total continuously while the game is open. PPS SHALL be displayed under the bank.

#### Scenario: Production over time
- **WHEN** the player owns 1 Spud Farmer and no upgrades, and 10 seconds pass
- **THEN** the bank has increased by 10

### Requirement: Progressive reveal
The shop SHALL hide a producer's name and description (showing "???") until the player's lifetime total has reached at least half of its base price or the player owns one of the previous producer. The first producer SHALL always be revealed.

#### Scenario: Hidden producer
- **WHEN** a new game starts
- **THEN** Potato Peeler is revealed and Tractor shows as "???"
