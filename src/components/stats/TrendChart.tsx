import { effectiveMs, type Solve } from '@/lib/types'
import { rollingAverages } from '@/lib/stats/averages'

const W = 320
const H = 120
const PAD_L = 3
const PAD_R = 3
const PAD_T = 8
const PAD_B = 6

function buildPath(vals: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = ''
  let pen = false
  vals.forEach((v, i) => {
    if (v == null) {
      pen = false
      return
    }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `
    pen = true
  })
  return d.trim()
}

/** Singles (faint) + rolling ao5 (accent) over the session. */
export function TrendChart({ solves }: { solves: Solve[] }) {
  if (solves.length < 2) {
    return <p className="py-8 text-center text-xs text-fg-subtle">Not enough solves yet</p>
  }

  const singles = solves.map((s) => (s.penalty === 'dnf' ? null : effectiveMs(s)))
  const ao5 = rollingAverages(solves, 5)
  const finite = [...singles, ...ao5].filter((v): v is number => v != null)
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const range = max - min || 1
  const n = solves.length

  const x = (i: number) => PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R)
  const y = (v: number) => PAD_T + (1 - (v - min) / range) * (H - PAD_T - PAD_B)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <path d={buildPath(singles, x, y)} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1} opacity={0.45} />
      <path
        d={buildPath(ao5, x, y)}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
