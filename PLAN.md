# Meowdoku clone: build plan

A frontend-only clone of the mobile puzzle game Meowdoku, built with React and TypeScript, designed for phones first and tablets at most.

The build is split into 18 small steps (section 15). Each step produces something the user can try on their phone. After every step the builder stops, tells the user exactly how to test it, and waits for a go-ahead. Section 15 starts with those working rules; read them before writing any code.

## 1. The game

The board is an N×N grid divided into N coloured regions. The player places cats so that:

1. every row has exactly one cat,
2. every column has exactly one cat,
3. every coloured region has exactly one cat,
4. no two cats touch, not even diagonally.

Every puzzle has exactly one solution and can be solved by logic alone, with no guessing. The player has 3 lives ("fish crackers"). Trying to place a cat on a cell that is not part of the solution costs a life. Losing all three ends the puzzle.

## 2. Decisions already made

| Topic | Decision |
| --- | --- |
| Platform | Phones first, tablets at most. Portrait is the main layout. No desktop-specific layout and no keyboard controls. On a large screen the app is simply the same narrow column, centred |
| Modes | Free play (pick a difficulty, endless generated puzzles) and a Daily puzzle (same for everyone on a given date) |
| Sizes | Easy 5×5, Normal 7×7, Hard 9×9, Extreme 10×10. Daily is always 9×9 |
| Mistakes | 3 lives. A wrong cat is rejected, costs a life, and leaves a cross on that cell |
| Undo | Takes back the last move. Never gives a life back |
| Auto-cross | When a cat is placed, every cell it rules out is crossed automatically. A setting, on by default |
| Hints | Unlimited. Each hint points at the next logical step and explains why |
| Timer | Counts up per puzzle. Best time per difficulty is saved |
| Art | Inline SVG cats and icons drawn in code, pastel palette. No image files |
| Feedback | Synthesised sound effects (Web Audio, no audio files) and CSS animations. No vibration: iOS gives web pages no usable way to trigger it |
| Backend | None. Puzzles are generated in the browser, progress is in `localStorage` |

Out of scope for this version: desktop layout, keyboard controls and shortcuts, streaks, leaderboards, campaign levels, drag-to-cross, dark mode, accounts, PWA/offline install. Do not build these.

## 3. Stack and setup

- Vite + React + TypeScript (strict), package manager `pnpm`, Node 22.
- Vitest for unit tests of the game logic.
- CSS Modules plus CSS custom properties in one global `tokens.css`. No UI or CSS framework.
- No router and no state library. One `useReducer` for the game, a `screen` state in `App`.
- One runtime dependency besides React: `canvas-confetti` (with `@types/canvas-confetti`).

Setup notes:

- The folder already contains `PLAN.md` and `reference/`. `pnpm create vite` prompts when the target folder is not empty, so scaffold into a temporary subfolder (`pnpm create vite@latest scaffold-tmp --template react-ts`), move its contents to the project root, and delete the subfolder. If the scaffolder still prompts, write the few scaffold files by hand instead.
- Remove the template's demo content (logos, counter, `App.css`).
- Add scripts: `dev` (`vite --host`), `build` (`tsc -b && vite build`), `preview` (`vite preview --host`), `test` (`vitest run`), `lint`.
- `--host` makes the dev server reachable from a phone on the same Wi-Fi. Vite prints a "Network" URL such as `http://192.168.1.23:5173`; that is the address the user opens on their phone.
- `index.html` viewport: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- The folder is not a git repository. Run `git init` in step 1 and commit at the end of each step.

## 4. File layout

```
src/
  main.tsx
  App.tsx                    screen switch: 'home' | 'game'
  styles/tokens.css          colours, radii, shadows, fonts, global resets
  game/
    types.ts
    rng.ts                   hashString, mulberry32, shuffle
    solver.ts                solve (counts solutions), isConnectedWithout
    logic.ts                 createBoard, findStep, applyStep, grade (human-style deductions)
    generator.ts             generatePuzzle (pure, synchronous)
    generator.worker.ts      runs generatePuzzle off the main thread
    generateAsync.ts         promise wrapper around the worker
    reducer.ts               game state transitions
    hints.ts                 getHint for the player's current board
    hintText.ts              turns a Hint into a sentence
    daily.ts                 today's date key and daily puzzle id
    storage.ts               typed localStorage helpers (settings, saved games, stats)
    debug.ts                 dev-only `?debug`, `?art` and `?date=` switches (section 15)
    *.test.ts
  audio/sfx.ts               Web Audio sound effects
  hooks/
    useGame.ts               reducer + persistence + sound triggers + stats
    useDoubleTap.ts          tap versus double-tap on a cell
    useGameTimer.ts          dispatches ticks while the game is active and visible
  components/
    Home/  Game/  Board/  Cell/  Cat/  Lives/  Timer/  Controls/  HintBar/
    Dialog/  HowToPlay/  Settings/  icons/  ArtGallery/ (dev only)
```

## 5. Data model

