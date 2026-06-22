import { describe, expect, it } from 'vitest'
import { caseFacelets } from './caseFacelets'
import { OLL_CASES, PLL_CASES } from '../algs/cases'

// These guard the recognition-diagram facelets, which are easy to get subtly
// wrong for algorithms containing whole-cube rotations (the corner perms' `x`):
// a flawed normalization silently strips the rotation and renders a case whose
// "solved" layers are disturbed.

describe('caseFacelets', () => {
  it('renders a fully-yellow top for every PLL (the layer is already oriented)', () => {
    const bad: string[] = []
    for (const c of PLL_CASES) {
      const top = caseFacelets(c.algorithm).slice(0, 9)
      if ([...top].some((ch) => ch !== 'U')) bad.push(`${c.id}: ${top}`)
    }
    expect(bad, `\nPLL with a non-yellow top: ${bad.join('  ')}\n`).toEqual([])
  })

  it('keeps the bottom two layers solved for every OLL and PLL', () => {
    const lowerTwoRows = (start: number, color: string, f: string) =>
      [3, 4, 5, 6, 7, 8].every((i) => f[start + i] === color)
    const f2lSolved = (f: string) =>
      [...f.slice(27, 36)].every((ch) => ch === 'D') && // D face fully white
      lowerTwoRows(18, 'F', f) &&
      lowerTwoRows(9, 'R', f) &&
      lowerTwoRows(45, 'B', f) &&
      lowerTwoRows(36, 'L', f)
    const bad: string[] = []
    for (const c of [...OLL_CASES, ...PLL_CASES]) {
      if (!f2lSolved(caseFacelets(c.algorithm))) bad.push(`${c.set} ${c.id}`)
    }
    expect(bad, `\ncases with disturbed F2L in their diagram: ${bad.join(', ')}\n`).toEqual([])
  })
})
