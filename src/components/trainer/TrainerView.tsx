import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowsClockwise, X } from '@phosphor-icons/react'
import { caseTitle, OLL_CASES, PLL_CASES, type AlgCase, type AlgSet } from '@/lib/algs/cases'
import { TWO_LOOK_BY_SET, twoLookCases, twoLookCount } from '@/lib/algs/twoLook'
import { setupScrambleFor } from '@/lib/cube/setupScramble'
import type { Theme } from '@/hooks/useTheme'
import { useAlgProgress } from '@/lib/algs/progressStore'
import { NavTabs, type View } from '@/components/layout/NavTabs'
import { Segmented } from '@/components/layout/Segmented'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { CaseCard } from '@/components/trainer/CaseCard'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'
import { RecognitionTest, type RecognitionScope } from '@/components/trainer/RecognitionTest'
import { fade } from '@/lib/motion'

interface Props {
  view: View
  onNavigate: (view: View) => void
  theme: Theme
  onToggleTheme: () => void
}

type Mode = 'browse' | 'recognize'

const SETS: AlgSet[] = ['OLL', 'PLL']
const SCOPES: RecognitionScope[] = ['2-look', 'all']
const scopeLabel = (s: RecognitionScope) => (s === '2-look' ? '2-Look' : 'All')

/** OLL/PLL trainer: reference browser + drill + recognition mode. */
export function TrainerView({ view, onNavigate, theme, onToggleTheme }: Props) {
  const progress = useAlgProgress()
  const [set, setSet] = useState<AlgSet>('OLL')
  const [mode, setMode] = useState<Mode>('browse')
  // Recognition starts on the 2-look subset — the beginner re-entry path.
  const [scope, setScope] = useState<RecognitionScope>('2-look')
  const [drill, setDrill] = useState<{ c: AlgCase; scramble: string } | null>(null)
  const drillCloseRef = useRef<HTMLButtonElement>(null)

  // Drill modal: close on Esc and move focus into the dialog when it opens.
  useEffect(() => {
    if (!drill) return
    const raf = requestAnimationFrame(() => drillCloseRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrill(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [drill])

  const cases = set === 'OLL' ? OLL_CASES : PLL_CASES

  const counts = useMemo(() => {
    // In recognize mode the counts track the active scope, so "learned / total"
    // matches the pool being drilled (e.g. 10 for 2-look OLL, not 57).
    const pool = mode === 'recognize' && scope === '2-look' ? twoLookCases(set) : cases
    let learned = 0
    let learning = 0
    for (const c of pool) {
      const s = progress.get(set, c.id).status
      if (s === 'learned') learned += 1
      else if (s === 'learning') learning += 1
    }
    return { learned, learning, total: pool.length }
  }, [cases, mode, scope, progress, set])

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
        <Segmented options={SETS} value={set} onChange={setSet} ariaLabel="Algorithm set" />
        <Segmented
          options={['browse', 'recognize'] as Mode[]}
          value={mode}
          onChange={setMode}
          ariaLabel="Trainer mode"
        />
        {mode === 'recognize' ? (
          <Segmented
            options={SCOPES}
            value={scope}
            onChange={setScope}
            getLabel={scopeLabel}
            ariaLabel="Recognition scope"
          />
        ) : null}
        <span className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-ready">{counts.learned} learned</span>
          <span className="text-warn">{counts.learning} learning</span>
          <span className="text-fg-subtle">{counts.total} total</span>
        </span>
      </div>

      {mode === 'recognize' ? (
        <RecognitionTest set={set} scope={scope} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-6xl space-y-10">
            {/* 2-Look: the beginner path — separated and on top. */}
            <section className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-fg">2-Look {set}</h2>
                <p className="text-xs text-fg-subtle">
                  Start here — {twoLookCount(set)} algorithms in two steps. The fast way back in.
                </p>
              </div>
              {TWO_LOOK_BY_SET[set].map((step) => (
                <div key={step.title} className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xs font-medium text-fg-muted">{step.title}</h3>
                    <span className="text-[11px] text-fg-subtle">{step.blurb}</span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                    {step.cases.map((c) => (
                      <CaseCard
                        key={`2L-${c.set}-${c.id}`}
                        c={c}
                        onDrill={openDrill}
                        label={c.name}
                        sublabel={c.set === 'OLL' && /^\d+$/.test(c.id) ? `OLL ${c.id}` : ''}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Full 1-Look reference: every case. */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-fg">Full {set} · 1-Look</h2>
                <p className="text-xs text-fg-subtle">All {cases.length} cases, one algorithm each.</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {cases.map((c) => (
                  <CaseCard key={`${c.set}-${c.id}`} c={c} onDrill={openDrill} />
                ))}
              </div>
            </section>
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
              role="dialog"
              aria-modal="true"
              aria-label={`${caseTitle(drill.c)} drill`}
              className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
              variants={fade}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">{caseTitle(drill.c)}</span>
                <button
                  ref={drillCloseRef}
                  type="button"
                  onClick={() => setDrill(null)}
                  aria-label="Close drill"
                  className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
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