```ts
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';
export const SIZES: Record<Difficulty, number> = { easy: 5, normal: 7, hard: 9, extreme: 10 };

export interface Puzzle {
  id: string;          // 'free-<uint32>' or 'daily-YYYY-MM-DD'
  size: number;
  regions: number[];   // length size*size, regions[row * size + col] = region index 0..size-1
  solution: number[];  // length size, solution[row] = column of that row's cat
  level: number;       // hardest deduction technique needed, 1 to 5 (see section 6)
}

export type Mark = 'empty' | 'cross' | 'cat';
export type Mode = 'free' | 'daily';
export type Status = 'playing' | 'won' | 'lost';

export interface GameEvent {
  kind: 'cross' | 'uncross' | 'cat' | 'miss' | 'undo' | 'win' | 'lose';
  cell: number;                 // the cell the player acted on (-1 for undo)
  autoCrossed: number[];        // cells crossed automatically by this cat, otherwise empty
  seq: number;                  // increments on every event
}

export interface Patch {
  cells: number[];              // cells changed by one move
  before: Mark[];               // their marks before the move, same order
}

export interface GameState {
  mode: Mode;
  difficulty: Difficulty;
  puzzle: Puzzle;
  marks: Mark[];                // length size*size
  lives: number;                // starts at 3
  status: Status;
  history: Patch[];             // undo stack, newest last, capped at 500
  elapsedMs: number;            // play time for this attempt
  hintsUsed: number;            // hints shown during this attempt
  attempt: number;              // 1 on first try, +1 on every retry
  lastEvent: GameEvent | null;  // drives sound and animation; never persisted
}

export interface Settings { muted: boolean; autoCross: boolean; seenHowTo: boolean }
export interface Stats { wins: number; bestMs: number | null }   // one per difficulty, plus one for daily
```

Cells are addressed by a single index `row * size + col` everywhere. Units are addressed by a single index too: `0..n-1` are rows, `n..2n-1` are columns, `2n..3n-1` are regions.

## 6. Puzzle generation and the logic solver

A working, verified implementation of everything in this section is in `reference/generator-prototype.mjs`. Port it to TypeScript (`rng.ts`, `solver.ts`, `logic.ts`, `generator.ts`) without changing the algorithms or the order of random calls, then delete the `reference/` folder once the tests in step 2 pass. `node reference/generator-prototype.mjs` runs its self-check (pass a number to change how many seeds it checks).

### Generator

1. **Random solution.** Backtrack row by row over shuffled columns. One cat per row and column already prevents orthogonal contact, so the only extra rule is that cats in neighbouring rows are at least two columns apart.
2. **Grow regions.** Region `r` starts at the cat in row `r`. Repeatedly give one unassigned cell to a neighbouring region, chosen with a random per-region weight so region sizes vary.
3. **Repair until unique.** Run the brute-force solver with a limit of 2. If it finds a second solution, take one of that solution's cats that is not in the intended solution and reassign its cell to a neighbouring region (only if its old region stays connected). That removes the second solution without touching the intended one. Repeat, up to 200 times, then start over.
4. **Shape gate.** Accept only boards with at most one single-cell region and no region larger than 30% of the board.
5. **Logic gate.** Solve the board with the logic solver below, limited to the techniques allowed for that size. Reject it if the solver gets stuck (the puzzle would need guessing) or if it turns out too easy for that size.

### Logic solver (`logic.ts`)

It keeps a set of candidate cells (cells that could still hold a cat) and repeatedly applies the easiest technique that makes progress. `findStep(board, maxLevel)` returns one step, `grade(...)` loops it from an empty board. The same `findStep` powers hints (section 9).

| Level | Technique | Deduction |
| --- | --- | --- |
| 1 | `single` | A row, column or region has one candidate left, so the cat goes there |
| 2 | `confine` with 1 unit | All candidates of a region are in one row or column (or all candidates of a row or column are in one region), so the rest of that row, column or region can be crossed |
| 3 | `blocks` | A cat on this cell would leave some other row, column or region with no candidates, so cross it |
| 4 | `confine` with 2 units | Two regions only fit inside two rows or columns (or the reverse), so the other cells in those lines can be crossed |
| 5 | `confine` with 3 or 4 units | The same with three or four units |

A step is `{ level, technique, action: 'cat' | 'cross', cells, units, into }`, where `cells` are the cells to act on, `units` are the units that explain it, and `into` (confine only) are the lines or regions being claimed.

Allowed range of a puzzle's hardest technique, per size:

| Size | Min level | Max level |
| --- | --- | --- |
| 5×5 | 1 | 3 |
| 7×7 | 2 | 4 |
| 9×9 | 2 | 5 |
| 10×10 | 3 | 5 |

### Measured performance

Prototype on Node 22, 500 seeds per size. Every puzzle was checked to be unique, connected, deterministic, and solved by the logic solver to the same answer as the brute-force solver.

| Size | Average | 95th percentile | Slowest |
| --- | --- | --- | --- |
| 5×5 | 0.2 ms | 0.4 ms | 5 ms |
| 7×7 | 0.8 ms | 2 ms | 6 ms |
| 9×9 | 9 ms | 31 ms | 99 ms |
| 10×10 | 67 ms | 224 ms | 679 ms |

Phones are several times slower, so generation runs in a Web Worker (step 7) and the game screen shows a short loading state.

### Seeds and ids

- `seed = hashString('v1:' + puzzle.id + ':' + size)`, then `mulberry32(seed)`.
- Free play id: `'free-' + crypto.getRandomValues(new Uint32Array(1))[0]`.
- Daily id: `'daily-' + YYYY-MM-DD` using the player's **local** date.
- Never use `Math.random` inside the generator. The daily puzzle is only the same for everyone if the generator is fully deterministic. Any later change to the generator, the logic solver or the level table must bump `v1` to `v2`.

## 7. Game rules in the reducer

Actions: `start(state)`, `toggleCross(cell)`, `placeCat(cell, { autoCross, fromDoubleTap })`, `crossCells(cells)`, `undo`, `retry`, `tick(deltaMs)`, `hintShown`.

General rules:

