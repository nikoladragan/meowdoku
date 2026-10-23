// 'extreme' is shown as "Hard". The key stays so saved 10×10 stats carry over.
export type Difficulty = 'easy' | 'normal' | 'extreme'
export const SIZES: Record<Difficulty, number> = { easy: 5, normal: 7, extreme: 10 }
export const DIFFICULTIES = Object.keys(SIZES) as Difficulty[]

export interface Puzzle {
  id: string // 'free-<uint32>', 'daily-YYYY-MM-DD' or 'level-<n>'
  size: number
  regions: number[] // length size*size, regions[row * size + col] = region index 0..size-1
  solution: number[] // length size, solution[row] = column of that row's cat
  level: number // hardest deduction technique needed, 1 to 5
}

// 'miss' is a cross left by a wrong cat guess. It is permanent: not undoable and not clearable.
export type Mark = 'empty' | 'cross' | 'cat' | 'miss'
export type Mode = 'free' | 'daily' | 'level'
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
  extreme: 'Hard',
}
