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

## Progress

### Session 1 (2026-11-19)

What the user worked out:
- The new part compared to Episode 1 is controlling tilt, which changes horizontal speed.
- Risk: tilting too far without enough time or height to get back to 0° before landing.
- If/else bots react to the current moment. They don't plan when best to use thrust, so they waste fuel.

- The game is deterministic: same state + same move always gives the same next state.
- First try at the function shape mixed up two different functions (see below).

Key idea to keep straight — two different functions:
- **Decide** (the bot's brain): state → move (`rotate`, `power`). This is what the user described.
- **Simulate** (`nextState`): state + move → next state. This is the physics, and what we want first.

- Agreed shape: `nextState(state, move)` where state = x, y, hSpeed, vSpeed, rotate, power, fuel; move = requested rotate + power. Fuel is in the state.

- Checking a plan = loop `nextState` from an initial state. Still open: what to check (landed / crashed / out of map), which needs the terrain.
- Physics sketch: correctly splits the thrust into a vertical and a horizontal part. First formulas had issues: called them speeds (they're accelerations), the horizontal part was based on vertical-after-gravity (`vSpeed * tan`), sign of the angle not checked, and degrees vs radians.

- Wrote `src/types.ts` (State, Move), `src/index.ts` (`calculateVAndH` acceleration with sin/cos + degToRad, `nextState` stub), `src/index.test.ts` (3 cases, passing).
- User checked the rules' control panel picture: negative angle = tilted right, positive = tilted left (90° is on the left). So positive rotate pushes the ship left (negative x). Fixed in code (renamed to `calculateAccelerations`) and test (now `it.each` with objects).
- Added a 30° case. It failed because the expected value was cut short (-1.499 instead of -1.5), not because of float precision. Lesson: `toBeCloseTo` already handles float noise. Don't `Math.round` inside the physics (ties into the open rounding question).
- Review notes given: angle sign still not checked against the rules (test encodes the same assumption, so it can't catch it); suggested `it.each` instead of forEach + undefined checks; add a tilted-but-not-90° case; `radToDeg` unused; `nextState` not exported or tested.

Open questions for the user:
- Output should be the *full* next state (same type as the input), not just position and angle. Why does that matter for chaining turns?
- Requested vs actual: rotate changes max ±15°/turn, power max ±1/turn. If you're at 0° and ask for 90°, what do you get? Should `nextState` handle that?
- How would you use `nextState` to check a 30-move plan before playing it?
- The inputs each turn are whole numbers. Is the game's real state whole numbers too? What could go wrong if the simulator rounds?
- Physics: for a given `rotate` and `power`, what is the push in x and in y? What does gravity add? Which way does a positive angle tip the lander?
- Big choice later: (A) smarter rules vs (B) simulate and search. Not decided yet.

- File plan (draft, by user): main.ts (game input + main loop), types.ts, constants.ts, physics.ts (acceleration etc.), simulator.ts (state + move → next state). Feedback given: no home yet for judging (landed/crashed, terrain) or decide/search; main.ts should stay thin I/O; physics vs simulator boundary unclear; functions vs classes not answered yet.

### Session 2 (2026-11-20)

- `types.ts` State/Move done (full state). `calculateAccelerations` sign checked against the rules. `constants.ts` added.
- Typecheck fixed: `src/codingame.d.ts` declares `readline` (don't paste it to CodinGame); `!` on `inputs[i]` in `index.ts`. Kept `noUncheckedIndexedAccess` on purpose.
- User found the fuel rule: power X uses X liters per turn. Fuel cap 2000, but the starting fuel comes from each level's input.
- Suggested `nextState` plan: (1) requested → actual move (±15°, ±1, limits), (2) old or new angle/power for the push, (3) position update with changing speed, (4) fuel, incl. running out. Check against real game data logged with `console.error`.

**Simulator done** (`src/simulator.ts`, `calculateNextState`). What the user built and learned:
- `rotateAngle` / `changeThrustPower` share a `changeControlValue` helper (step limit, then clamp). Power is also capped by fuel left (a guess, not yet seen in a real game).
- The push uses the **new** angle/power (after this turn's change). Settled with real game data: the old-angle version gave vSpeed -3.711, which can't display as -3.
- Position: `x + hSpeed + a/2` (old speed + half the acceleration), same rule for x and y.
- The game keeps decimals inside and only *shows* rounded numbers (round to nearest, checked against the log). No `Math.round` in the physics; round only in tests.
- Testing lesson: one-turn tests that start from rounded log values can't tell right from wrong (the wrong x formula passed, the right one failed). The chained test from the exact turn-0 state is the one that catches small errors that add up.
- Final test: 10 turns of `-20 3` from turn 0 (x 2500, y 2700, fuel 550), checked against the CodinGame log. 17 tests pass, typecheck clean.

Answered from the session 1 open questions: full next state, requested vs actual, angle sign, physics formulas, integers vs decimals.

Still open:
- In the real bot: trust the game's rounded input every turn (a), or read it once and keep your own decimal state with the simulator (b)? Not decided.
- ~~Fuel running out~~ **Settled** with real data (turns 151–153, `-20 4`): with 2 liters left, power stays 4 and the full push happens (speeds confirm it), fuel goes to 0 (not negative). Power drops to 0 only when fuel is already 0 at the start of a turn. Code updated (`fuel === 0` → power 0, `newFuel = max(0, …)`). Not yet tested: the `newFuel` clamp in `calculateNextState`.
- JS `Math.round(-2.5)` = -2. Unknown if the game rounds negative halves the same way. Check here first if a chained turn is ever off by exactly 1.
- Test nice-to-haves: check every turn (not only turn 10), and say which turn failed; a test with changing moves.
- Big choice: (A) smarter rules vs (B) simulate and search. Still not decided.

### Session 3 (2026-11-20 → 21)

**Terrain and judging** (`src/environment.ts`, 28 tests pass, typecheck clean).

How the design changed and what the user learned:
- First try: "is the ship's point exactly on a terrain line" (cross product vs `Number.EPSILON`). Problem: the ship moves tens of units per turn with decimals, so it almost never sits exactly on a line. Tests only passed because they used exact points.
- User looked into ray casting. It works, but the terrain has one ground height per x (check this holds on all levels), so a plain height lookup is the simple version. Both still check only **one point**, so they miss:
  - **Spike:** both ends of the move are above ground, but the path cuts through a thin peak.
  - **Pad edge:** where the ship touches the ground decides pad or not, not where it ends the turn.
- Settled on: the move in one turn = a straight segment old position → new position. The real path is a parabola, but it's off the straight line by at most about `acceleration / 8`, so about 1 unit. Check it with **segment–segment intersection** (`areSegmentsIntersect` / `direction`, cross-product signs).
- Speed signs: falling = negative `vSpeed`, so the safe-speed checks need `Math.abs` (and so does `hSpeed`). Landing also needs angle 0.
- Status is one enum, `ShipStatus` FLYING / CRASHED / LANDED, from one public function `checkShipStatus`, not three booleans. The three-boolean version had a bug: every ship still in the air counted as crashed.
- The judge must not do its own physics. An earlier version (`getShipTrajectory`) worked out the next position from the *old* angle and power, which is wrong (session 2) and also made testing hard. Now the judge takes plain points, so tests can aim straight at the spike and pad-edge cases.
- `findLandingZone` runs once and is passed in (the terrain never changes, and the search will run thousands of sims).

File plan agreed (each file = "takes X, returns Y"):
- engine / physics (`ship-engine.ts`, `calculateNextState`; was `simulator.ts`): state + move → next state.
- `environment.ts`: judges one turn → `ShipStatus`.
- simulator: the loop that uses both. Not written yet. (Old `simulator.ts` renamed to `ship-engine.ts` in Session 4.)

Test table used (terrain in `environment.test.ts`): flying high, soft landing, too fast, tilted, hits slope, spike (4950,1460)→(5050,1460), pad edge lands (2970,110)→(3010,95), pad edge hits slope first (3040,135)→(2990,90), off the side.

Open items in `environment.ts`: all closed in Session 4.

### Session 4 (2026-11-21)

**`environment.ts` finished** (32 tests pass, typecheck clean).

- In-line false crash fixed: the sign test plus a bounding-box overlap check. When the sign test passes and the points aren't all in a row, the boxes always overlap, so the box check only matters for the in-line case. Tests for both sides: in line but above ground → FLYING, in line and touching → CRASHED.
- Renamed: `doSegmentsTouch` (the real answer) = `areSegmentsStraddling` (sign test) && box overlap. `isShipClashOnTheTerrain` → `doesShipHitTerrain`.
- Map borders from the rules: x 0–6999, y 0–2999. y = 0 is the **ground** (bottom), so top = 2999. The first try had top/bottom swapped and the tests caught it. Constants are now `MAP_LEFT/RIGHT/TOP/BOTTOM_BORDER`.
- Signature is now `checkShipStatus(curShipState, newShipState, terrain, landingZone)`. Positions come from the states, so the ship and the points can't disagree.
- Landing uses the **new** state's angle and speeds. The angle is surely right (it's set at the start of the turn). The speeds are a **guess**: the real touchdown happens mid-turn, so the speed there is between old and new. Noted as a TODO in code.
- Tests are one `it.each` table with `$name` titles. Each row has full `curShipState` / `newShipState` (spread from `initShipState`). Added: hSpeed too fast, speeds exactly at the limit (-40 / +20), mixed hSpeed signs.
- Testing lesson: with two states per row, a value put on the wrong state is quietly ignored and the test still passes (the landing rows had their speeds on the old state). Check with a deliberate break, like `<=` → `<`.

Guesses to check against the real game if a landing ever disagrees:
- Old vs new vs touchdown-point speed at landing.
- Does the game compare rounded speeds (-40.4 shows -40) or exact ones?
- Is x = 6999.5 off the map?
- (from Session 2) `Math.round(-2.5)` = -2.

Small leftovers: the tilted row has a stray `vSpeed: -20` on `curShipState`. There's no "off the top" test.

### Session 5 (2026-11-21)

**Simulator done** (`src/simulator.ts`, `simulate`; 36 tests pass, typecheck clean).

- First draft mixed the simulator with the search (trying all 60 moves each turn, building a tree). Split them: the **simulator** plays one plan and reports what happened. The **search** (not written yet) picks which plans to try. A full tree is impossible anyway: 60 moves per turn over ~100 turns.
- Signature: `simulate(ship, moveList, terrain, landingZone): SimulationResult` (`{ state, status }`). The plan and the terrain are passed in so tests and the search can give their own.
- Status starts as `FLYING`, so an empty plan or a plan that runs out mid-air returns the last state + `FLYING`. No `undefined`.
- On crash or landing, it returns right away with the **impact turn's** state (`nextState`), not the turn before.
- Known difference (TODO in `simulator.ts`): CodinGame shows the crashed ship at the point where it **touches** the ground. The sim returns the **end-of-turn** point (can be below the ground). Same root cause as the Session 4 touchdown-speed TODO. Fix both together if scoring needs it (you'd need *where* on the segment it touched, not just *whether*). The two crash tests encode end-of-turn y on purpose, with notes.
- Testing lessons: a mismatch with the game was the **wrong terrain** in the test, not a physics bug. Check the input first. The break test (delete the early `return`) showed a plan that crashes on its *last* move can't prove the loop stops early. The fix was a test with moves left over (crash on turn 33 of 38).
- Tests: empty plan, 10 turns of `-20 3` (game data), crash on the last move (38 turns), crash with moves left over.

## Next step

- **Search / scoring:** how do you compare two plans, especially two that both crash (e.g. pad at vSpeed −45 vs a slope 2000 units away)? What numbers from `SimulationResult` would a score use, and is `{ state, status }` enough? Still open: the big choice (A) smarter rules vs (B) simulate and search, and how plans are made (random, genetic, etc.).
