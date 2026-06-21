import { effectiveMs, type Solve } from '@/lib/types'
import { formatMs } from '@/lib/format'

const W = 320
const H = 120
const PAD_B = 16
const BINS = 12

/** Distribution of non-DNF solve times. */
export function Histogram({ solves }: { solves: Solve[] }) {
  const times = solves.filter((s) => s.penalty !== 'dnf').map(effectiveMs)
  if (times.length < 3) {
    return <p className="py-8 text-center text-xs text-fg-subtle">Not enough solves yet</p>
  }

  const min = Math.min(...times)
  const max = Math.max(...times)
  const span = max - min || 1
  const counts = new Array<number>(BINS).fill(0)
  for (const t of times) {
    const b = Math.min(BINS - 1, Math.floor(((t - min) / span) * BINS))
    counts[b] += 1
  }
  const peak = Math.max(...counts) || 1
  const bw = W / BINS

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {counts.map((c, i) => {
        const h = (c / peak) * (H - PAD_B - 4)
        return (
          <rect
            key={i}
            x={i * bw + 1}
            y={H - PAD_B - h}
            width={bw - 2}
            height={h}
            rx={1.5}
            fill="var(--color-accent)"
            opacity={0.85}
          />
        )
      })}
      <text x={0} y={H - 4} className="fill-fg-subtle" style={{ fontSize: 9 }}>
        {formatMs(min)}
      </text>
      <text x={W} y={H - 4} textAnchor="end" className="fill-fg-subtle" style={{ fontSize: 9 }}>
        {formatMs(max)}
      </text>
    </svg>
  )
}
