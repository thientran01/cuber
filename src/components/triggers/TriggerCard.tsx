import type { Trigger, TriggerCategory } from '@/lib/algs/triggers'

const CATEGORY_LABEL: Record<TriggerCategory, string> = {
  core: 'Core',
  setup: 'Setup',
  wide: 'Wide',
}

/** Reference card for one trigger: notation, what it does, finger trick, and where it shows up. */
export function TriggerCard({ t, onDrill }: { t: Trigger; onDrill: (t: Trigger) => void }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-fg">{t.name}</span>
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-fg-subtle">
          {CATEGORY_LABEL[t.category]}
        </span>
      </div>

      <code className="nums rounded-md bg-surface-2 px-2.5 py-1.5 text-center text-sm font-medium text-accent">
        {t.notation}
      </code>

      <p className="text-xs leading-relaxed text-fg-muted">{t.does}</p>

      <p className="text-[11px] leading-relaxed text-fg-subtle">
        <span className="text-fg-muted">Fingers · </span>
        {t.fingerTrick}
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-fg-subtle">Inverse</dt>
        <dd className="nums text-fg-muted">{t.inverse}</dd>
        {t.mirror ? (
          <>
            <dt className="text-fg-subtle">Mirror</dt>
            <dd className="nums text-fg-muted">{t.mirror}</dd>
          </>
        ) : null}
      </dl>

      {t.appearsIn?.length ? (
        <details className="text-[11px]">
          <summary className="cursor-pointer rounded text-fg-subtle transition-colors hover:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Appears in {t.appearsIn.length} algorithms
          </summary>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {t.appearsIn.map((u) => (
              <span
                key={`${u.set}-${u.caseId}`}
                className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-fg-muted"
              >
                {u.set === 'OLL' && /^\d+$/.test(u.caseId) ? `OLL ${u.caseId}` : u.name}
              </span>
            ))}
          </div>
        </details>
      ) : null}

      <button
        type="button"
        onClick={() => onDrill(t)}
        className="mt-0.5 rounded-md border border-border py-1 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Drill
      </button>
    </div>
  )
}
