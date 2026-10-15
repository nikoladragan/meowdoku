import { generatePuzzle } from './generator'

export interface WorkerRequest {
  req: number
  id: string
  size: number
}

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => {
  const { req, id, size } = e.data
  self.postMessage({ req, puzzle: generatePuzzle(id, size) })
})
