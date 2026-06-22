import { caseTitle, type AlgCase } from '@/lib/algs/cases'
import { STATUS_LABEL, useAlgProgress } from '@/lib/algs/progressStore'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'

interface Props {
  c: AlgCase
  onDrill?: (c: AlgCase) => void
  /** Override the card title (the 2-look view shows case names, e.g. "Sune"). */
  label?: string
  /** Override the subtitle. Pass '' to hide it. */
  sublabel?: string
}

// Distinguished by shape as well as color (colorblind-safe): hollow ring /
// solid / solid-with-halo for unknown / learning / learned.
const DOT_STYLE: Record<string, string> = {
  unknown: 'border-2 border-fg-subtle/60',
  learning: 'bg-warn',
  learned: 'bg-ready ring-2 ring-ready/30',
}

/** Reference card: status dot + recognition diagram + name + algorithm. */
export function CaseCard({ c, onDrill, label, sublabel }: Props) {
  const progress = useAlgProgress()
  const status = progress.get(c.set, c.id).status

  const title = label ?? caseTitle(c)
  const subtitle = sublabel ?? (c.set === 'OLL' ? c.name : c.group)

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => progress.cycleStatus(c.set, c.id)}
          aria-label={`Status: ${STATUS_LABEL[status]}. Click to change.`}
          title={STATUS_LABEL[status]}
          className="-my-1.5 -ml-1.5 grid shrink-0 place-items-center rounded p-2"
        >
          <span className={`size-2.5 rounded-full ${DOT_STYLE[status]}`} />
        </button>
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
          className="mt-0.5 rounded-md border border-border py-1 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          Drill
        </button>
      ) : null}
    </div>
  )
}
