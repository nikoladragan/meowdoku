import { generatePuzzle } from './generator'
import type { WorkerRequest } from './generator.worker'
import { SIZES, type Difficulty, type Puzzle } from './types'

let worker: Worker | null = null
let nextReq = 1
const pending = new Map<number, (p: Puzzle) => void>()

function getWorker(): Worker | null {
  if (worker) return worker
  try {
    worker = new Worker(new URL('./generator.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<{ req: number; puzzle: Puzzle }>) => {
      pending.get(e.data.req)?.(e.data.puzzle)
      pending.delete(e.data.req)
    }
  } catch {
    worker = null
  }
  return worker
}

// Generates off the main thread; falls back to a synchronous call if workers are unavailable.
export function generateAsync(id: string, size: number): Promise<Puzzle> {
  const w = getWorker()
  if (!w) return Promise.resolve(generatePuzzle(id, size))
  return new Promise((resolve) => {
    const req = nextReq++
    pending.set(req, resolve)
    const msg: WorkerRequest = { req, id, size }
    w.postMessage(msg)
  })
}

export function newFreePuzzle(difficulty: Difficulty): Promise<Puzzle> {
  const id = `free-${crypto.getRandomValues(new Uint32Array(1))[0]}`
  return generateAsync(id, SIZES[difficulty])
}