- Cell actions, `undo` and `tick` are ignored unless `status === 'playing'`. Cell actions are ignored on a cell that already holds a cat.
- Every successful move pushes one `Patch` onto `history`. A miss does not.
- Every event increments `lastEvent.seq` so the same event twice in a row still triggers sound and animation. `tick` and `hintShown` never touch `lastEvent`.

Per action:

- **`toggleCross`**: `empty` becomes `cross` (event `cross`), `cross` becomes `empty` (event `uncross`).
- **`placeCat`** works from `empty` or `cross`.
  - If `fromDoubleTap` is true and the newest history entry is a single-cell toggle of this same cell, pop and revert that entry first. The first tap of a double-tap has already toggled the cell, and this keeps the whole double-tap as one undo step.
  - Correct (`puzzle.solution[row] === col`): the mark becomes `cat`. If `autoCross` is on, every `empty` cell in the same row, column or region, and every `empty` cell touching it, becomes `cross`; list them in `autoCrossed`. Cat and auto-crosses form one patch. Event `cat`, or `win` with `status = 'won'` if the board now has `size` cats.
  - Wrong: `lives -= 1`, the mark becomes `cross`, nothing is pushed to history. Event `miss`, or `lose` with `status = 'lost'` if lives reach 0.
- **`crossCells`** (used when a hint is applied): crosses all given `empty` cells as one patch. Event `cross`.
- **`undo`**: pops the newest patch and restores its marks. Event `undo`. It can take back a cat together with its auto-crosses. It never changes `lives`, `hintsUsed` or `elapsedMs`.
- **`retry`**: same puzzle, marks cleared, 3 lives, `history` emptied, `elapsedMs = 0`, `hintsUsed = 0`, `attempt += 1`, `status = 'playing'`.
- **`tick`**: `elapsedMs += deltaMs`.
- **`hintShown`**: `hintsUsed += 1`.

Tapping a cat does nothing. Because wrong cats are rejected, every cat on the board is correct, so there is no reason to remove one by hand. (The original removes a cat on tap; this is a deliberate simplification. Undo can still take back the most recent cat.)

## 8. Input

Touch is the only input that matters. Implemented in `useDoubleTap`:

- A tap toggles the cross immediately. There is no delay waiting to see whether a second tap follows.
- A second tap on the **same cell** within 300 ms places a cat instead: dispatch `placeCat` with `fromDoubleTap: true`.
- Net effect: tap = cross on/off, double-tap = cat. A slow double-tap just turns the cross on and off, which is harmless.
- Use `onClick` with a ref holding `{ cell, time }`. Do not use `onDoubleClick`; it is unreliable on touch screens. `onClick` also works with a mouse, which is all the desktop support needed.

Cells are `<button>`s with an `aria-label` such as "Row 3, column 4, pink region, crossed", so screen readers on phones can read the board. There is no keyboard navigation.

Required CSS on the board and its cells:

- `touch-action: manipulation` (stops double-tap zoom),
- `user-select: none` and `-webkit-touch-callout: none` (no text selection or long-press menu),
- `-webkit-tap-highlight-color: transparent`.

Do not put anything important behind `:hover`. Wrap hover styles in `@media (hover: hover)` so they do not stick after a tap.

## 9. Hints

`getHint(state): Hint` in `hints.ts` looks at the player's current board and returns the next thing to do. It checks in this order and returns the first match:

1. **Wrong cross.** A crossed cell that is in the solution. Action: remove the cross.
2. **Cat exclusion.** An `empty` cell that shares a row, column or region with a placed cat, or touches one. Return all such cells for the first cat that has any. Action: cross them. (Only happens when auto-cross is off or the player removed a cross.)
3. **Logic step.** Build a logic board from the player's state: place every cat with `boardPlaceCat`, mark every crossed cell as not a candidate, then call `findStep(board, 5)`. Always use all five levels here, whatever the puzzle's own level.
4. **Reveal** (safety net). The solution cell of the first row without a cat. Should not be reachable in practice, because the wrong-cross check above guarantees the player's crosses are correct and every puzzle is logic-solvable.

```ts
export interface Hint {
  kind: 'wrongCross' | 'catExclusion' | 'single' | 'confine' | 'blocks' | 'reveal';
  action: 'cat' | 'cross' | 'uncross';
  cells: number[];        // cells the player should act on
  units: number[];        // rows, columns or regions that explain it
  into: number[];         // confine only: the lines or regions being claimed
  reasonCells: number[];  // catExclusion only: the cat responsible
}
```

`hintText.ts` turns a hint into one or two short sentences. Name units as "row 3", "column 5" or by region colour ("the mint region"). Templates:

| Kind | Text |
| --- | --- |
| `wrongCross` | "This cross is hiding a spot where a cat belongs. Remove it." |
| `catExclusion` | "These cells are in this cat's row, column or region, or touch it. Cross them out." |
| `single` | "Only one cell is left for a cat in {unit}." |
| `confine`, region into line | "Every spot left in {region} is in {line}, so that line's cat must be in this region. Cross out the rest of {line}." |
| `confine`, line into region | "Every spot left in {line} is in {region}, so this region's cat must be in that line. Cross out the rest of {region}." |
| `confine`, 2 or more | "{These k regions} only fit in {these k rows}, so those rows are taken. Cross out the other cells in them." (and the mirrored wording for the reverse direction) |
| `blocks` | "A cat here would leave no room for a cat in {unit}. Cross it out." |
| `reveal` | "A cat belongs here." |

Hint UI:

