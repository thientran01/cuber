import { useState } from 'react'
import { Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useData } from '@/lib/data/store'
import { useScramble } from '@/hooks/useScramble'
import { useTimer } from '@/hooks/useTimer'
import { formatMs, formatSolveTime } from '@/lib/format'
import { NavTabs, type View } from '@/components/layout/NavTabs'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ScramblePanel } from '@/components/timer/ScramblePanel'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { LastSolve } from '@/components/timer/LastSolve'
import { SolveList } from '@/components/timer/SolveList'
import { StatsBar } from '@/components/stats/StatsBar'
import { StatsSheet } from '@/components/stats/StatsSheet'
import { SessionSwitcher } from '@/components/sessions/SessionSwitcher'

export function TimerScreen({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  const {
    sessions,
    activeSession,
    solves,
    stats,
    addSolve,
    setPenalty,
    deleteSolve,
    addSession,
    setActiveSession,
  } = useData()
  const { scramble, next } = useScramble(activeSession.event)
  const [inspection, setInspection] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  const timer = useTimer({
    inspection,
    onComplete: (result) => {
      const prevBest = stats.best
      const hadSolves = solves.length > 0
      if (scramble) {
        addSolve({
          timeMs: result.timeMs,
          penalty: result.penalty,
          scramble,
          event: activeSession.event,
        })
      }
      void next()
      // Celebrate a new best single (but not the very first solve of a session).
      if (result.penalty !== 'dnf') {
        const eff = result.timeMs + (result.penalty === 'plus2' ? 2000 : 0)
        if (hadSolves && (prevBest === null || eff < prevBest)) {
          toast.success(`New PB single — ${formatMs(eff)}`, { description: 'Clean solve. 🎉' })
        }
      }
    },
  })

  const lastSolve = solves.at(-1)
  const timing = timer.phase !== 'idle'
  const idleText = lastSolve ? formatSolveTime(lastSolve) : '0.00'

  const fade = (hidden: boolean) =>
    `transition-opacity duration-200 ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <aside className={`flex w-72 shrink-0 flex-col border-r border-border ${fade(timing)}`}>
        <div className="border-b border-border p-3">
          <SessionSwitcher
            sessions={sessions}
            activeSession={activeSession}
            onSelect={setActiveSession}
            onAdd={() => addSession(`Session ${sessions.length + 1}`)}
          />
        </div>
        <div className="border-b border-border p-4">
          <StatsBar stats={stats} />
          <button
            type="button"
            onClick={() => setStatsOpen(true)}
            className="mt-3 w-full rounded-md border border-border py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Detailed stats
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1">
          <SolveList solves={solves} onSetPenalty={setPenalty} onDelete={deleteSolve} />
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col">
        <header className={`flex h-14 shrink-0 items-center justify-between px-5 ${fade(timing)}`}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-fg">
              C
            </span>
            <span className="text-sm font-medium tracking-tight">Cube Trainer</span>
          </div>
          <div className="flex items-center gap-2">
            <NavTabs view={view} onNavigate={onNavigate} />
            <button
              type="button"
              onClick={() => setInspection((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                inspection
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border text-fg-muted hover:bg-surface-2 hover:text-fg'
              }`}
            >
              <Eye size={14} />
              Inspection {inspection ? 'on' : 'off'}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pb-16">
          <ScramblePanel scramble={scramble} event={activeSession.event} className={fade(timing)} />
          <TimerDisplay view={timer} inspection={inspection} idleText={idleText} />
          <LastSolve
            solve={lastSolve}
            onTogglePlus2={() =>
              lastSolve && setPenalty(lastSolve.id, lastSolve.penalty === 'plus2' ? 'none' : 'plus2')
            }
            onToggleDnf={() =>
              lastSolve && setPenalty(lastSolve.id, lastSolve.penalty === 'dnf' ? 'none' : 'dnf')
            }
            onDelete={() => lastSolve && deleteSolve(lastSolve.id)}
            className={fade(timing)}
          />
        </div>
      </main>

      <StatsSheet
        open={statsOpen}
        onOpenChange={setStatsOpen}
        solves={solves}
        stats={stats}
        sessionName={activeSession.name}
      />
    </div>
  )
}
