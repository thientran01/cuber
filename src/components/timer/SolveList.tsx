import { Prohibit, Trash } from '@phosphor-icons/react'
import type { Penalty, Solve } from '@/lib/types'
import { formatSolveTime } from '@/lib/format'

interface Props {
  /** Chronological (oldest first). Rendered newest first. */
  solves: Solve[]
  onSetPenalty: (id: string, penalty: Penalty) => void
  onDelete: (id: string) => void
}

/** Scrollable list of solves with hover quick-actions. */
export function SolveList({ solves, onSetPenalty, onDelete }: Props) {
  if (solves.length === 0) {
    return <p className="px-3 py-6 text-center text-xs text-fg-subtle">No solves yet</p>
  }

  return (
    <ul className="flex flex-col">
      {solves
        .map((solve, i) => ({ solve, number: i + 1 }))
        .reverse()
        .map(({ solve, number }) => (
          <li
            key={solve.id}
            className="group flex items-center justify-between gap-2 rounded-md px-3 py-1.5 hover:bg-surface-2"
          >
            <span className="flex items-baseline gap-2">
              <span className="w-6 text-right text-xs tabular-nums text-fg-subtle">{number}.</span>
              <span
                className={`nums text-sm ${solve.penalty === 'dnf' ? 'text-fg-subtle line-through' : 'text-fg'}`}
              >
                {formatSolveTime(solve)}
              </span>
            </span>
            <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                aria-label="Toggle +2"
                onClick={() => onSetPenalty(solve.id, solve.penalty === 'plus2' ? 'none' : 'plus2')}
                className={`rounded px-1.5 py-0.5 text-[11px] hover:bg-surface ${solve.penalty === 'plus2' ? 'text-accent' : 'text-fg-muted'}`}
              >
                +2
              </button>
              <button
                type="button"
                aria-label="Toggle DNF"
                onClick={() => onSetPenalty(solve.id, solve.penalty === 'dnf' ? 'none' : 'dnf')}
                className={`rounded p-1 hover:bg-surface ${solve.penalty === 'dnf' ? 'text-accent' : 'text-fg-muted'}`}
              >
                <Prohibit size={13} />
              </button>
              <button
                type="button"
                aria-label="Delete solve"
                onClick={() => onDelete(solve.id)}
                className="rounded p-1 text-fg-muted hover:bg-surface hover:text-danger"
              >
                <Trash size={13} />
              </button>
            </span>
          </li>
        ))}
    </ul>
  )
}
