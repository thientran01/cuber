import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { CornersIn, CornersOut, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useData } from '@/lib/data/store'
import { downloadCsv, parseCsv, solvesToCsv } from '@/lib/data/csv'
import { useScramble } from '@/hooks/useScramble'
import { useTimer } from '@/hooks/useTimer'
import type { Theme } from '@/hooks/useTheme'
import { formatMs, formatSolveTime } from '@/lib/format'
import type { View } from '@/components/layout/NavTabs'
import { AppHeader } from '@/components/layout/AppHeader'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ScramblePanel } from '@/components/timer/ScramblePanel'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { LastSolve } from '@/components/timer/LastSolve'
import { SolveList } from '@/components/timer/SolveList'
import { StatsBar } from '@/components/stats/StatsBar'
import { StatsSheet } from '@/components/stats/StatsSheet'
import { SessionSwitcher } from '@/components/sessions/SessionSwitcher'

interface Props {
  view: View
  onNavigate: (view: View) => void
  theme: Theme
  onToggleTheme: () => void
  focus: boolean
  onToggleFocus: () => void
}

export function TimerScreen({ view, onNavigate, theme, onToggleTheme, focus, onToggleFocus }: Props) {
  const {
    sessions,
    activeSession,
    solves,
    stats,
    addSolve,
    importSolves,
    setPenalty,
    deleteSolve,
    addSession,
    setActiveSession,
  } = useData()
  const { scramble, next } = useScramble(activeSession.event)
  const [inspection, setInspection] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // "New scramble" command (from the palette) regenerates the scramble.
  useEffect(() => {
    const handler = () => void next()
    window.addEventListener('cube:new-scramble', handler)
    return () => window.removeEventListener('cube:new-scramble', handler)
  }, [next])

  // CSV export, kept in a ref so the palette's "Export" command sees fresh solves.
  const exportRef = useRef<() => void>(() => {})
  exportRef.current = () => {
    if (solves.length === 0) {
      toast.error('No solves to export')
      return
    }
    const name = `${activeSession.name.replace(/\s+/g, '-').toLowerCase()}-solves.csv`
    downloadCsv(name, solvesToCsv(solves))
  }
  useEffect(() => {
    const handler = () => exportRef.current()
    window.addEventListener('cube:export-csv', handler)
    return () => window.removeEventListener('cube:export-csv', handler)
  }, [])

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const rows = parseCsv(await file.text())
    if (rows.length === 0) {
      toast.error('No solves found in that file')
      return
    }
    importSolves(rows)
    toast.success(`Imported ${rows.length} solve${rows.length === 1 ? '' : 's'}`)
  }

  const timer = useTimer({
    inspection,
    disabled: statsOpen,
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

  // Header + sidebar hide while timing OR in focus mode; the scramble/timer stay.
  const chromeHidden = timing || focus

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <AppHeader
        view={view}
        onNavigate={onNavigate}
        className={fade(chromeHidden)}
        right={
          <>
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
            <button
              type="button"
              onClick={onToggleFocus}
              aria-label="Enter focus mode"
              title="Enter focus mode"
              className="grid size-8 place-items-center rounded-md border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <CornersOut size={15} />
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </>
        }
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`flex w-72 shrink-0 flex-col border-r border-border ${fade(chromeHidden)}`}>
        <div className="border-b border-border p-3">
          <SessionSwitcher
            sessions={sessions}
            activeSession={activeSession}
            onSelect={setActiveSession}
            onAdd={() => addSession(`Session ${sessions.length + 1}`)}
          />
          <div className="mt-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-md border border-border py-1 text-[11px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Import CSV
            </button>
            <button
              type="button"
              onClick={() => exportRef.current()}
              className="flex-1 rounded-md border border-border py-1 text-[11px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Export CSV
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={onImportFile}
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

        {focus && !timing ? (
          <button
            type="button"
            onClick={onToggleFocus}
            aria-label="Exit focus mode"
            title="Exit focus mode"
            className="fixed right-4 top-4 z-20 grid size-9 place-items-center rounded-md border border-border bg-surface text-fg-muted shadow-sm transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <CornersIn size={16} />
          </button>
        ) : null}
      </main>
      </div>

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
