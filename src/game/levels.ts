import { generatePuzzle } from './generator'
import type { Puzzle } from './types'

export const LEVEL_SIZE = 10

const ID_PREFIX = 'level-'
export const levelId = (level: number) => `${ID_PREFIX}${level}`
export const levelNumber = (id: string) => Number(id.slice(ID_PREFIX.length))

// Hardest technique allowed: easier early levels, the full Hard range from level 31.
// A cap of 2 is not used because such 10×10 boards are rare and slow to find.
export function levelRange(level: number): [number, number] {
  if (level <= 10) return [1, 3]
  if (level <= 30) return [2, 4]
  return [3, 5]
}

export function levelPuzzle(level: number): Puzzle {
  return generatePuzzle(levelId(level), LEVEL_SIZE, levelRange(level))
}