- A Hint button (light bulb) sits in the controls bar under the board. Pressing it computes the hint, dispatches `hintShown`, and opens the `HintBar`, which slides up over the controls bar at the bottom of the screen. The board must not move or be covered when it opens.
- While a hint is open: `cells` get a pulsing ring, cells of `units` and `into` get a soft highlight, `reasonCells` get an outline, and all other cells dim slightly.
- The `HintBar` shows the text, an "Apply" button and a close button. Apply dispatches the matching action: `placeCat`, `crossCells`, or `toggleCross` for `wrongCross`.
- Any move, undo, or closing the bar dismisses the hint. The open hint lives in component state, not in `GameState`, and is not persisted.

## 10. Timer and best times

- `useGameTimer` runs a one-second interval and dispatches `tick` with the real elapsed time since the last tick (measured with `performance.now()`, capped at 2,000 ms per tick so a sleeping tab does not add hours).
- It only runs while the puzzle is loaded, `status === 'playing'`, the tab is visible (`visibilitychange`), and no dialog is open.
- The header shows the time as `m:ss`.
- On a `win` event, `useGame` updates the stats for that difficulty (or for `daily`): `wins += 1`, and `bestMs` is replaced if this time is lower. A time only counts as a best if `hintsUsed === 0` and `attempt === 1`.
- Home shows the best time under each difficulty button. The win dialog shows the time and a "New best time!" badge when it applies. If hints or a retry made the time ineligible, the dialog says so in one line.

## 11. Screens and components

**Layout rules (all screens)**
- Designed at 360×740 (a small phone, portrait) and checked from 320 px wide up to a tablet (1024 px). The app is one column, `max-width: 640px`, centred. There is no separate desktop layout.
- Each screen fills the viewport with `min-height: 100dvh` (not `100vh`, which is wrong on mobile browsers) and respects the notch and home bar with `env(safe-area-inset-*)` padding.
- The game screen never scrolls. Set `overscroll-behavior: none` on `body` so the page does not bounce or pull-to-refresh mid-game.
- Buttons and other controls are at least 48 px tall. Board cells are the one exception: on a 10×10 board on a small phone they are about 33 px, which is acceptable.
- Primary actions sit in the lower half of the screen, within thumb reach.
- In landscape on a phone the board is sized by the available height; it only has to stay usable, not look designed.

**Home**
- Title with a cat illustration.
- Daily card: today's date, and either "Play", "Continue", or "Solved in m:ss, N crackers left".
- Four difficulty buttons (Easy 5×5, Normal 7×7, Hard 9×9, Extreme 10×10), each with its best time underneath. Each starts a new free-play puzzle.
- "Continue" button, shown only when an unfinished free-play game is saved.
- Settings button (gear) and a "How to play" button.

**Game** (top to bottom)
- Header: back button, title ("Easy 5×5" or "Daily, 12 Oct"), timer, three fish crackers for lives, settings button.
- Board: square, `min(100vw - 24px, 100dvh - 240px, 640px)` on a side, CSS grid with `size` columns, centred in the space between header and controls.
- One-line reminder: "Tap to cross out. Double-tap to place a cat."
- Controls bar, pinned to the bottom: Undo (disabled when `history` is empty or the game is over) and Hint (disabled when the game is over).
- Hint bar: slides up over the controls bar while a hint is open.
- Loading state while the puzzle is generated ("Herding cats...").

**Dialogs** (one `Dialog` component, shown as a bottom sheet: slides up from the bottom, full width up to 640 px, rounded top corners, dimmed backdrop, tap the backdrop or the close button to dismiss where closing is allowed)
- How to play: the four rules, the controls, the lives rule, what Undo and Hint do. Opens automatically on the first visit.
- Settings: Sound, Auto-cross, link to How to play.
- Win: "Purrfect!", time, crackers left, hints used, best-time badge. Buttons "Next puzzle" (free play) or "Home" (daily).
- Lose: "Out of crackers", buttons "Try again" (same puzzle) and "Home". Do not reveal the solution, since retry is allowed.

**Cell rendering**
- Background is the region colour.
- Thin 1 px line between cells of the same region. A 3 px dark border on every side where the neighbour belongs to a different region, and around the board edge. Compute the four border flags per cell once per puzzle with `useMemo`. Region borders matter because colour alone is not enough for colour-blind players.
- Content: nothing, a cross, or a `<Cat>`.

## 12. Visual design

Mood: cosy, soft, rounded. Light theme only.

```css
:root {
  --bg: #fff8ee;
  --surface: #ffffff;
  --ink: #3b2f2f;
  --ink-soft: rgba(59, 47, 47, 0.55);
  --accent: #f28b66;
  --danger: #e2574c;
  --hint: #ffd84d;
  --radius: 16px;
  --font: ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif;

  --region-0: #f9b4ab;  /* coral */      --region-1: #fbd38d;  /* apricot */
  --region-2: #fff1a8;  /* butter */     --region-3: #c5e8a3;  /* sage */
  --region-4: #9fe0c4;  /* mint */       --region-5: #a5dcf2;  /* sky */
  --region-6: #b3c0f7;  /* periwinkle */ --region-7: #d7b8f3;  /* lilac */
  --region-8: #f5b8de;  /* pink */       --region-9: #d9cbb8;  /* sand */
}
```

