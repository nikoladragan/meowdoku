import { grade, GRADE_RANGE } from './logic'
import { hashString, mulberry32, randInt, shuffle, type Rng } from './rng'
import type { Puzzle } from './types'
import { DIRS, isConnectedWithout, solve } from './solver'

// Bump 'v1' whenever the generator, logic solver or level table changes.
export const GENERATOR_VERSION = 'v1'

// A random valid cat placement. One cat per row and column already rules out
// orthogonal contact, so the only extra check is neighbouring rows being 2+ columns apart.
function randomSolution(rng: Rng, n: number): number[] {
  const sol = new Array<number>(n).fill(-1)
  const used = new Array<boolean>(n).fill(false)
  function place(r: number): boolean {
    if (r === n) return true
    for (const c of shuffle(rng, [...Array(n).keys()])) {
      if (used[c]) continue
      if (r > 0 && Math.abs(sol[r - 1] - c) < 2) continue
      used[c] = true
      sol[r] = c
      if (place(r + 1)) return true
      used[c] = false
    }
    return false
  }
  place(0)
  return sol
}

// Region r starts at the cat in row r. Each step assigns one unassigned cell to a
// neighbouring region, picked with a per-region weight so sizes vary.
function growRegions(rng: Rng, n: number, sol: number[]): number[] {
  const regions = new Array<number>(n * n).fill(-1)
  for (let r = 0; r < n; r++) regions[r * n + sol[r]] = r
  const weight = Array.from({ length: n }, () => 0.4 + rng() * 1.6)
  let unassigned = n * n - n
  while (unassigned > 0) {
    const cands: [number, number][] = [] // [cell, region] for every unassigned cell next to a region
    let total = 0
    for (let i = 0; i < n * n; i++) {
      if (regions[i] !== -1) continue
      const r = (i / n) | 0
      const c = i % n
      for (const [dr, dc] of DIRS) {
        const rr = r + dr
        const cc = c + dc
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue
        const g = regions[rr * n + cc]
        if (g !== -1) {
          cands.push([i, g])
          total += weight[g]
        }
      }
    }
    let x = rng() * total
    let pick = cands[cands.length - 1]
    for (const cand of cands) {
      x -= weight[cand[1]]
      if (x <= 0) {
        pick = cand
        break
      }
    }
    regions[pick[0]] = pick[1]
    unassigned--
  }
  return regions
}

// `alt` is a second solution. Take one of its cats that is not in the intended
// solution and hand that cell to a neighbouring region. Its old region then has no
// cat in `alt`, while the intended solution is untouched.
function repair(rng: Rng, n: number, regions: number[], sol: number[], alt: number[]): boolean {
  const rows = shuffle(rng, [...Array(n).keys()]).filter((r) => alt[r] !== sol[r])
  for (const r of rows) {
    const c = alt[r]
    const i = r * n + c
    const g = regions[i]
    if (!isConnectedWithout(n, regions, g, i)) continue
    const targets: number[] = []
    for (const [dr, dc] of DIRS) {
      const rr = r + dr
      const cc = c + dc
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue
      const h = regions[rr * n + cc]
      if (h !== g && !targets.includes(h)) targets.push(h)
    }
    if (!targets.length) continue
    regions[i] = targets[randInt(rng, targets.length)]
    return true
  }
  return false
}

// Shape gate: avoid giveaway and blob-heavy boards.
export function passesQuality(n: number, regions: number[]): boolean {
  const sizes = new Array<number>(n).fill(0)
  for (const g of regions) sizes[g]++
  const singles = sizes.filter((x) => x === 1).length
  return singles <= 1 && Math.max(...sizes) <= Math.ceil(n * n * 0.3)
}

export function generatePuzzle(id: string, n: number): Puzzle {
  const [minLevel, maxLevel] = GRADE_RANGE[n] ?? [1, 5]
  const rng = mulberry32(hashString(`${GENERATOR_VERSION}:${id}:${n}`))
  for (;;) {
    const solution = randomSolution(rng, n)
    const regions = growRegions(rng, n, solution)
    for (let k = 0; k < 200; k++) {
      const sols = solve(n, regions, 2)
      if (sols.length === 1) {
        if (!passesQuality(n, regions)) break // unique but poor shape: start over
        const g = grade(n, regions, maxLevel)
        if (!g.solved || g.level < minLevel) break // needs guessing, or too easy for this size
        return { id, size: n, regions, solution, level: g.level }
      }
      const alt = sols.find((s) => s.some((c, r) => c !== solution[r]))!
      if (!repair(rng, n, regions, solution, alt)) break
    }
  }
}
