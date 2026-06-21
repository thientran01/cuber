import type { SessionStats } from '@/lib/stats/averages'
import { formatStat } from '@/lib/format'

interface Props {
  stats: SessionStats
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-fg-subtle">{label}</span>
      <span className="nums text-sm text-fg">{value}</span>
    </div>
  )
}

/** Compact session stats: best, current ao5/ao12, mean, count. */
export function StatsBar({ stats }: Props) {
  const { count, best, currentAo5, currentAo12, bestAo5, bestAo12, sessionMean } = stats
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Stat label="solves" value={String(count)} />
      <Stat label="best" value={formatStat(best)} />
      <Stat label="ao5" value={count >= 5 ? formatStat(currentAo5, true) : '—'} />
      <Stat label="ao12" value={count >= 12 ? formatStat(currentAo12, true) : '—'} />
      <Stat label="best ao5" value={formatStat(bestAo5)} />
      <Stat label="best ao12" value={formatStat(bestAo12)} />
      <Stat label="mean" value={formatStat(sessionMean, count > 0)} />
    </div>
  )
}
