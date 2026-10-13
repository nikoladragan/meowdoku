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
const DEAD_ZONE_PX = 4

// Keyboard and screen-reader clicks have no position (detail 0) and always count.
function nearEdge(e: React.MouseEvent<HTMLElement>): boolean {
  if (e.detail === 0) return false
  const r = e.currentTarget.getBoundingClientRect()
  return (
    e.clientX < r.left + DEAD_ZONE_PX ||
    e.clientX > r.right - DEAD_ZONE_PX ||
    e.clientY < r.top + DEAD_ZONE_PX ||
    e.clientY > r.bottom - DEAD_ZONE_PX
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
