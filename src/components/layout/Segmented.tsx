import type { ReactNode } from 'react'

/**
 * Compact segmented control. Values are rendered `capitalize` by default;
 * pass `getLabel` when the value's raw text isn't the desired label
 * (e.g. a scope id like "2-look" → "2-Look").
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  getLabel,
  ariaLabel,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  getLabel?: (v: T) => ReactNode
  ariaLabel?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 text-sm"
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-md px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            getLabel ? '' : 'capitalize'
          } ${value === o ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'}`}
        >
          {getLabel ? getLabel(o) : o}
        </button>
      ))}
    </div>
  )
}
