import { Prohibit, Trash } from '@phosphor-icons/react'
import type { Solve } from '@/lib/types'
import { formatSolveTime } from '@/lib/format'

interface Props {
  solve: Solve | undefined
  onTogglePlus2: () => void
  onToggleDnf: () => void
  onDelete: () => void
  className?: string
}

const chip =
  'inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg'
const chipActive = 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 hover:text-accent'

/** Most-recent solve with inline quick actions (+2 / DNF / delete). */
export function LastSolve({ solve, onTogglePlus2, onToggleDnf, onDelete, className }: Props) {
  if (!solve) {
    return (
      <p className={`text-xs text-fg-subtle ${className ?? ''}`}>
        Hold{' '}
        <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[11px]">Space</kbd>{' '}
        to start
      </p>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="nums text-sm text-fg">{formatSolveTime(solve)}</span>
      <button
        type="button"
        onClick={onTogglePlus2}
        className={`${chip} ${solve.penalty === 'plus2' ? chipActive : ''}`}
      >
        +2
      </button>
      <button
        type="button"
        onClick={onToggleDnf}
        className={`${chip} ${solve.penalty === 'dnf' ? chipActive : ''}`}
      >
        <Prohibit size={13} /> DNF
      </button>
      <button type="button" onClick={onDelete} className={chip} aria-label="Delete solve">
        <Trash size={13} />
      </button>
    </div>
  )
}
