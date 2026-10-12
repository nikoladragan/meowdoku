import { useMemo } from 'react'
import { debugCats } from '../../game/debug'
import { colorOffset, computeBorders, regionColorIndex, REGION_NAMES } from '../../game/regionStyle'
import type { Puzzle } from '../../game/types'
import { Cell } from '../Cell/Cell'
import styles from './Board.module.css'

export function Board({ puzzle }: { puzzle: Puzzle }) {
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
            row={row}
            col={col}
            colorIndex={colorIndex}
            colorName={REGION_NAMES[colorIndex]}
            borders={borders[i]}
            debugCat={debugCats && solution[row] === col}
          />
        )
      })}
    </div>
  )
}
