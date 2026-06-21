/**
 * Verifies the OLL/PLL dataset with cubing.js:
 *  - every algorithm disturbs ONLY the last layer (valid OLL/PLL alg)
 *  - every case is distinct (no duplicate / mislabeled algs)
 *
 * Conventions are derived empirically (which piece indices the last layer
 * occupies) so this doesn't depend on cubing.js internal orbit ordering. Algs
 * that rotate the whole cube (A/E/J/V perms) are re-normalized to centers-solved
 * before comparison.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import { Alg } from 'cubing/alg'
import { cube3x3x3 } from 'cubing/puzzles'
import { ALL_CASES, OLL_CASES, PLL_CASES, type AlgCase } from './cases'

type KPattern = {
  patternData: Record<string, { pieces: number[]; orientation?: number[] }>
  applyAlg: (alg: Alg) => KPattern
}

// 24 whole-cube orientations.
const ROTATIONS = [
  '', 'y', 'y2', "y'",
  'x', 'x y', 'x y2', "x y'",
  'x2', 'x2 y', 'x2 y2', "x2 y'",
  "x'", "x' y", "x' y2", "x' y'",
  'z', 'z y', 'z y2', "z y'",
  "z'", "z' y", "z' y2", "z' y'",
]

// Pure last-layer algs used to learn which piece indices the LL occupies.
const LL_ALGS = [
  "R U R' U R U2 R'", // Sune
  "R U R' U' R' F R2 U' R' U' R U R' F'", // T perm
  'M2 U M2 U2 M2 U M2', // H perm
  "M2 U M U2 M' U M2", // Ua perm
  "M' U M2 U M2 U M' U2 M2", // Z perm
]

let solved: KPattern
let llSet: Record<string, Set<number>>

function apply(p: KPattern, algStr: string): KPattern {
  return algStr ? p.applyAlg(new Alg(algStr)) : p
}

function centersSolved(p: KPattern): boolean {
  const c = p.patternData.CENTERS
  if (!c) return true
  return c.pieces.every((v, i) => v === i)
}

/** Re-orient so centers are solved (cancel any whole-cube rotation in the alg). */
function normalize(p: KPattern): KPattern | null {
  for (const r of ROTATIONS) {
    const rp = apply(p, r)
    if (centersSolved(rp)) return rp
  }
  return null
}

/** Piece indices (per non-center orbit) that differ from solved. */
function changedNonCenter(p: KPattern): Record<string, Set<number>> {
  const out: Record<string, Set<number>> = {}
  for (const orbit of Object.keys(p.patternData)) {
    if (orbit === 'CENTERS') continue
    const { pieces, orientation } = p.patternData[orbit]
    const s = new Set<number>()
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i] !== i || (orientation?.[i] ?? 0) !== 0) s.add(i)
    }
    out[orbit] = s
  }
  return out
}

beforeAll(async () => {
  const kpuzzle = (await cube3x3x3.kpuzzle()) as unknown as { defaultPattern: () => KPattern }
  solved = kpuzzle.defaultPattern()
  llSet = {}
  for (const a of LL_ALGS) {
    const ch = changedNonCenter(apply(solved, a))
    for (const orbit of Object.keys(ch)) {
      llSet[orbit] = llSet[orbit] ?? new Set<number>()
      for (const i of ch[orbit]) llSet[orbit].add(i)
    }
  }
})

/** AUF-normalized signature of the case a case's alg produces. */
function caseSignature(c: AlgCase): string {
  const inv = new Alg(c.algorithm).invert().toString()
  const base = normalize(apply(solved, inv))
  if (!base) return `UNNORMALIZABLE:${c.set}:${c.id}`
  let best: string | null = null
  for (const k of ['', 'U', 'U2', "U'"]) {
    const s = JSON.stringify(apply(base, k).patternData)
    if (best === null || s < best) best = s
  }
  return best!
}

describe('OLL/PLL dataset', () => {
  it('has 21 PLL + 57 OLL with the right ids', () => {
    expect(PLL_CASES.length).toBe(21)
    expect(new Set(PLL_CASES.map((c) => c.id)).size).toBe(21)
    expect(OLL_CASES.length).toBe(57)
    expect(
      OLL_CASES.map((c) => c.id)
        .map(Number)
        .sort((a, b) => a - b)
        .join(','),
    ).toBe(Array.from({ length: 57 }, (_, i) => i + 1).join(','))
  })

  it('every algorithm disturbs only the last layer', () => {
    const failures: string[] = []
    for (const c of ALL_CASES) {
      const norm = normalize(apply(solved, c.algorithm))
      if (!norm) {
        failures.push(`${c.set} ${c.id}: centers not solvable (bad rotation)`)
        continue
      }
      const ch = changedNonCenter(norm)
      const bad: string[] = []
      for (const orbit of Object.keys(ch)) {
        for (const i of ch[orbit]) if (!llSet[orbit]?.has(i)) bad.push(`${orbit}[${i}]`)
      }
      if (bad.length) failures.push(`${c.set} ${c.id} "${c.algorithm}": disturbs ${bad.join(', ')}`)
    }
    expect(failures, `\n${failures.join('\n')}\n`).toEqual([])
  })

  it('OLL cases are all distinct (up to AUF)', () => {
    const bySig = new Map<string, string[]>()
    for (const c of OLL_CASES) {
      const s = caseSignature(c)
      bySig.set(s, [...(bySig.get(s) ?? []), c.id])
    }
    const dups = [...bySig.values()].filter((ids) => ids.length > 1)
    expect(dups, `duplicate OLL cases: ${JSON.stringify(dups)}`).toEqual([])
  })

  it('PLL cases are all distinct (up to AUF)', () => {
    const bySig = new Map<string, string[]>()
    for (const c of PLL_CASES) {
      const s = caseSignature(c)
      bySig.set(s, [...(bySig.get(s) ?? []), c.id])
    }
    const dups = [...bySig.values()].filter((ids) => ids.length > 1)
    expect(dups, `duplicate PLL cases: ${JSON.stringify(dups)}`).toEqual([])
  })
})
