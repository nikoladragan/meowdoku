import { generatePuzzle } from './generator'
import type { WorkerRequest } from './generator.worker'
import { LEVEL_SIZE, levelId, levelRange } from './levels'
import { SIZES, type Difficulty, type Puzzle } from './types'

let worker: Worker | null = null
let nextReq = 1
const pending = new Map<number, (p: Puzzle) => void>()

function getWorker(): Worker | null {
  if (worker) return worker
  try {
    worker = new Worker(new URL('./generator.worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (e: MessageEvent<{ req: number; puzzle: Puzzle }>) => {
      pending.get(e.data.req)?.(e.data.puzzle)
      pending.delete(e.data.req)
    })
  } catch {
    worker = null
  }
  return worker
}

// Generates off the main thread; falls back to a synchronous call if workers are unavailable.
export function generateAsync(id: string, size: number, range?: [number, number]): Promise<Puzzle> {
  const w = getWorker()
  if (!w) return Promise.resolve(generatePuzzle(id, size, range))
  return new Promise((resolve) => {
    const req = nextReq++
    pending.set(req, resolve)
    const msg: WorkerRequest = { req, id, size, range }
    w.postMessage(msg)
  })
}

export function newFreePuzzle(difficulty: Difficulty): Promise<Puzzle> {
  const id = `free-${crypto.getRandomValues(new Uint32Array(1))[0]}`
  return generateAsync(id, SIZES[difficulty])
}

export function newLevelPuzzle(level: number): Promise<Puzzle> {
  return generateAsync(levelId(level), LEVEL_SIZE, levelRange(level))
}
