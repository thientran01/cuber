import { faceletsForAlg } from './facelets'
import { caseStateAlg } from './setupScramble'

// 24 whole-cube orientations, used to bring a case's centers upright.
const ROTATIONS = [
  '', 'y', 'y2', "y'", 'x', 'x y', 'x y2', "x y'", 'x2', 'x2 y', 'x2 y2', "x2 y'",
  "x'", "x' y", "x' y2", "x' y'", 'z', 'z y', 'z y2', "z y'", "z'", "z' y", "z' y2", "z' y'",
]

const AUF = ['', 'U', 'U2', "U'"]

function centersSolved(f: string): boolean {
  return f[4] === 'U' && f[13] === 'R' && f[22] === 'F' && f[31] === 'D' && f[40] === 'L' && f[49] === 'B'
}

/**
 * 54-char Kociemba facelet string for a case, viewed upright (centers solved),
 * optionally pre-rotated by AUF to vary the recognition angle.
 *
 * The case state is the algorithm inverted (`caseStateAlg`). When an algorithm
 * contains a whole-cube rotation — e.g. the corner perms' leading `x` — the
 * inverse ends with a rotation, so the raw state is tilted. We bring it upright
 * by PREPENDING the correcting rotation, never appending it: prepending
 * conjugates the rotation (`x · P⁻¹ · x'`, which preserves the case), whereas
 * appending cancels it (`P⁻¹ · x' · x = P⁻¹`) and silently yields a different,
 * F2L-disturbed alg. The append form rendered garbage (a non-yellow top sticker)
 * for every rotation-containing case (Aa, Ab, E, Ja).
 */
export function caseFacelets(algorithm: string, auf = 0): string {
  const base = `${caseStateAlg(algorithm)} ${AUF[auf % 4]}`.trim()
  for (const r of ROTATIONS) {
    const f = faceletsForAlg(r ? `${r} ${base}` : base)
    if (centersSolved(f)) return f
  }
  return faceletsForAlg(base)
}
