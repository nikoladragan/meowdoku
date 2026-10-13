# Meowdoku: feedback and fixes

A running list of things to fix after trying the app. Each item says what you see now, what you want instead, and anything to decide before building it. Add new items at the bottom and keep the status up to date.

Status: `todo` · `in progress` · `done`

---

## 1. Mark a missed cell so it is obvious · `done`

**What happens now**
When you double-tap a cell that is not a cat spot, you lose a cracker and the cell gets a cross. That cross looks exactly like one you placed yourself, so afterwards it is hard to tell which cell was the mistake.

**What we want**
A cell where a wrong cat was tried is clearly marked as a miss, and stays marked, so you can see at a glance where you went wrong.

**Where it lives**
- The reducer ([src/game/reducer.ts](src/game/reducer.ts)) turns a wrong cell into a plain `cross` and records nothing else about it.
- Cells are drawn in [src/components/Cell/Cell.tsx](src/components/Cell/Cell.tsx) from `Mark` (`empty | cross | cat`) only.
- A miss is not on the undo stack on purpose, so undo cannot give a cracker back.

**To decide before building**
1. **How should a miss look?** For example a red cross with a red-tinted cell, so it is clearly different from a normal grey cross.
2. **Can the player clear it?** Tapping a missed cell could (a) do nothing, since the miss is a fact, or (b) turn it into a normal cross or empty.
3. **Does it survive a reload?** Probably yes, since it is part of the game. That means saving it, and old saved games without it must still load.
4. **Does it carry over to a retry?** A retry resets the board, so it should clear.

**Likely approach**
Keep the miss in game state next to the marks, either as a new mark value or as a list of missed cells, and render it distinctly in `Cell`. Whichever we pick, hints must keep working: a missed cell is never a solution cell, so it never triggers the "wrong cross" hint, and it must count as crossed for the logic solver.

**Done when**
- Missing a cell leaves a mark that is visibly different from a normal cross.
- It is still there after a reload and after other moves, and gone after Try again or a new puzzle.
- Undo, hints and auto-cross behave as before.
- Tests cover the reducer change and loading a saved game that has none.

---

## 2. Hints that look made up · `done`

**What happens now**
Some hints, usually near the top left, mark the right cell but give a reason that seems false, for example "a cat here would leave no room for a cat in the blue region" when blue looks like it still has room.

**What we found**
The reason was true every time. A test now replays messy games and checks each hint's sentence against the marks on screen, and none fail. Two things made true hints look false:
- The hint took the first blocking move in board order (top left first), not the clearest one. In over half of them some of the blocked spots did not touch the hinted cell: they were ruled out by sharing its row or column, often far away.
- The board tinted the whole region and never showed which spots the sentence was counting, so there was no way to check it.

**What changed**
- [src/game/hints.ts](src/game/hints.ts) picks the blocking move that is easiest to see: fewest spots that do not touch the cell, then fewest spots.
- The spots a hint rests on get a dashed outline on the board, for blocking and confinement hints.
- [src/game/hintText.ts](src/game/hintText.ts) says how many spots are left and how the cat rules them out (touching, same row, column or region).
- The hint bar grows with its text instead of clipping long hints on narrow phones.

## 3. Taps landing on the neighbouring cell · `done`

**What happens now**
A tap that slightly misses a cell lands on the cell next to it.

**What changed**
The outer 4 px of every cell is dead space: a tap there does nothing. The board looks the same, there is no visible gap. Keyboard and screen-reader activation always count. The width is `DEAD_ZONE_PX` in [src/components/Cell/Cell.tsx](src/components/Cell/Cell.tsx).

**Still to decide**
- Whether 4 px feels right on a real phone, and whether the gap should be visible.
- A double-tap whose second tap slips onto the neighbour still gives two crosses instead of a cat. It could count as a double-tap when the two taps land a few pixels apart.
