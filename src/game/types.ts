export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme'
export const SIZES: Record<Difficulty, number> = { easy: 5, normal: 7, hard: 9, extreme: 10 }

export interface Puzzle {
  id: string // 'free-<uint32>' or 'daily-YYYY-MM-DD'
  size: number
  regions: number[] // length size*size, regions[row * size + col] = region index 0..size-1
  solution: number[] // length size, solution[row] = column of that row's cat
  level: number // hardest deduction technique needed, 1 to 5
}

export type Mark = 'empty' | 'cross' | 'cat'
export type Mode = 'free' | 'daily'
export type Status = 'playing' | 'won' | 'lost'

export interface GameEvent {
  kind: 'cross' | 'uncross' | 'cat' | 'miss' | 'undo' | 'win' | 'lose'
  cell: number // the cell the player acted on (-1 for undo)
  autoCrossed: number[] // cells crossed automatically by this cat, otherwise empty
  restored: number[] // cells put back by an undo, otherwise empty
  seq: number // increments on every event
}

export interface Patch {
  cells: number[] // cells changed by one move
  before: Mark[] // their marks before the move, same order
}

export interface GameState {
  mode: Mode
  difficulty: Difficulty
  puzzle: Puzzle
  marks: Mark[] // length size*size
  lives: number // starts at 3
  status: Status
  history: Patch[] // undo stack, newest last, capped at 500
  elapsedMs: number // play time for this attempt
  hintsUsed: number // hints shown during this attempt
  attempt: number // 1 on first try, +1 on every retry
  lastEvent: GameEvent | null // drives sound and animation; never persisted
}

export interface Settings {
  muted: boolean
  vibrate: boolean
  autoCross: boolean
  seenHowTo: boolean
}
export interface Stats {
  wins: number
  bestMs: number | null
}

export const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  extreme: 'Extreme',
}
