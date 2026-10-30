# Spec Delta

## Purpose

Lets the player earn potatoes by clicking the big potato, and shows how many potatoes they have and have earned over time.

## ADDED Requirements

### Requirement: Clicking harvests potatoes
The game SHALL add the current potatoes-per-click (PPC) value to the player's bank each time the big potato is clicked. A new game SHALL start with a bank of 0 and a PPC of 1.

#### Scenario: First click of a new game
- **WHEN** a new game starts and the player clicks the potato once
- **THEN** the bank shows 1 potato

#### Scenario: Click with upgraded PPC
- **WHEN** the player's PPC is 4 and they click the potato
- **THEN** the bank increases by 4

### Requirement: Click feedback
The game SHALL show the amount gained as a floating "+N" label near the click position and SHALL animate the potato on each click.

#### Scenario: Floating label
- **WHEN** the player clicks the potato with a PPC of 2
- **THEN** a "+2" label appears near the cursor and fades out within about one second

### Requirement: Lifetime statistics
The game SHALL track total potatoes ever harvested (from all sources, not reduced by spending) and the total number of potato clicks, and SHALL display them in a stats area.

#### Scenario: Spending does not reduce lifetime total
- **WHEN** the player has harvested 100 potatoes and spends 15 on a producer
- **THEN** the bank shows 85 and the lifetime total shows 100

### Requirement: Readable large numbers
The game SHALL display whole-number amounts below one million with thousands separators, and amounts of one million or more as a mantissa with three decimals followed by a scale word (million, billion, trillion, ...). Amounts below 1000 that have a fractional part SHALL show at most one decimal.

#### Scenario: Small number
- **WHEN** the amount is 12345
- **THEN** it is displayed as "12,345"

#### Scenario: Large number
- **WHEN** the amount is 1234567
- **THEN** it is displayed as "1.235 million"

#### Scenario: Fractional rate
- **WHEN** the per-second rate is 0.1
- **THEN** it is displayed as "0.1"
