import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowsClockwise, X } from '@phosphor-icons/react'
import { OLL_CASES, PLL_CASES, type AlgCase, type AlgSet } from '@/lib/algs/cases'
import { setupScrambleFor } from '@/lib/cube/setupScramble'
import type { Theme } from '@/hooks/useTheme'
import { useAlgProgress } from '@/lib/algs/progressStore'
import { NavTabs, type View } from '@/components/layout/NavTabs'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { CaseCard } from '@/components/trainer/CaseCard'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'
import { RecognitionTest } from '@/components/trainer/RecognitionTest'
import { fade } from '@/lib/motion'

interface Props {
  view: View
  onNavigate: (view: View) => void
  theme: Theme
  onToggleTheme: () => void
}

type Mode = 'browse' | 'recognize'

const SETS: AlgSet[] = ['OLL', 'PLL']

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 text-sm">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1 capitalize transition-colors ${
            value === o ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** OLL/PLL trainer: reference browser + drill + recognition mode. */
export function TrainerView({ view, onNavigate, theme, onToggleTheme }: Props) {
  const progress = useAlgProgress()
  const [set, setSet] = useState<AlgSet>('OLL')
  const [mode, setMode] = useState<Mode>('browse')
  const [drill, setDrill] = useState<{ c: AlgCase; scramble: string } | null>(null)

  const cases = set === 'OLL' ? OLL_CASES : PLL_CASES

  const counts = useMemo(() => {
    let learned = 0
    let learning = 0
    for (const c of cases) {
      const s = progress.get(set, c.id).status
      if (s === 'learned') learned += 1
      else if (s === 'learning') learning += 1
    }
    return { learned, learning, total: cases.length }
  }, [cases, progress, set])

  const openDrill = (c: AlgCase) => setDrill({ c, scramble: setupScrambleFor(c.algorithm) })
  const reroll = () => setDrill((d) => (d ? { ...d, scramble: setupScrambleFor(d.c.algorithm) } : d))

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-fg">
            C
          </span>
          <span className="text-sm font-medium tracking-tight">Cube Trainer</span>
        </div>
        <div className="flex items-center gap-2">
          <NavTabs view={view} onNavigate={onNavigate} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <Segmented options={SETS} value={set} onChange={setSet} />
        <Segmented options={['browse', 'recognize'] as Mode[]} value={mode} onChange={setMode} />
        <span className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-ready">{counts.learned} learned</span>
          <span className="text-warn">{counts.learning} learning</span>
          <span className="text-fg-subtle">{counts.total} total</span>
        </span>
      </div>

      {mode === 'recognize' ? (
        <RecognitionTest set={set} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {cases.map((c) => (
              <CaseCard key={`${c.set}-${c.id}`} c={c} onDrill={openDrill} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {drill ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrill(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
              variants={fade}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {drill.c.set === 'OLL' ? `OLL ${drill.c.id}` : drill.c.name || drill.c.id}
                </span>
                <button
                  type="button"
                  onClick={() => setDrill(null)}
                  aria-label="Close"
                  className="rounded-md p-1 text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center py-2">
                <CaseDiagram c={drill.c} size={156} />
              </div>

              <code className="nums mb-4 block text-center text-sm text-fg">{drill.c.algorithm}</code>

              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-fg-subtle">
                    Setup scramble
                  </span>
                  <button
                    type="button"
                    onClick={reroll}
                    aria-label="New scramble"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-fg-muted hover:text-fg"
                  >
                    <ArrowsClockwise size={12} /> New
                  </button>
                </div>
                <code className="nums block text-xs leading-relaxed text-fg-muted">
                  {drill.scramble}
                </code>
              </div>

              <p className="mt-3 text-center text-[11px] text-fg-subtle">
                Apply the scramble, then practice the algorithm.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
