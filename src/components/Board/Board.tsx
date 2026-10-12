import { useMemo } from 'react'
import { debugCats } from '../../game/debug'
import { colorOffset, computeBorders, regionColorIndex, REGION_NAMES } from '../../game/regionStyle'
import type { Hint } from '../../game/hints'
import type { Mark, Puzzle } from '../../game/types'
import { FURS } from '../Cat/fur'
import { Cell, type HintCellState } from '../Cell/Cell'
import styles from './Board.module.css'

interface Props {
  puzzle: Puzzle
  marks: Mark[]
  hint: Hint | null
  onCellTap: (cell: number) => void
}

export function Board({ puzzle, marks, hint, onCellTap }: Props) {
  const { size, regions, solution } = puzzle
  const borders = useMemo(() => computeBorders(size, regions), [size, regions])
  const offset = useMemo(() => colorOffset(puzzle), [puzzle])

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
      className={styles.board}
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
            onTap={onCellTap}
          />
        )
      })}
    </div>
  )
}
