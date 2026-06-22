import { useCallback, useMemo, useState } from 'react'
import { caseTitle, OLL_CASES, PLL_CASES, type AlgCase, type AlgSet } from '@/lib/algs/cases'
import { TWO_LOOK_BY_SET, twoLookCases, twoLookCount } from '@/lib/algs/twoLook'
import { decompositionFor } from '@/lib/algs/triggers'
import type { Theme } from '@/hooks/useTheme'
import { useAlgProgress } from '@/lib/algs/progressStore'
import type { View } from '@/components/layout/NavTabs'
import { AppHeader } from '@/components/layout/AppHeader'
import { Segmented } from '@/components/layout/Segmented'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { CaseCard } from '@/components/trainer/CaseCard'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'
import { DrillModal, type DrillItem } from '@/components/trainer/DrillModal'
import { RecognitionTest, type RecognitionScope } from '@/components/trainer/RecognitionTest'

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
  const [drill, setDrill] = useState<DrillItem | null>(null)
  const closeDrill = useCallback(() => setDrill(null), [])

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

  const openDrill = (c: AlgCase) =>
    setDrill({ title: caseTitle(c), algorithm: c.algorithm, diagram: <CaseDiagram c={c} size={156} /> })

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AppHeader
        view={view}
        onNavigate={onNavigate}
        className="border-b border-border"
        right={<ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      />

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
                        decomposition={decompositionFor(c.set, c.id)}
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

      <DrillModal item={drill} onClose={closeDrill} />
    </div>
  )
}
