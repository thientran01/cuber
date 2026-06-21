import { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

export interface Command {
  id: string
  label: string
  group?: string
  run: () => void
}

/**
 * Cmd/Ctrl-K command palette. Opens on the shortcut, filters as you type,
 * arrow keys to navigate, Enter to run, Esc to close.
 */
export function CommandPalette({ commands }: { commands: Command[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // focus after the element mounts
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  if (!open) return null

  const clampedActive = Math.min(active, Math.max(0, filtered.length - 1))

  const run = (cmd: Command | undefined) => {
    if (!cmd) return
    setOpen(false)
    cmd.run()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, filtered.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            run(filtered[clampedActive])
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3.5">
          <MagnifyingGlass size={16} className="text-fg-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Type a command…"
            aria-label="Command palette"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={filtered[clampedActive] ? `command-${filtered[clampedActive].id}` : undefined}
            className="w-full bg-transparent py-3 text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <ul id="command-palette-list" role="listbox" className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-fg-subtle">No commands</li>
          ) : (
            filtered.map((cmd, i) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  id={`command-${cmd.id}`}
                  role="option"
                  aria-selected={i === clampedActive}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(cmd)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    i === clampedActive ? 'bg-surface-2 text-fg' : 'text-fg-muted'
                  }`}
                >
                  <span>{cmd.label}</span>
                  {cmd.group ? <span className="text-[11px] text-fg-subtle">{cmd.group}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
