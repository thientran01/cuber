import { Plus } from '@phosphor-icons/react'
import type { Session } from '@/lib/types'

interface Props {
  sessions: Session[]
  activeSession: Session
  onSelect: (id: string) => void
  onAdd: () => void
}

/** Session dropdown + add button. */
export function SessionSwitcher({ sessions, activeSession, onSelect, onAdd }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={activeSession.id}
        onChange={(e) => onSelect(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none focus:border-border-strong"
      >
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onAdd}
        aria-label="New session"
        className="grid size-8 shrink-0 place-items-center rounded-md border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
