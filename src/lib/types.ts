/** Core domain types for solves and sessions. */

export type Penalty = 'none' | 'plus2' | 'dnf'

/** WCA event ids understood by cubing.js. 333 is the primary event. */
export const CUBE_EVENTS = ['333', '222', '444', '555', 'pyram', 'skewb', 'clock', 'minx', 'sq1'] as const
export type CubeEvent = (typeof CUBE_EVENTS)[number]

export interface Solve {
  id: string
  sessionId: string
  /** Raw recorded time in milliseconds, before penalties. */
  timeMs: number
  penalty: Penalty
  scramble: string
  event: CubeEvent
  /** Epoch milliseconds. */
  createdAt: number
  comment?: string
}

export interface Session {
  id: string
  name: string
  event: CubeEvent
  createdAt: number
  sortOrder: number
}

/**
 * Effective time used for ranking and averages.
 * +2 adds 2000ms; DNF sorts to the worst end as Infinity.
 */
export function effectiveMs(solve: Solve): number {
  if (solve.penalty === 'dnf') return Infinity
  return solve.timeMs + (solve.penalty === 'plus2' ? 2000 : 0)
}

export function isDNF(solve: Solve): boolean {
  return solve.penalty === 'dnf'
}