- Region `g` uses `--region-((g + offset) % 10)`, where `offset` comes from the puzzle seed so the same board does not always look the same. There are at most 10 regions, so no two regions share a colour. The colour names in the comments are used in `aria-label`s and hint text.
- **Cat**: one inline SVG component, `viewBox="0 0 100 100"`, a sitting or face-on cat with a 4 px `--ink` outline so it reads on every region colour. Fur variants via a prop: orange `#f2a65a`, grey `#9aa0a8`, black `#3b3b45`, cream `#f6e7cb`. Pick the variant from `(row + offset) % 4`.
- **Cross**: two thin rounded strokes in `--ink-soft`, about 35% of the cell.
- **Fish cracker**: small SVG fish in `--accent`. A lost life is shown as a faded outline.
- Icons (back, gear, undo, light bulb, sound on, sound off, close) are small inline SVGs in `components/icons/`.

## 13. Sound and animation

**Sound** (`audio/sfx.ts`): one lazily created `AudioContext`, resumed on the first user gesture. Every sound is an oscillator plus a gain envelope, with no audio files.

| Event | Sound |
| --- | --- |
| `cross` / `uncross` | 40 ms soft tick |
| `undo` | the same tick, lower pitch |
| `cat` | short "mew": pitch glides up then down over about 250 ms, low-pass filtered |
| `miss` | 200 ms low buzz |
| `win` | rising four-note arpeggio |
| `lose` | falling three notes |
| hint opened | soft two-note chime (played by the Hint button, not by an event) |

`useGame` plays event sounds in an effect keyed on `lastEvent.seq`. The mute setting is persisted and respected everywhere.

**Animation** (CSS keyframes, driven by `lastEvent`):

| Event | Animation |
| --- | --- |
| `cross` | cross fades and scales in, 100 ms |
| `cat` | cat pops in: scale 0 → 1.15 → 1, 250 ms. Auto-crosses ripple outward: each fades in with `animation-delay` of 25 ms × its distance from the cat (the larger of row and column distance) |
| `miss` | cell shakes and flashes `--danger`, 300 ms; the lost fish cracker drops and fades |
| `undo` | restored cells flash briefly |
| `win` | cats hop in a wave (`animation-delay: row * 60ms`), confetti burst, win dialog after about 900 ms |
| `lose` | board desaturates, lose dialog after about 600 ms |
| hint open | target cells pulse with a `--hint` ring until the hint closes |

Wrap all motion in `@media (prefers-reduced-motion: no-preference)` and skip confetti when reduced motion is requested. The hint ring stays visible without the pulse.

## 14. Persistence

`localStorage`, all keys prefixed `meowdoku:v1:`. Every read is wrapped in `try/catch` and validated; anything malformed is discarded.

| Key | Value |
| --- | --- |
| `settings` | `Settings`, defaults `{ muted: false, autoCross: true, seenHowTo: false }` |
| `game:free` | the last free-play `GameState` |
| `game:daily` | the daily `GameState`; discarded if its puzzle id is not today's |
| `stats` | `Record<Difficulty \| 'daily', Stats>` |

- Save on every state change, including ticks (once a second is fine). Strip `lastEvent` when saving and set it to `null` when loading, otherwise sounds and animations replay on page load.
- Store the full puzzle in the saved state rather than regenerating it from its id.
- A finished daily stays saved so Home can show its result. A lost daily can be retried.

## 15. Build steps

### Working rules for the builder

1. **One step at a time.** Do not start the next step until the user says the current one is fine.
2. **Before reporting a step as done:** run `pnpm test`, `pnpm lint` and `pnpm build`, fix anything that fails, and commit.
3. **Then send the user a message with exactly these parts:**
   - *What was built*, in one or two sentences.
   - *How to open it*: make sure `pnpm dev` is running and give the Network URL it printed (for example `http://192.168.1.23:5173`), including any query string the step needs.
   - *How to test*: the numbered list from that step below, adjusted if anything was built differently. Each item says what to do and what should happen.
   - *Known gaps*: anything in the step that is not working or was left out. Say "none" if there are none.
4. **Then stop and wait.** If the user reports a problem, fix it inside the same step and send updated test instructions for the fix.
5. The "How to test" lists assume the user's phone, on the same Wi-Fi as the computer. Chrome DevTools device mode at 360×740 is a fallback, not a replacement: double-tap, zoom and sound must be checked on a real phone.

### Debug switches (development builds only)

Implemented in `game/debug.ts`, active only when `import.meta.env.DEV` is true. They exist so the user can test quickly without solving every puzzle.

- `?debug` shows a small paw dot on every cell where a cat belongs.
- `?art` opens a gallery of every cat, mark and icon instead of the app, for judging and adjusting the artwork.
- `?date=YYYY-MM-DD` makes the app treat that date as today, for testing the daily puzzle.

`?debug` and `?date=` can be combined: `http://<ip>:5173/?debug&date=2026-10-13`. Add `?debug` in step 3, `?art` in step 4 and `?date=` in step 9.

---

### Step 1: scaffold and mobile shell
**Build:** the project from section 3, `tokens.css`, the viewport meta tag, the centred 640 px column with safe-area padding and `100dvh`, and a placeholder Home screen with the title "Meowdoku".
**How to test:**
1. Run `pnpm dev`. The terminal prints a "Network" URL.
2. Open that URL on your phone. You see a cream-coloured page with the title "Meowdoku".
3. Try to pinch-zoom and scroll. The page does not scroll or bounce.
4. Rotate the phone. The page still fills the screen with no horizontal scrollbar.

