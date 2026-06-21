import { Drawer } from 'vaul'
import { X } from '@phosphor-icons/react'
import type { Solve } from '@/lib/types'
import type { SessionStats } from '@/lib/stats/averages'
import { formatStat } from '@/lib/format'
import { TrendChart } from './TrendChart'
import { Histogram } from './Histogram'

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className={`nums text-base ${accent ? 'text-accent' : 'text-fg'}`}>{value}</div>
    </div>
  )
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  solves: Solve[]
  stats: SessionStats
  sessionName: string
}

/** Right-side slide-over with the full stat block, trend, and distribution. */
export function StatsSheet({ open, onOpenChange, solves, stats, sessionName }: Props) {
  const c = stats.count
  return (
    <Drawer.Root direction="right" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-[94vw] flex-col border-l border-border bg-surface outline-none">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
            <Drawer.Title className="text-sm font-medium text-fg">{sessionName} · Stats</Drawer.Title>
            <Drawer.Close
              className="rounded-md p-1 text-fg-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Close"
            >
              <X size={16} />
            </Drawer.Close>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            <div className="grid grid-cols-3 gap-2">
              <Tile label="solves" value={String(c)} />
              <Tile label="best" value={formatStat(stats.best)} accent />
              <Tile label="mean" value={formatStat(stats.sessionMean, c > 0)} />
              <Tile label="ao5" value={c >= 5 ? formatStat(stats.currentAo5, true) : '—'} />
              <Tile label="ao12" value={c >= 12 ? formatStat(stats.currentAo12, true) : '—'} />
              <Tile label="ao100" value={c >= 100 ? formatStat(stats.currentAo100, true) : '—'} />
              <Tile label="best ao5" value={formatStat(stats.bestAo5)} accent />
              <Tile label="best ao12" value={formatStat(stats.bestAo12)} accent />
              <Tile label="σ dev" value={formatStat(stats.stdDev)} />
            </div>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-medium text-fg-muted">Trend</h3>
                <div className="flex items-center gap-3 text-[10px] text-fg-subtle">
                  <span className="flex items-center gap-1">
                    <span className="h-px w-3 bg-fg-subtle" />
                    single
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-0.5 w-3 bg-accent" />
                    ao5
                  </span>
                </div>
              </div>
              <TrendChart solves={solves} />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-medium text-fg-muted">Distribution</h3>
              <Histogram solves={solves} />
            </section>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
