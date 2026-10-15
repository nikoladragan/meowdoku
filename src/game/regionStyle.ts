import { hashString } from './rng'
import type { Puzzle } from './types'

export const REGION_NAMES = ['coral', 'apricot', 'butter', 'sage', 'mint', 'sky', 'periwinkle', 'lilac', 'pink', 'sand']

// Colour offset derived from the puzzle id, so the same board does not always look the same.
export function colorOffset(puzzle: Puzzle): number {
  return hashString(`color:${puzzle.id}`) % REGION_NAMES.length
}

export function regionColorIndex(region: number, offset: number): number {
  return (region + offset) % REGION_NAMES.length
}

export interface CellBorders {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

// True on every side where the neighbour is in a different region, or the board ends.
export function computeBorders(size: number, regions: number[]): CellBorders[] {
  return regions.map((g, i) => {
    const r = (i / size) | 0
    const c = i % size
    return {
      top: r === 0 || regions[i - size] !== g,
      bottom: r === size - 1 || regions[i + size] !== g,
      left: c === 0 || regions[i - 1] !== g,
      right: c === size - 1 || regions[i + 1] !== g,
    }
  })
}