### Step 2: puzzle engine
**Build:** port `rng.ts`, `solver.ts`, `logic.ts`, `generator.ts` from `reference/`, plus `types.ts`. No UI changes.
**Tests to write:** for each size over at least 100 seeds (fewer for 10×10 if the suite gets slow): exactly `size` regions, every region orthogonally connected, `solve(…, 3)` returns exactly one solution equal to `puzzle.solution`, the shape gate holds, `grade` solves it within the level range for its size and lands on the same cats, and the same id produces a deep-equal puzzle twice. Add one snapshot test of a fixed daily id. Delete `reference/` once these pass.
**How to test:**
1. Run `pnpm test`. Every test passes, and the output lists generator tests for 5×5, 7×7, 9×9 and 10×10.
2. Check that the `reference/` folder is gone.
3. Nothing changes on the phone in this step.

### Step 3: board on screen
**Build:** `Board` and `Cell` with region colours and thick region borders, sized as in section 11. A temporary bar with buttons "5", "7", "9", "10" and "New" that generate a puzzle synchronously. The `?debug` paw dots. Cells do not react to taps yet.
**How to test:**
1. Open `<url>/?debug` on your phone. You see a square 7×7 board that nearly fills the screen width.
2. Count the colours: there are 7 coloured areas, each one connected, with a thick dark line between different colours.
3. Look at the paw dots: exactly one in every row, every column and every colour, and no two dots touch, not even at a corner.
4. Tap "5", "9", "10". The board changes size each time and still fits the screen with no scrolling.
5. Tap "New" five times. You get a different board each time.
6. Open `<url>` without `?debug`. The dots are gone.

### Step 4: cats and art
**Build:** all artwork from section 12, in its final form: the `Cat` SVG with its four fur variants, the cross, the fish cracker (full and lost), the paw dot used by `?debug`, the title cat for Home, and every icon (back, gear, undo, light bulb, sound on, sound off, close). Put the title cat on the placeholder Home screen. Add the dev-only `?art` gallery, which shows:
- each of the four cats on each of the ten region colours, at the cell size of a 5×5 board and at the cell size of a 10×10 board,
- the cross on each of the ten colours,
- the full and the lost fish cracker,
- every icon, with its name underneath.

**From this step on, every screen uses these components. No placeholder art (emoji, plain circles, text symbols) in any later step.** The gallery stays in the project so the art can be adjusted later.
**How to test:**
1. Open `<url>/?art` on your phone. You see the gallery; scroll through it.
2. Cats: each of the four fur colours is clearly visible on all ten backgrounds. Look closely at the cream cat on the butter and sand backgrounds, and the grey cat on the periwinkle one.
3. Small size: at the 10×10 cell size each cat is still recognisable as a cat, not a blob.
4. Crosses are visible on every colour but clearly quieter than the cats.
5. The full and lost crackers are easy to tell apart at a glance.
6. Each icon is recognisable without reading its name.
7. Open `<url>/?debug`. The board from step 3 now uses the final paw dot, and Home shows the title cat.
8. This is the moment to ask for changes to the look: cat shape, expression, fur colours, line weight. Describe what you want different and the builder adjusts it within this step before moving on.

### Step 5: crosses, cats and lives
**Build:** `reducer.ts` with `start`, `toggleCross`, `placeCat` (without auto-cross for now) and `retry`; `useDoubleTap`; `useGame`. Cells show the real cross and cats from step 4, with the fur variant chosen as in section 12. Lives are shown as a row of fish crackers above the board, and the game status (solved or out of crackers) as plain text next to them.
**Tests to write:** cross toggling; correct cat; wrong cat (life lost, cell crossed); `placeCat` from a crossed cell; win on the last cat; lose on the third miss; no changes after the game ends; `retry` resets.
**How to test** (open `<url>/?debug`):
1. Tap an empty cell. A cross appears at once. Tap it again. The cross disappears.
2. Double-tap a cell with a paw dot. A cat appears. All three crackers remain.
3. Double-tap a cell without a dot. No cat appears, the cell gets a cross, and one cracker is shown as lost.
4. Tap a cat. Nothing happens.
5. Double-tap quickly in several places. The page never zooms.
6. Place a cat on every dot. You see cats in more than one fur colour, the text says the puzzle is solved, and the board stops reacting.
7. Tap "New", then double-tap three cells without dots. All crackers are lost, the text says you are out of crackers, and the board stops reacting.

### Step 6: game screen, win and lose
**Build:** the Game header (back icon not wired yet, title, the fish crackers moved into it), the one-line reminder, the `Dialog` bottom sheet, the Win dialog ("Next puzzle") and the Lose dialog ("Try again"). Remove the plain-text status.
**How to test** (with `?debug`):
1. The header shows the size and three crackers.
2. Double-tap a cell without a dot. One cracker is shown as lost.
3. Solve the puzzle. A sheet slides up from the bottom saying "Purrfect!" with the crackers left. Tap "Next puzzle": a new board appears with 3 crackers.
4. Lose all three lives. A sheet says "Out of crackers". Tap "Try again": the same board comes back empty, with 3 crackers.

### Step 7: home screen and difficulties
**Build:** the Home screen with the four difficulty buttons, the working back button, `generator.worker.ts` and `generateAsync`, the "Herding cats..." loading state. Remove the temporary size bar. "Next puzzle" keeps the current difficulty.
**How to test:**
1. Open `<url>`. You see Home with Easy 5×5, Normal 7×7, Hard 9×9 and Extreme 10×10.
2. Tap each one in turn (use the back button to return). Each opens a board of the right size, and the header names the difficulty.
3. Tap Extreme several times in a row. You may briefly see "Herding cats..."; the screen never freezes.
4. On a 10×10 board, check that the whole screen fits without scrolling and that cells are still easy to hit.
5. Win a puzzle (use `?debug`) and tap "Next puzzle". The new board has the same size.

