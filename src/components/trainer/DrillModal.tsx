import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowsClockwise, X } from '@phosphor-icons/react'
import { setupScrambleFor } from '@/lib/cube/setupScramble'
import { fade } from '@/lib/motion'

export interface DrillItem {
  title: string
  /** The algorithm/trigger to practice; setup scramble is its inverse. */
  algorithm: string
  /** Optional recognition diagram (cases have one; triggers don't). */
  diagram?: ReactNode
}

/**
 * Practice modal: shows a setup scramble that leaves the cube in the case (or,
 * for a trigger, one move-inverse away) so you can apply it and drill the
 * algorithm. Shared by the trainer cards and the triggers reference.
 */
export function DrillModal({ item, onClose }: { item: DrillItem | null; onClose: () => void }) {
  const [drill, setDrill] = useState<{ alg: string; scramble: string } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Derive a fresh scramble synchronously when a new item opens, so the scramble
  // and case title are always in sync — no empty/stale frame before an effect.
  if (item && item.algorithm !== drill?.alg) {
    setDrill({ alg: item.algorithm, scramble: setupScrambleFor(item.algorithm) })
  }
  const scramble = drill?.scramble ?? ''
  const reroll = () => item && setDrill({ alg: item.algorithm, scramble: setupScrambleFor(item.algorithm) })

  // Close on Esc; focus the dialog when an item is open.
  useEffect(() => {
    if (!item) return
    const raf = requestAnimationFrame(() => closeRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} drill`}
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
            variants={fade}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{item.title}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close drill"
                className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>

            {item.diagram ? <div className="flex justify-center py-2">{item.diagram}</div> : null}

            <code className="nums mb-4 block text-center text-sm text-fg">{item.algorithm}</code>

            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-fg-subtle">Setup scramble</span>
                <button
                  type="button"
                  onClick={reroll}
                  aria-label="New scramble"
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-fg-muted hover:text-fg"
                >
                  <ArrowsClockwise size={12} /> New
                </button>
              </div>
              <code className="nums block text-xs leading-relaxed text-fg-muted">{scramble}</code>
            </div>

            <p className="mt-3 text-center text-[11px] text-fg-subtle">
              Apply the scramble, then practice the algorithm.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
