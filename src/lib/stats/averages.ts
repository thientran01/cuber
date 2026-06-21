/**
 * Speedcubing statistics — verified against the WCA Regulations and the
 * Speedsolving wiki. These are easy to get subtly wrong (especially DNF
 * handling), so every function here is pure and unit-tested.
 *
 * Definitions:
 * - effective time = raw + 2000ms for +2; DNF sorts as +Infinity.
 * - best single   = min effective among non-DNF solves.
 * - mean (mo3)     = plain mean, NO trim; any DNF -> DNF.
 * - average (aoN)  = trim ceil(N*0.05) from EACH end, mean the rest.
 *                    aoN is DNF only when (#DNF > trim count) — i.e. a DNF
 *                    survives past the trimmed worst end. So ao5/ao12 tolerate
 *                    exactly one DNF; two or more -> DNF.
 * - session mean   = mean of all solves; any DNF -> DNF.
 *
 * A `null` return represents either "not enough solves" or "DNF result";
 * callers distinguish by checking length where it matters.
 */
import { effectiveMs, type Solve } from '@/lib/types'

/** Best (lowest) single among non-DNF solves. null if none. */
export function bestSingle(solves: Solve[]): number | null {
  let best: number | null = null
  for (const s of solves) {
    if (s.penalty === 'dnf') continue
    const t = effectiveMs(s)
    if (best === null || t < best) best = t
  }
  return best
}

/** Plain mean of all given solves (no trim). null if empty or any DNF. */
export function mean(solves: Solve[]): number | null {
  if (solves.length === 0) return null
  let sum = 0
  for (const s of solves) {
    if (s.penalty === 'dnf') return null
    sum += effectiveMs(s)
  }
  return sum / solves.length
}

/** Trim count for an average of N solves: ceil(N * 0.05) from each end. */
export function trimCount(n: number): number {
  return Math.ceil(n * 0.05)
}

/**
 * Average of exactly N solves: drop `trimCount(N)` best and worst, mean the
 * middle. null if a DNF survives the trim, or if fewer than 3 solves.
 */
export function average(solves: Solve[]): number | null {
  const n = solves.length
  if (n < 3) return null
  const trim = trimCount(n)
  if (n - 2 * trim < 1) return null
  const effs = solves.map(effectiveMs).sort((a, b) => a - b)
  const kept = effs.slice(trim, n - trim)
  if (kept.some((t) => !Number.isFinite(t))) return null // a DNF survived
  return kept.reduce((a, b) => a + b, 0) / kept.length
}

/** Average of the most recent `n` solves (chronological array). aoN, or mo3 mean when n===3. */
export function currentAverage(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null
  const window = solves.slice(-n)
  return n === 3 ? mean(window) : average(window)
}

/** Best average of `n` over every window in the session. null if fewer than n solves. */
export function bestAverage(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null
  let best: number | null = null
  for (let i = 0; i + n <= solves.length; i++) {
    const window = solves.slice(i, i + n)
    const a = n === 3 ? mean(window) : average(window)
    if (a !== null && (best === null || a < best)) best = a
  }
  return best
}

/** Mean of the whole session; any DNF -> DNF (null). null if empty. */
export function sessionMean(solves: Solve[]): number | null {
  return mean(solves)
}

/** Population standard deviation of non-DNF effective times. null if < 2 solves. */
export function stdDev(solves: Solve[]): number | null {
  const times = solves.filter((s) => s.penalty !== 'dnf').map(effectiveMs)
  if (times.length < 2) return null
  const m = times.reduce((a, b) => a + b, 0) / times.length
  const variance = times.reduce((a, b) => a + (b - m) ** 2, 0) / times.length
  return Math.sqrt(variance)
}

/** Rolling average-of-n at each index (null until enough solves / on DNF result). */
export function rollingAverages(solves: Solve[], n: number): (number | null)[] {
  return solves.map((_, i) =>
    i + 1 >= n ? (n === 3 ? mean(solves.slice(i + 1 - n, i + 1)) : average(solves.slice(i + 1 - n, i + 1))) : null,
  )
}

export interface SessionStats {
  count: number
  best: number | null
  currentMo3: number | null
  currentAo5: number | null
  currentAo12: number | null
  currentAo50: number | null
  currentAo100: number | null
  bestAo5: number | null
  bestAo12: number | null
  bestAo50: number | null
  bestAo100: number | null
  sessionMean: number | null
  stdDev: number | null
}

/** Compute the full stat block for a chronological list of solves. */
export function computeStats(solves: Solve[]): SessionStats {
  return {
    count: solves.length,
    best: bestSingle(solves),
    currentMo3: currentAverage(solves, 3),
    currentAo5: currentAverage(solves, 5),
    currentAo12: currentAverage(solves, 12),
    currentAo50: currentAverage(solves, 50),
    currentAo100: currentAverage(solves, 100),
    bestAo5: bestAverage(solves, 5),
    bestAo12: bestAverage(solves, 12),
    bestAo50: bestAverage(solves, 50),
    bestAo100: bestAverage(solves, 100),
    sessionMean: sessionMean(solves),
    stdDev: stdDev(solves),
  }
}