### Step 8: saving and Continue
**Build:** `storage.ts`, saving the free-play game on every change, restoring it on load, and the "Continue" button on Home.
**Tests to write:** saving strips `lastEvent`; a malformed saved value is ignored instead of crashing.
**How to test:**
1. Start a Normal puzzle, place a few crosses and one cat, and lose one life.
2. Reload the page. You land on Home, and a "Continue" button is visible.
3. Tap "Continue". The same board is back with the same crosses, cat and two crackers.
4. Go back and start an Easy puzzle. Go back again and tap "Continue": it now resumes the Easy puzzle.
5. Finish that puzzle and return Home. "Continue" is gone.

### Step 9: daily puzzle
**Build:** `daily.ts`, the Daily card on Home, daily mode in the game (9×9, title "Daily, 12 Oct"), a separately saved daily game, and the `?date=` debug switch. The Win dialog shows "Home" instead of "Next puzzle" for the daily.
**Tests to write:** the date key uses local time; the same date gives the same puzzle; different dates give different puzzles.
**How to test:**
1. On Home, the Daily card shows today's date and "Play". Tap it: a 9×9 board opens.
2. Place a few crosses, go back. The card now says "Continue".
3. Open the same URL in a second browser or a private tab and open the daily. The board has the same colours in the same places.
4. Start a free-play puzzle, then go back. Both "Continue" (free play) and the daily's "Continue" still work, each with its own board.
5. Solve the daily (use `?debug`). Back on Home the card says it is solved and shows the crackers left.
6. Open `<url>/?date=2026-10-13` (any other date). The card says "Play" again and the board is a different one.

### Step 10: settings and auto-cross
**Build:** the Settings sheet (gear button on Home and in the game header) with the Auto-cross switch, the settings storage, and auto-cross in `placeCat`. The Sound switch is added in step 17.
**Tests to write:** auto-cross crosses exactly the cat's row, column, region and the cells touching it, and leaves existing marks alone.
**How to test** (with `?debug`):
1. Tap the gear. A sheet slides up with an "Auto-cross" switch, turned on.
2. Close it and place a correct cat. Every other cell in its row, its column and its colour gets a cross, and so do the cells touching it diagonally.
3. Open Settings, turn Auto-cross off, place another correct cat. Only the cat appears.
4. Reload the page and open Settings. Auto-cross is still off.

### Step 11: undo
**Build:** the controls bar pinned to the bottom with the Undo button, the `history` stack, the `undo` action, and the double-tap rule from section 7.
**Tests to write:** undo restores a toggle; restores a cat with its auto-crosses in one step; never restores a life; a double-tap cat undoes back to the state before the first tap; a miss adds nothing to the history.
**How to test** (with `?debug`, Auto-cross on):
1. On a fresh board, Undo is greyed out.
2. Tap a cell to cross it, then tap Undo. The cross disappears.
3. Place a correct cat (its row, column and colour fill with crosses). Tap Undo once. The cat and all of those crosses disappear together, and the cell is empty, not crossed.
4. Double-tap a wrong cell to lose a life. Tap Undo. The lost cracker does not come back.
5. Make three moves, then tap Undo three times. The board is back where it started and Undo is greyed out again.
6. Reload mid-game, then tap Undo. It still takes back your last move.

### Step 12: timer and best times
**Build:** `useGameTimer`, the timer in the header, `elapsedMs` and `attempt` in the state, the stats storage, best times under the difficulty buttons, time and "New best time!" in the Win dialog, time on the solved Daily card.
**Tests to write:** `tick` adds time only while playing; `retry` resets time and increments `attempt`; a best time is recorded only when `hintsUsed === 0` and `attempt === 1`.
**How to test:**
1. Start an Easy puzzle. The header shows a timer counting up from 0:00.
2. Open Settings. The timer stops. Close it: the timer continues.
3. Switch to another app for ten seconds and come back. The timer did not count those ten seconds.
4. Reload and tap "Continue". The timer carries on from where it was.
5. Solve the puzzle (use `?debug`). The Win sheet shows your time and "New best time!". Home shows that time under Easy.
6. Solve another Easy puzzle more slowly. The best time on Home does not change.
7. Start an Easy puzzle, lose it on purpose, tap "Try again" and solve it very fast. The Win sheet says this time does not count as a best, and Home is unchanged.

### Step 13: hints
**Build:** `hints.ts`, `hintText.ts`, the Hint button in the controls bar, the `HintBar`, cell highlighting, Apply, and "hints used" in the Win dialog.
**Tests to write:** a play-through for at least 30 puzzles per size that starts from an empty board and repeatedly calls `getHint` and applies it through the reducer until the game is won; it must never return `reveal`, never cause a miss, and always finish; run it with auto-cross on and off. `wrongCross` is returned when a solution cell is crossed. `catExclusion` is returned when auto-cross is off and a cat's row still has empty cells. `hintText` gives a non-empty sentence for every hint seen in the play-through.
**How to test:**
1. Start an Easy puzzle without `?debug` and tap Hint. A bar slides up at the bottom with a sentence, one or more cells pulse, and the cells that explain the hint are highlighted. The board does not move.
2. Read the sentence and check it against the board: it should make sense as a reason.
3. Tap "Apply". The move is made for you and the bar closes.
4. Keep tapping Hint then Apply until the puzzle is solved. You never lose a cracker. The Win sheet shows how many hints you used and says the time does not count as a best.
5. Do the same on an Extreme puzzle. It also finishes without losing a cracker.
6. Open a hint, then tap any cell on the board. The hint closes.
7. With `?debug`: cross a cell that has a paw dot, then tap Hint. It tells you to remove that cross.
8. Turn Auto-cross off, place one correct cat, tap Hint. It tells you to cross out the cells that cat rules out.

