/**
 * Generate scrambles/states for a specific OLL or PLL case.
 *
 * If algorithm `A` solves a case, then applying `A⁻¹` to a solved cube
 * reproduces the case (disturbing only the last layer). Adding random AUF on
 * both ends varies the recognition angle and finishing turn realistically.
 */
const AUFS = ['', 'U', 'U2', "U'"] as const

function randomAuf(): string {
  return AUFS[Math.floor(Math.random() * AUFS.length)]
}

/**
 * Invert a sequence of WCA moves: reverse the order and flip each move's
 * direction (`X → X'`, `X' → X`, `X2 → X2`). The OLL/PLL dataset is plain
 * space-separated moves (no parens/commutators), so this matches `cubing/alg`'s
 * `Alg.invert().toString()` exactly — without importing `cubing` into the app's
 * eager bundle. That matters: any eager `cubing` import fuses cubing's shared
 * modules into the app-entry chunk, which the scramble worker then drags in and
 * crashes on (`document`/`HTMLElement` is not defined). Keeping cubing fully
 * lazy lets Vite isolate it so the worker bundles cleanly.
 */
function invertMoves(seq: string): string {
  return seq
    .split(/\s+/)
    .filter(Boolean)
    .reverse()
    .map((m) => (m.endsWith("'") ? m.slice(0, -1) : m.endsWith('2') ? m : `${m}'`))
    .join(' ')
}

/** Canonical state of a case as a move sequence (apply to solved → see the case). */
export function caseStateAlg(solution: string): string {
  return invertMoves(solution)
}

/**
 * A practice scramble that leaves the cube in exactly this case at a random
 * angle: setup = (preAUF · solution · postAUF)⁻¹.
 */
export function setupScrambleFor(solution: string): string {
  return invertMoves(`${randomAuf()} ${solution} ${randomAuf()}`)
}
