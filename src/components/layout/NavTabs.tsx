export type View = 'timer' | 'trainer'

interface Props {
  view: View
  onNavigate: (view: View) => void
}

const TABS: { id: View; label: string }[] = [
  { id: 'timer', label: 'Timer' },
  { id: 'trainer', label: 'Trainer' },
]

/** Timer / Trainer view switcher, shared across screen headers. */
export function NavTabs({ view, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 text-sm">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onNavigate(tab.id)}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            view === tab.id ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