### Step 14: how to play
**Build:** the How to play sheet with the four rules, the controls, lives, Undo and Hint; opened from Home and from Settings; opened automatically on the first visit (`seenHowTo`).
**How to test:**
1. Open the app in a private tab (so nothing is saved). The How to play sheet opens by itself.
2. Read it as a new player would. The rules and the tap and double-tap controls are clear.
3. Close it and reload. It does not open again.
4. Open it from the Home button and from Settings.

### Step 15: visual polish pass
**Build:** no new features. A pass over every screen and sheet against sections 11 and 12: typography, spacing, alignment, consistent corner radii and shadows, button states (normal, pressed, disabled), and the tablet and landscape layouts. Fix anything that drifted while features were being added.
**How to test:**
1. Go through Home, the game screen and every sheet (Settings, How to play, Win, Lose) and the hint bar on your phone. Nothing is cut off, overlaps, or needs scrolling, and every button is easy to hit with a thumb.
2. The screens look like one app: the same fonts, spacing, corner rounding and button style everywhere.
3. Disabled buttons (Undo on a fresh board) look clearly disabled; pressing a button gives visible feedback.
4. On a 10×10 board on your phone, the header, board, reminder and controls all fit without scrolling.
5. If you have a tablet, check the same screens there: the app is a centred column, and the board is larger but not stretched.
6. Rotate the phone during a game. The board still fits on screen.

### Step 16: animations
**Build:** every animation in section 13, the confetti, and reduced-motion handling.
**How to test** (with `?debug`):
1. Tap a cell: the cross fades in quickly.
2. Place a correct cat with Auto-cross on: the cat pops in and the crosses spread outward from it.
3. Double-tap a wrong cell: the cell shakes and flashes red, and a cracker drops away.
4. Tap Undo: the restored cells flash briefly.
5. Open a hint: the target cells pulse until the hint closes.
6. Win: the cats hop in a wave, confetti falls, then the Win sheet slides up.
7. Lose: the board fades to grey, then the Lose sheet slides up.
8. Reload in the middle of a game. Nothing animates on load.
9. Turn on "Reduce Motion" in the phone's accessibility settings and repeat items 2, 3 and 6. The game still works, without shaking, hopping or confetti.

### Step 17: sound
**Build:** `sfx.ts` and the Sound switch in Settings.
**How to test** (on an iPhone, turn the ring/silent switch to ring first, otherwise the browser plays nothing):
1. Tap a cell: a soft tick.
2. Place a correct cat: a short "mew".
3. Double-tap a wrong cell: a low buzz sound.
4. Tap Undo: a lower tick. Open a hint: a two-note chime.
5. Win: a rising run of notes. Lose: a falling one.
6. Open Settings and turn Sound off. Repeat items 1 to 3: silence. Reload: still silent.
7. Reload in the middle of a game. No sound plays on load.

### Step 18: final pass
**Build:** `aria-label`s on cells and icon buttons, page title, favicon (the cat SVG), theme colour meta tag, a short `README.md` with run instructions, and a check that the debug switches do nothing in a production build.
**How to test:**
1. Run `pnpm build`, then `pnpm preview`. Open the Network URL it prints (port 4173) on your phone. This is the production build.
2. Add `?debug` to the URL. No paw dots appear.
3. Play one full game in each mode without `?debug`: one free-play puzzle and the daily. Use crosses, cats, Undo and at least one hint. Everything from the earlier steps still works.
4. The browser tab shows the cat icon and the name "Meowdoku".
5. Optional: turn on VoiceOver or TalkBack and touch a few cells. Each one is read out with its row, column, colour and state.
6. Run `pnpm test` and `pnpm lint`. Both are clean.

## 16. Pitfalls

- **Double-tap zoom on iOS**: without `touch-action: manipulation` the second tap zooms the page.
- **`100vh` on phones**: it includes the area under the browser's address bar, so the controls bar ends up off-screen. Use `100dvh`.
- **iPhone silent switch**: Web Audio is silent while the ring/silent switch is on silent. This is expected, not a bug; say so in the step 17 test instructions.
- **Sticky hover**: on touch screens a `:hover` style stays on after a tap unless it is inside `@media (hover: hover)`.
- **Determinism**: a `Math.random`, a reordered random call, or a changed level table silently changes every daily puzzle. The snapshot test guards this.
- **Double-tap and undo**: the first tap of a double-tap pushes a toggle onto `history`. `placeCat` must pop it (section 7), or one undo leaves the cell in a half-way state.
- **Wrong cat on a crossed cell**: `placeCat` must work from `cross` as well as `empty`, for the same reason.
- **Undo and lives**: a miss is never on the undo stack, so undo cannot buy back a life.
- **Hints trust crosses**: the logic step treats the player's crosses as facts. The wrong-cross check must run first, or a bad cross produces a wrong hint.
- **Replayed events**: persisting `lastEvent` makes the last sound and animation fire on reload.
- **StrictMode**: effects run twice on mount in development. Key the sound effect on `lastEvent.seq` and start with `lastEvent: null` so nothing plays on mount.
- **Timer drift**: measure real elapsed time per tick instead of adding a fixed 1,000 ms, and cap each tick.
- **Audio autoplay**: create or resume the `AudioContext` only inside a user gesture.
- **Local date**: build the daily key from local year, month and day. `toISOString()` is UTC and flips the puzzle at the wrong time for most players.
