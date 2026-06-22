import type { ReactNode } from 'react'
import { NavTabs, type View } from '@/components/layout/NavTabs'

/**
 * Shared top bar: brand on the left, the Timer/Trainer/Triggers nav absolutely
 * centered (so it stays put across views regardless of left/right content), and
 * a per-screen controls slot on the right. The header must span the full
 * viewport width for the nav to land at the true center.
 */
export function AppHeader({
  view,
  onNavigate,
  right,
  className = '',
}: {
  view: View
  onNavigate: (view: View) => void
  right?: ReactNode
  className?: string
}) {
  return (
    <header className={`relative flex h-14 shrink-0 items-center justify-between px-5 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-fg">
          C
        </span>
        <span className="text-sm font-medium tracking-tight">Cube Trainer</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <NavTabs view={view} onNavigate={onNavigate} />
      </div>

      {right ? <div className="flex items-center gap-2">{right}</div> : <div />}
    </header>
  )
}
