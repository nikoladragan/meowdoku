import { useMemo } from 'react'
import { debugCats } from '../../game/debug'
import { colorOffset, computeBorders, regionColorIndex, REGION_NAMES } from '../../game/regionStyle'
import type { Hint } from '../../game/hints'
import type { GameEvent, Mark, Puzzle, Status } from '../../game/types'
import { FURS } from '../Cat/fur'
import { Cell, type CellAnim, type HintCellState } from '../Cell/Cell'
import styles from './Board.module.css'

interface Props {
  puzzle: Puzzle
  marks: Mark[]
  hint: Hint | null
  lastEvent: GameEvent | null
  status: Status
  onCellTap: (cell: number) => void
}

interface Anim {
  type: CellAnim
  delay: number
}

// Which cells animate for the latest event. A freshly loaded game has no event, so nothing moves.
function cellAnimations(event: GameEvent | null, marks: Mark[], size: number): Map<number, Anim> {
  const anims = new Map<number, Anim>()
  if (!event) return anims
  const dist = (a: number, b: number) =>
    Math.max(Math.abs(((a / size) | 0) - ((b / size) | 0)), Math.abs((a % size) - (b % size)))
  switch (event.kind) {
    case 'cross':
      anims.set(event.cell, { type: 'popCross', delay: 0 })
      break
    case 'cat':
    case 'win':
      for (const c of event.autoCrossed) anims.set(c, { type: 'ripple', delay: 25 * dist(c, event.cell) })
      anims.set(event.cell, { type: 'popCat', delay: 0 })
      if (event.kind === 'win') {
        marks.forEach((m, i) => {
          if (m === 'cat') anims.set(i, { type: 'hop', delay: ((i / size) | 0) * 60 })
        })
      }
      break
    case 'miss':
    case 'lose':
      anims.set(event.cell, { type: 'miss', delay: 0 })
      break
    case 'undo':
      for (const c of event.restored) anims.set(c, { type: 'undo', delay: 0 })
      break
  }
  return anims
}

export function Board({ puzzle, marks, hint, lastEvent, status, onCellTap }: Props) {
  const { size, regions, solution } = puzzle
  const borders = useMemo(() => computeBorders(size, regions), [size, regions])
  const offset = useMemo(() => colorOffset(puzzle), [puzzle])

  const anims = useMemo(() => cellAnimations(lastEvent, marks, size), [lastEvent, marks, size])

  const hintStates = useMemo(() => {
    if (!hint) return null
    const unitOf = (i: number) => [(i / size) | 0, size + (i % size), 2 * size + regions[i]]
    const target = new Set(hint.cells)
    const reason = new Set(hint.reasonCells)
    const units = new Set([...hint.units, ...hint.into])
    return regions.map((_, i): HintCellState => {
      if (target.has(i)) return 'target'
      if (reason.has(i)) return 'reason'
      if (unitOf(i).some((u) => units.has(u))) return 'related'
      return 'dim'
    })
  }, [hint, size, regions])

  return (
    <div
      className={`${styles.board} ${status === 'lost' ? styles.lost : ''}`}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}
    >
      {regions.map((g, i) => {
        const row = (i / size) | 0
        const col = i % size
        const colorIndex = regionColorIndex(g, offset)
        return (
          <Cell
            key={i}
            index={i}
            row={row}
            col={col}
            colorIndex={colorIndex}
            colorName={REGION_NAMES[colorIndex]}
            borders={borders[i]}
            mark={marks[i]}
            fur={FURS[(row + offset) % FURS.length]}
            debugCat={debugCats && solution[row] === col}
            hintState={hintStates ? hintStates[i] : null}
            anim={anims.get(i)?.type ?? null}
            animDelay={anims.get(i)?.delay ?? 0}
            onTap={onCellTap}
          />
        )
      })}
    </div>
  )
}
