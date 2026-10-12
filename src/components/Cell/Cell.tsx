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

const MARK_LABEL: Record<Mark, string> = { empty: 'empty', cross: 'crossed', cat: 'cat' }

export type CellAnim = 'popCross' | 'popCat' | 'ripple' | 'miss' | 'undo' | 'hop'

export type HintCellState = 'target' | 'related' | 'reason' | 'dim' | null

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
      onClick={() => onTap(index)}
    >
      {mark === 'cat' && <Cat fur={fur} />}
      {mark === 'cross' && <Cross />}
      {mark === 'empty' && debugCat && <PawDot />}
    </button>
  )
})
