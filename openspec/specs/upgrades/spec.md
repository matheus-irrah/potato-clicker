# upgrades Specification

## Purpose
Gives the player one-time purchases that multiply their click power or a producer's output, adding goals between producer purchases.

## Requirements

### Requirement: Click upgrades
The game SHALL offer these click upgrades:

| Upgrade | Price | Unlocks when | Effect |
|---|---|---|---|
| Calloused Hands | 100 | 10 clicks made | PPC ×2 |
| Steel Shovel | 500 | 100 clicks made | PPC ×2 |
| Golden Hoe | 10,000 | 500 clicks made | PPC ×2 |
| Mashing Technique | 50,000 | 1,000 clicks made | each click also adds 1% of current PPS |

PPC SHALL be `1 × product of owned click multipliers`, plus 1% of PPS if Mashing Technique is owned.

#### Scenario: Two click doublers
- **WHEN** the player owns Calloused Hands and Steel Shovel and nothing else
- **THEN** PPC is 4

#### Scenario: Mashing Technique
- **WHEN** the player owns only Mashing Technique and PPS is 1,000
- **THEN** PPC is 11

### Requirement: Producer upgrades
For each producer the game SHALL offer two upgrades, each doubling that producer's output: the first unlocks when 1 unit is owned and costs 10 × base price; the second unlocks when 10 units are owned and costs 100 × base price.

#### Scenario: Doubling a producer
- **WHEN** the player owns 2 Spud Farmers and the first Spud Farmer upgrade
- **THEN** Spud Farmers contribute 4 potatoes per second

#### Scenario: Unlock threshold
- **WHEN** the player owns 9 Potato Peelers
- **THEN** the second Peeler upgrade is not offered

### Requirement: Buying upgrades
The game SHALL show only unlocked, not-yet-owned upgrades in the upgrades area, sorted by price. Buying an upgrade SHALL require the bank to cover its price, deduct the price, and mark it owned permanently. An owned upgrade SHALL NOT be offered again. A locked upgrade SHALL NOT be purchasable.

#### Scenario: Buy an unlocked upgrade
- **WHEN** the player has made 10 clicks, has 150 potatoes and buys Calloused Hands
- **THEN** the bank is 50, PPC is 2, and Calloused Hands is no longer offered

#### Scenario: Locked upgrade
- **WHEN** the player has made 5 clicks and has 1,000 potatoes
- **THEN** buying Calloused Hands is refused and the bank stays 1,000
