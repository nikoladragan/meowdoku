import { memo } from 'react'
import type { CellBorders } from '../../game/regionStyle'
import { PawDot } from '../PawDot/PawDot'
import styles from './Cell.module.css'

interface Props {
  row: number
  col: number
  colorIndex: number
  colorName: string
  borders: CellBorders
  debugCat: boolean
}

export const Cell = memo(function Cell({ row, col, colorIndex, colorName, borders, debugCat }: Props) {
  const cls = [
    styles.cell,
    borders.top && styles.top,
    borders.right && styles.right,
    borders.bottom && styles.bottom,
    borders.left && styles.left,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      className={cls}
      style={{ '--cell-bg': `var(--region-${colorIndex})` } as React.CSSProperties}
      aria-label={`Row ${row + 1}, column ${col + 1}, ${colorName} region`}
    >
      {debugCat && <PawDot />}
    </button>
  )
})
