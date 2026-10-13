import { memo } from 'react'
import { REGION_NAMES, type CellBorders } from '../../game/regionStyle'
import type { Mark } from '../../game/types'
import { Cat } from '../Cat/Cat'
import type { Fur } from '../Cat/fur'
import { Cross } from '../Cross/Cross'
import { PawDot } from '../PawDot/PawDot'
import styles from './Cell.module.css'

interface Props {
  index: number
  row: number
  col: number
  colorIndex: number
  borders: CellBorders
  mark: Mark
  fur: Fur
  debugCat: boolean
  hintState: HintCellState
  anim: CellAnim | null
  animDelay: number
  onTap: (cell: number) => void
}

const MARK_LABEL: Record<Mark, string> = {
  empty: 'empty',
  cross: 'crossed',
  cat: 'cat',
  miss: 'missed, no cat here',
}

export type CellAnim = 'popCross' | 'popCat' | 'ripple' | 'miss' | 'undo' | 'hop'

export type HintCellState = 'target' | 'related' | 'reason' | 'dim' | null

// Taps this close to a cell's edge are ignored, so a near miss does not land on the neighbour.
// The lighter pad drawn inside each cell shows the part that does take a tap.
const DEAD_ZONE_PX = 4

// True for a tap outside the pad. Measured inside the cell's own lines, like the pad itself.
// Keyboard and screen-reader clicks have no position (detail 0) and always count.
function nearEdge(e: React.MouseEvent<HTMLElement>): boolean {
  if (e.detail === 0) return false
  const cell = e.currentTarget
  const r = cell.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  return (
    x < DEAD_ZONE_PX ||
    y < DEAD_ZONE_PX ||
    x > cell.clientWidth - DEAD_ZONE_PX ||
    y > cell.clientHeight - DEAD_ZONE_PX
  )
}

export const Cell = memo(function Cell({
  index,
  row,
  col,
  colorIndex,
  borders,
  mark,
  fur,
  debugCat,
  hintState,
  anim,
  animDelay,
  onTap,
}: Props) {
  const cls = [
    styles.cell,
    borders.right && styles.right,
    borders.bottom && styles.bottom,
    mark === 'miss' && styles.missed,
    hintState && styles[hintState],
    anim && styles[anim],
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      className={cls}
      style={
        {
          '--cell-bg': `var(--region-${colorIndex})`,
          '--dead-zone': `${DEAD_ZONE_PX}px`,
          '--anim-delay': `${animDelay}ms`,
        } as React.CSSProperties
      }
      aria-label={`Row ${row + 1}, column ${col + 1}, ${REGION_NAMES[colorIndex]} region, ${MARK_LABEL[mark]}`}
      onClick={(e) => {
        if (!nearEdge(e)) onTap(index)
      }}
    >
      {mark === 'cat' && <Cat fur={fur} />}
      {mark === 'cross' && <Cross />}
      {mark === 'miss' && <Cross miss />}
      {mark === 'empty' && debugCat && <PawDot />}
    </button>
  )
})
