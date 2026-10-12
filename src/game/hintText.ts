import type { Hint } from './hints'
import { colorOffset, regionColorIndex, REGION_NAMES } from './regionStyle'
import type { Puzzle } from './types'

type UnitKind = 'row' | 'column' | 'region'

function kindOf(unit: number, n: number): UnitKind {
  return unit < n ? 'row' : unit < 2 * n ? 'column' : 'region'
}

function join(parts: string[]): string {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

// Names a unit: "row 3", "column 5" or "the mint region".
function unitName(unit: number, puzzle: Puzzle): string {
  const n = puzzle.size
  const kind = kindOf(unit, n)
  if (kind === 'row') return `row ${unit + 1}`
  if (kind === 'column') return `column ${unit - n + 1}`
  const color = REGION_NAMES[regionColorIndex(unit - 2 * n, colorOffset(puzzle))]
  return `the ${color} region`
}

// Names several units of the same kind: "rows 2 and 4", "the mint and sky regions".
function unitsName(units: number[], puzzle: Puzzle): string {
  const n = puzzle.size
  const kind = kindOf(units[0], n)
  if (units.length === 1) return unitName(units[0], puzzle)
  if (kind === 'row') return `rows ${join(units.map((u) => String(u + 1)))}`
  if (kind === 'column') return `columns ${join(units.map((u) => String(u - n + 1)))}`
  const offset = colorOffset(puzzle)
  return `the ${join(units.map((u) => REGION_NAMES[regionColorIndex(u - 2 * n, offset)]))} regions`
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function hintText(hint: Hint, puzzle: Puzzle): string {
  const n = puzzle.size
  switch (hint.kind) {
    case 'wrongCross':
      return 'This cross is hiding a spot where a cat belongs. Remove it.'
    case 'catExclusion':
      return "These cells are in this cat's row, column or region, or touch it. Cross them out."
    case 'single':
      return `Only one cell is left for a cat in ${unitName(hint.units[0], puzzle)}.`
    case 'blocks':
      return `A cat here would leave no room for a cat in ${unitName(hint.units[0], puzzle)}. Cross it out.`
    case 'reveal':
      return 'A cat belongs here.'
    case 'confine': {
      const from = unitsName(hint.units, puzzle)
      const into = unitsName(hint.into, puzzle)
      const fromKind = kindOf(hint.units[0], n)
      const intoKind = kindOf(hint.into[0], n)
      if (hint.units.length === 1) {
        if (fromKind === 'region') {
          return `Every spot left in ${from} is in ${into}, so that line's cat must be in this region. Cross out the rest of ${into}.`
        }
        return `Every spot left in ${from} is in ${into}, so this region's cat must be in that line. Cross out the rest of ${into}.`
      }
      const taken = intoKind === 'region' ? 'those regions are taken' : `those ${intoKind}s are taken`
      return `${cap(from)} only fit in ${into}, so ${taken}. Cross out the other cells in them.`
    }
  }
}
