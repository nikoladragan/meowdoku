export const DIRS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// Brute-force solver: returns up to `limit` solutions (solution[row] = column).
export function solve(n: number, regions: number[], limit = 2): number[][] {
  const out: number[][] = []
  const sol = new Array<number>(n).fill(-1)
  const colUsed = new Array<boolean>(n).fill(false)
  const regUsed = new Array<boolean>(n).fill(false)
  function rec(r: number) {
    if (out.length >= limit) return
    if (r === n) {
      out.push(sol.slice())
      return
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c]) continue
      if (r > 0 && Math.abs(sol[r - 1] - c) < 2) continue
      const g = regions[r * n + c]
      if (regUsed[g]) continue
      colUsed[c] = regUsed[g] = true
      sol[r] = c
      rec(r + 1)
      colUsed[c] = regUsed[g] = false
    }
  }
  rec(0)
  return out
}

// True if region g is still one orthogonally connected piece after removing `removed`
// (pass -1 to test the region as it is).
export function isConnectedWithout(n: number, regions: number[], g: number, removed: number): boolean {
  let start = -1
  let count = 0
  for (let i = 0; i < n * n; i++) {
    if (regions[i] === g && i !== removed) {
      count++
      if (start < 0) start = i
    }
  }
  if (count === 0) return false
  const seen = new Set([start])
  const stack = [start]
  while (stack.length) {
    const i = stack.pop()!
    const r = (i / n) | 0
    const c = i % n
    for (const [dr, dc] of DIRS) {
      const rr = r + dr
      const cc = c + dc
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue
      const j = rr * n + cc
      if (j === removed || regions[j] !== g || seen.has(j)) continue
      seen.add(j)
      stack.push(j)
    }
  }
  return seen.size === count
}
