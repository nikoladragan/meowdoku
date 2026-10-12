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
