import type { AlgCase } from '@/lib/algs/cases'
import { STATUS_LABEL, useAlgProgress } from '@/lib/algs/progressStore'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'

interface Props {
  c: AlgCase
  onDrill?: (c: AlgCase) => void
}

const DOT: Record<string, string> = {
  unknown: 'bg-fg-subtle/40',
  learning: 'bg-warn',
  learned: 'bg-ready',
}

/** Reference card: status dot + recognition diagram + name + algorithm. */
export function CaseCard({ c, onDrill }: Props) {
  const progress = useAlgProgress()
  const status = progress.get(c.set, c.id).status

  const title = c.set === 'OLL' ? `OLL ${c.id}` : c.name || `${c.id} Perm`
  const subtitle = c.set === 'OLL' ? c.name : c.group

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => progress.cycleStatus(c.set, c.id)}
          aria-label={`Status: ${STATUS_LABEL[status]} (click to change)`}
          title={STATUS_LABEL[status]}
          className={`mt-1 size-2.5 shrink-0 rounded-full ${DOT[status]}`}
        />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-sm font-medium text-fg">{title}</span>
          {subtitle ? <span className="text-[11px] text-fg-subtle">{subtitle}</span> : null}
        </div>
      </div>

      <div className="flex justify-center py-1">
        <CaseDiagram c={c} size={104} />
      </div>

      <code className="nums block text-center text-[11px] leading-snug text-fg-muted">
        {c.algorithm}
      </code>

      {onDrill ? (
        <button
          type="button"
          onClick={() => onDrill(c)}
          className="mt-0.5 rounded-md border border-border py-1 text-xs text-fg-muted opacity-0 transition-all hover:bg-surface-2 hover:text-fg group-hover:opacity-100"
        >
          Drill
        </button>
      ) : null}
    </div>
  )
}
