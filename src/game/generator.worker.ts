import { generatePuzzle } from './generator'

export interface WorkerRequest {
  req: number
  id: string
  size: number
  range?: [number, number]
}

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => {
  const { req, id, size, range } = e.data
  self.postMessage({ req, puzzle: generatePuzzle(id, size, range) })
})
