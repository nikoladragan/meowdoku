import { useMemo } from 'react'
import { debugCats } from '../../game/debug'
import { colorOffset, computeBorders, regionColorIndex, REGION_NAMES } from '../../game/regionStyle'
import type { Mark, Puzzle } from '../../game/types'
import { FURS } from '../Cat/fur'
import { Cell } from '../Cell/Cell'
import styles from './Board.module.css'

interface Props {
  puzzle: Puzzle
  marks: Mark[]
  onCellTap: (cell: number) => void
}

export function Board({ puzzle, marks, onCellTap }: Props) {
  const { size, regions, solution } = puzzle
  const borders = useMemo(() => computeBorders(size, regions), [size, regions])
  const offset = useMemo(() => colorOffset(puzzle), [puzzle])

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
            onTap={onCellTap}
          />
        )
      })}
    </div>
  )
}
