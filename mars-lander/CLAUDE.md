# Mars Lander (CodinGame optimization)

Game page: https://www.codingame.com/multiplayer/optimization/mars-lander

## How Claude works here

Claude is a **mentor**, not the implementer.

- Ask guiding questions and give hints. Give a bigger hint only when the user is stuck.
- Review the user's code and point out problems. Don't rewrite it or write solution code.
- Tooling and setup help (test config, scripts, running things) is fine. Ask if unsure.
- Use plain, everyday language.

## Project setup

- TypeScript, run with `tsx`, tests with `vitest` (`npm test`), type check with `npm run typecheck`.
- Code goes in `src/`. Note: CodinGame takes **one file**, so the final bot has to be bundled or pasted as a single file.

## User background

- Solved Mars Lander Episode 1 with a simple if/else bot.
- Wants to go further with the optimization version and learn better approaches.

## Progress tracking (read this)

Two places, with different jobs:

- **`CLAUDE.md` → "Current state"** (below): short, always loaded. What exists now, open guesses, open decisions, next step.
- **`PROGRESS.md`**: the full session-by-session log (how the design got here, bugs found, lessons). Not loaded automatically.

When to read `PROGRESS.md`:
- At the start of a session, read at least the **last session** in it before giving guidance.
- Before answering "why is it like this?", or when a topic comes back (physics formulas, terrain checks, rounding, testing lessons), search it for what was already settled, so the user doesn't redo or get contradicted on settled points.

When to update (at the end of a session, or when the user asks):
1. Add a new `## Session N (date)` section at the bottom of `PROGRESS.md`.
2. Update "Current state" here: change what exists, move closed items out, add new open guesses / decisions, rewrite "Next step".
3. Anything still in play (open guesses, TODOs, undecided choices) **must** be in "Current state", not only in the log. Keep "Current state" short; details go in the log.

## Current state (as of Session 6, 2026-11-28)

### What exists (`src/`, 38 tests pass, typecheck clean)

- `types.ts`: `Ship` (x, y, hSpeed, vSpeed, fuel, rotationAngle, thrustPower), `Move`, `Point`, `LandingZone`, `ShipStatus` (FLYING / CRASHED / LANDED), `SimulationResult` (`{ state, status }`), `TraceStep` (`{ step, ship, status }`, step 0 = start, k = after k moves).
- `ship-engine.ts`: `calculateNextState(ship, move)`, the physics. Matches CodinGame logs exactly over many turns.
- `environment.ts`: `checkShipStatus(cur, next, terrain, landingZone)` judges one turn (segment–segment hit test, map borders, landing rules). `findLandingZone(terrain)` runs once.
- `simulator.ts`: `simulate(ship, moveList, terrain, landingZone, onStep?)` plays one plan, stops at impact. `onStep` is only for the viz; the search won't pass it.
- `constants.ts`, `codingame.d.ts` (declares `readline`, don't paste it to CodinGame), `index.ts` (game I/O, not built out yet).

### Settled rules worth remembering (details in `PROGRESS.md`)

- The game keeps decimals inside and only shows rounded values. No `Math.round` in the physics; round only in tests (`toBeCloseTo(x, 0)`).
- The push uses the **new** angle/power (after this turn's change). Position = old + speed + a/2.
- Positive angle tilts left, pushes toward negative x. y = 0 is the ground, map x 0–6999, y 0–2999.
- Fuel: power X uses X liters per turn. With fuel left at turn start, the full push happens and fuel clamps at 0. Power drops to 0 only when fuel is already 0.
- Testing: chained tests from the exact turn-0 state catch small errors; one-turn tests from rounded log values don't. Check the input (terrain) first when a test disagrees with the game. Break the code on purpose to prove a test can fail.
- `src` must never import from `viz`.

### Open guesses (check against the real game if something disagrees)

- Landing uses the **new** state's speeds; the real touchdown is mid-turn (TODO in `environment.ts`).
- Crash point: the sim returns the end-of-turn point (can be below ground); CodinGame shows the touch point (TODO in `simulator.ts`). Same root cause as above, fix together if scoring needs it.
- Does the game compare rounded or exact speeds at landing? Is x = 6999.5 off the map?
- JS `Math.round(-2.5)` = -2; unknown if the game does the same. Suspect this if a chained turn is ever off by exactly 1.

### Open decisions

- Real bot: trust the game's rounded input every turn, or read once and keep own decimal state?
- Big choice: (A) smarter rules vs (B) simulate and search. How plans are made (random, genetic, …).
- Scoring draft in `src/SEARCH_AND_SCORE.md` (uncommitted notes): how to rank two crashed plans, etc.

### In progress: D3 viz (`viz/`, not committed; local `tsconfig.json` includes `viz`)

- `viz/export.ts` (run with `npx tsx`): run plans through `simulate` with `onStep`, write JSON like `{ terrain, landingZone, paths: [{ status, trace }] }`. Open: status as number or name, which level first.
- `viz/index.html`: D3 as an ES module from a CDN, served with `python3 -m http.server` (`fetch` fails on `file://`). `scaleLinear` (flip y), `d3.line` for terrain, `data().join()` for many paths.

### Next step

- **Viz:** finish `viz/export.ts` and the first page. Milestone: terrain + pad + the 10-turn `-20 3` path, matching CodinGame.
- **Then search / scoring:** how to compare two plans, especially two that both crash (pad at vSpeed −45 vs a slope 2000 units away)? Is `{ state, status }` enough for a score?
