import { useCallback, useState } from 'react'
import { TRIGGERS, type Trigger, type TriggerCategory } from '@/lib/algs/triggers'
import type { Theme } from '@/hooks/useTheme'
import type { View } from '@/components/layout/NavTabs'
import { AppHeader } from '@/components/layout/AppHeader'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { DrillModal, type DrillItem } from '@/components/trainer/DrillModal'
import { TriggerCard } from '@/components/triggers/TriggerCard'

interface Props {
  view: View
  onNavigate: (view: View) => void
  theme: Theme
  onToggleTheme: () => void
}

const GROUPS: { category: TriggerCategory; title: string; blurb: string }[] = [
  { category: 'core', title: 'Core triggers', blurb: 'The must-knows. Memorize these first — they recur everywhere.' },
  { category: 'setup', title: 'Inserts & setups', blurb: 'Pair inserts and chunks that combine into bigger algorithms.' },
  { category: 'wide', title: 'Wide variants', blurb: 'The same idea with a wide turn — used in the cross / edge-orientation cases.' },
]

/** Triggers reference: the building blocks algorithms are chunked from. */
export function TriggersView({ view, onNavigate, theme, onToggleTheme }: Props) {
  const [drill, setDrill] = useState<DrillItem | null>(null)
  const closeDrill = useCallback(() => setDrill(null), [])
  const openDrill = (t: Trigger) => setDrill({ title: t.name, algorithm: t.notation })

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AppHeader
        view={view}
        onNavigate={onNavigate}
        className="border-b border-border"
        right={<ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-6xl space-y-10">
          <section className="max-w-2xl space-y-1.5">
            <h1 className="text-sm font-semibold text-fg">Triggers</h1>
            <p className="text-xs leading-relaxed text-fg-subtle">
              Algorithms live in your fingers as a few reusable chunks, not long move lists. Learn these
              triggers and most last-layer algs become two or three pieces you already know — e.g. the cross
              case <code className="nums text-fg-muted">F R U R' U' F'</code> is just{' '}
              <span className="text-accent">F · sexy move · F'</span>. The 2-look cards in the Trainer show
              each algorithm broken into these pieces.
            </p>
          </section>

          {GROUPS.map((g) => {
            const items = TRIGGERS.filter((t) => t.category === g.category)
            if (!items.length) return null
            return (
              <section key={g.category} className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-fg">{g.title}</h2>
                  <p className="text-xs text-fg-subtle">{g.blurb}</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
                  {items.map((t) => (
                    <TriggerCard key={t.id} t={t} onDrill={openDrill} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <DrillModal item={drill} onClose={closeDrill} />
    </div>
  )
}
