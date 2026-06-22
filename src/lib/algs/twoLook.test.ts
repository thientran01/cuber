import { beforeAll, describe, expect, it } from 'vitest'
import { Alg } from 'cubing/alg'
import { cube3x3x3 } from 'cubing/puzzles'
import { TWO_LOOK_PLL_CORNERS } from './twoLook'

type Orbit = { pieces: number[]; orientation?: number[] }
type KP = { patternData: Record<string, Orbit>; applyAlg: (a: Alg) => KP }
let solved: KP
beforeAll(async () => {
  solved = (await cube3x3x3.kpuzzle()).defaultPattern() as unknown as KP
})

const ROT = ['', 'y', 'y2', "y'", 'x', 'x y', 'x y2', "x y'", 'x2', 'x2 y', 'x2 y2', "x2 y'", "x'", "x' y", "x' y2", "x' y'", 'z', 'z y', 'z y2', "z y'", "z'", "z' y", "z' y2", "z' y'"]
const centersSolved = (p: KP) => p.patternData.CENTERS.pieces.every((v, i) => v === i)
function normalize(alg: string): KP | null {
  const b = solved.applyAlg(new Alg(alg))
  for (const r of ROT) {
    const rp = r ? b.applyAlg(new Alg(r)) : b
    if (centersSolved(rp)) return rp
  }
  return null
}
const oriented = (o: Orbit) => (o.orientation ?? []).every((x) => x === 0)
const moved = (o: Orbit) => o.pieces.filter((p, i) => p !== i).length

describe('2-look PLL corner step', () => {
  it('Headlights (T) and Diagonal (Y) each swap exactly two corners, no twist, last layer only', () => {
    const fail: string[] = []
    const byName = Object.fromEntries(TWO_LOOK_PLL_CORNERS.map((c) => [c.name, c]))
    expect(Object.keys(byName).sort()).toEqual(['Diagonal', 'Headlights'])
    for (const c of TWO_LOOK_PLL_CORNERS) {
      const p = normalize(c.algorithm)
      if (!p) {
        fail.push(`${c.name}: centers not solvable`)
        continue
      }
      if (!oriented(p.patternData.CORNERS) || !oriented(p.patternData.EDGES)) fail.push(`${c.name}: twists a piece`)
      if (moved(p.patternData.CORNERS) !== 2) fail.push(`${c.name}: moves ${moved(p.patternData.CORNERS)} corners (want 2)`)
    }
    expect(fail, `\n${fail.join('\n')}\n`).toEqual([])
  })
})
