/**
 * Generate scrambles/states for a specific OLL or PLL case.
 *
 * If algorithm `A` solves a case, then applying `A⁻¹` to a solved cube
 * reproduces the case (disturbing only the last layer). Adding random AUF on
 * both ends varies the recognition angle and finishing turn realistically.
 */
import { Alg } from 'cubing/alg'

const AUFS = ['', 'U', 'U2', "U'"] as const

function randomAuf(): string {
  return AUFS[Math.floor(Math.random() * AUFS.length)]
}

/** Canonical state of a case as a move sequence (apply to solved → see the case). */
export function caseStateAlg(solution: string): string {
  return new Alg(solution).invert().toString()
}

/**
 * A practice scramble that leaves the cube in exactly this case at a random
 * angle: setup = (preAUF · solution · postAUF)⁻¹.
 */
export function setupScrambleFor(solution: string): string {
  return new Alg(`${randomAuf()} ${solution} ${randomAuf()}`).invert().toString()
}

/** The case state shown at a random recognition angle (for recognition drills). */
export function recognitionStateAlg(solution: string): string {
  return `${caseStateAlg(solution)} ${randomAuf()}`.trim()
}
