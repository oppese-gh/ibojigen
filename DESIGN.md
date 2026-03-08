# ぼじろーぐ DESIGN

## Overview
ぼじろーぐ is a single-file, turn-based Unicode roguelike game.
The implementation is intentionally kept simple and compact.

Primary goals:
- keep the project easy to understand
- keep the project easy to modify with AI assistance
- preserve gameplay clarity over architectural purity

---

## Project Structure Policy

### Single-file policy
- The main game implementation must stay in a single `index.html` file.
- Do not split core gameplay logic into multiple JS files or modules unless explicitly requested.
- Do not introduce frameworks, build tools, or bundlers.
- Small support files such as images or markdown docs are allowed.
- If data is separated, keep it minimal and only when explicitly requested.

### Change policy
- Prefer the smallest possible change.
- Preserve existing behavior unless the requested task explicitly changes it.
- Do not perform broad refactors without explicit approval.
- Do not rename major functions or variables unless necessary.
- Do not change key bindings unless explicitly requested.

---

## Language / UI Policy

このプロジェクトでは日本語を使用します。

以下はすべて日本語で記述してください。

- コードコメント
- ゲーム内ログ
- GitHub PRサマリー
- AI生成の説明

特別な理由がない限り英語は使用しないでください。

### Display language
- In-game text is primarily Japanese.
- Common game labels may remain in English:
  - HP
  - ATK
  - DEF
  - SCORE
  - EXP
  - Lv
  - BEST

### UI style
- Keep the UI simple and readable.
- Preserve the current Unicode-based presentation.
- Do not replace the Unicode aesthetic with image-based UI unless explicitly requested.
- Keep status readability high.
- Important combat results should be visible and easy to understand.

---

## Core Game Rules

### Game style
- Turn-based roguelike
- Grid movement
- Random rooms and corridors
- Player acts first, then turn progresses

### Turn flow
A normal turn is based on `endTurn()`.

Typical order:
1. player action
2. enemy turn
3. hunger processing
4. ibo processing
5. render

Do not change this order unless explicitly requested.

### Game state
- Major mutable game state should remain under `state`
- `state.player` contains player-related stats
- floor-based temporary buffs should reset when entering a new floor
- game-over and input-lock states must be respected before accepting actions

---

## Important Architectural Rules

### State handling
- Keep major gameplay state centralized in `state`
- Avoid scattering important state across unrelated globals
- New persistent gameplay state should usually be added under `state`

### Rendering
- `render()` should mainly display current state
- Avoid adding heavy gameplay side effects inside `render()`
- If possible, gameplay updates should happen before rendering

### Turn safety
- Any action that consumes a turn should end through `endTurn()`
- Actions that should not consume a turn must be explicitly designed that way
- Be careful not to accidentally skip or double-run turn progression

---

## Inventory / Item Rules

### Inventory basics
- Inventory uses fixed slots
- Items are consumed or used according to their existing behavior
- Do not redesign inventory structure unless explicitly requested

### Pickup behavior
Two pickup modes exist:
- `inventory`: item goes into inventory
- `instant`: item activates immediately on pickup

This distinction is important and must be preserved.

### Item design principle
- Keep item behavior easy to understand
- Prefer clear and game-readable effects
- Avoid overly abstract item effects unless explicitly requested

---

## Enemy / Combat Rules

### Combat readability
- Damage target must always be clear in logs and UI
- Important combat events should be understandable at a glance
- Critical hits and special effects should remain easy to notice

### Enemy design
- Enemies may have unique effects
- Do not rewrite all enemy behavior into a new abstraction unless explicitly requested
- Prefer minimal additions to existing logic structure

### Balance principle
- Avoid sudden extreme scaling unless intentionally designed
- Early floors should remain understandable and fair
- Late floors may become harder, but progression should still feel readable

---

## Floor / Event Rules

### Floor progression
- Reaching the ladder advances to the next floor
- Floor transition resets floor-only buffs and regenerates floor content

### Events
Special floor events may exist, such as:
- monster house
- asahiyama

When adding events, always define:
1. trigger condition
2. object or marker
3. gameplay effect
4. log / message text
5. whether the event is reusable or one-time

---

## AI Editing Rules

When modifying this project, follow these rules:

- Keep the project as a single-file game unless explicitly instructed otherwise
- Do not split files
- Do not introduce JS modules
- Do not perform broad cleanup or architecture refactors
- Make the smallest possible change
- Preserve current gameplay unless change is requested
- Preserve Japanese UI text style
- Preserve Unicode-based design
- Keep logs readable
- Keep damage targets explicit

---

## Preferred Request Format for Changes

When implementing a new feature or change, define:

1. purpose
2. trigger condition
3. exact effect
4. exceptions
5. UI/log message
6. whether it consumes a turn
7. whether it is permanent or floor-only

This project works best when requirements are explicit.

---

## Current Development Priorities
- improve gameplay readability
- improve combat clarity
- improve balance gradually
- add interesting but simple events
- avoid unnecessary complexity
- preserve easy AI-assisted development

---

## Non-goals
- large-scale architecture refactor
- framework migration
- multi-file modularization by default
- overengineering

- replacing the Unicode identity of the game
