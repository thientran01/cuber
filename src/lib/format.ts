import type { Solve } from '@/lib/types'

/**
 * Format milliseconds as a speedcubing time string:
 *   9999 -> "9.99", 72340 -> "1:12.34"
 */
export function formatMs(ms: number, decimals = 2): string {
  const totalSeconds = ms / 1000
  if (totalSeconds < 60) return totalSeconds.toFixed(decimals)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60
  // pad seconds to two integer digits, e.g. "05.30"
  return `${minutes}:${seconds.toFixed(decimals).padStart(decimals + 3, '0')}`
}

/** Display string for a solve, honoring penalties: DNF, or "12.34+" for +2. */
export function formatSolveTime(solve: Solve): string {
  if (solve.penalty === 'dnf') return 'DNF'
  const base = formatMs(solve.timeMs + (solve.penalty === 'plus2' ? 2000 : 0))
  return solve.penalty === 'plus2' ? `${base}+` : base
}

/**
 * Display a computed stat value. `null` means either not enough solves or a
 * DNF average; pass `isDnf` to render "DNF" instead of the em dash.
 */
export function formatStat(value: number | null, isDnf = false): string {
  if (value === null) return isDnf ? 'DNF' : '—'
  return formatMs(value)
}
