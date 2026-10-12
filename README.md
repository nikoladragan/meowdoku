# Meowdoku

A frontend-only clone of the cat logic puzzle Meowdoku, built with React and TypeScript. Place one cat in every row, column and coloured region, with no two cats touching. Every puzzle has one solution and can be solved by logic alone.

- Free play at four sizes (5×5, 7×7, 9×9, 10×10) and a daily puzzle that is the same for everyone on a given date.
- Unlimited hints that explain the next logical step, undo, auto-cross, a timer with best times.
- Synthesised sound, vibration (where supported), and installable as a PWA that works offline.
- No backend: puzzles are generated in the browser and progress is stored in `localStorage`.

## Run it

Needs Node 22 and pnpm.

```sh
pnpm install
pnpm dev        # dev server, also reachable from a phone on the same Wi-Fi (see the "Network" URL)
pnpm test       # unit tests (puzzle engine, reducer, hints, storage)
pnpm lint
pnpm build      # type-check and production build into dist/
pnpm preview    # serve the production build (port 4173)
```

The service worker and install prompt only work over HTTPS (or `localhost`), so test the PWA from a deployed build.

## Dev-only switches

Active only in `pnpm dev`, and ignored in a production build:

| Switch | Effect |
| --- | --- |
| `?debug` | shows a paw dot on every cell where a cat belongs |
| `?art` | shows a gallery of every cat, mark and icon |
| `?date=YYYY-MM-DD` | makes the app treat that date as today (daily puzzle) |

`?debug` and `?date=` can be combined: `/?debug&date=2026-10-13`.

## How it works

- `src/game/` holds the pure game logic: a seeded generator (`generator.ts`), a brute-force solver, a human-style logic solver (`logic.ts`) that grades puzzles and powers hints, the game reducer, storage and the daily puzzle.
- The generator is fully deterministic: `seed = hashString('v1:' + id + ':' + size)`. Never use `Math.random` in it. Any change to the generator, the logic solver or the level table must bump `v1` to `v2`, otherwise every daily puzzle silently changes. A snapshot test guards this.
- Generation runs in a Web Worker (`generator.worker.ts`).
- `src/components/` has one folder per component, styled with CSS Modules and the tokens in `src/styles/tokens.css`. All artwork is inline SVG drawn in code.
- State is one `useReducer` for the game and a `screen` state in `App`. There is no router and no state library.
