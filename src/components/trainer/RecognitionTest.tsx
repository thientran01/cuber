import { useCallback, useEffect, useState } from 'react'
import { Check, X } from '@phosphor-icons/react'
import { OLL_CASES, PLL_CASES, type AlgCase, type AlgSet } from '@/lib/algs/cases'
import { useAlgProgress } from '@/lib/algs/progressStore'
import { formatMs } from '@/lib/format'
import { CaseDiagram } from '@/components/trainer/CaseDiagram'

const randomAuf = () => Math.floor(Math.random() * 4)

function pickFrom(cases: AlgCase[]): AlgCase {
  return cases[Math.floor(Math.random() * cases.length)]
}

/**
 * Recognition drill: shows a case at a random angle, you recognize it, reveal
 * the answer, then self-grade. Untracked progress feeds per-case status.
 */
export function RecognitionTest({ set }: { set: AlgSet }) {
  const progress = useAlgProgress()
  const allCases = set === 'OLL' ? OLL_CASES : PLL_CASES

  const [current, setCurrent] = useState<AlgCase>(() => pickFrom(allCases))
  const [auf, setAuf] = useState(() => randomAuf())
  const [revealed, setRevealed] = useState(false)
  const [startedAt, setStartedAt] = useState(() => performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [tally, setTally] = useState({ got: 0, missed: 0 })

  const next = useCallback(
    (excludeId?: string) => {
      // Exclude the just-answered case: avoids an immediate repeat and sidesteps
      // reading its not-yet-committed status from the pool filter.
      const eligible = allCases.filter((c) => c.id !== excludeId)
      const unlearned = eligible.filter((c) => progress.get(set, c.id).status !== 'learned')
      const c = pickFrom(unlearned.length ? unlearned : eligible.length ? eligible : allCases)
      setCurrent(c)
      setAuf(randomAuf())
      setRevealed(false)
      setStartedAt(performance.now())
      setElapsed(0)
    },
    [allCases, progress, set],
  )

  // New case when the set changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => next(), [set])

  const reveal = useCallback(() => {
    setElapsed(performance.now() - startedAt)
    setRevealed(true)
  }, [startedAt])

  const answer = (correct: boolean) => {
    progress.recordResult(set, current.id, { correct, ms: correct ? elapsed : undefined })
    setTally((t) => ({ got: t.got + (correct ? 1 : 0), missed: t.missed + (correct ? 0 : 1) }))
    next(current.id)
  }

  // Space reveals the answer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && !revealed) {
        e.preventDefault()
        reveal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, reveal])

  const title = current.set === 'OLL' ? `OLL ${current.id}` : current.name || `${current.id} Perm`

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
      <div className="flex items-center gap-4 text-xs text-fg-subtle">
        <span className="text-ready">{tally.got} got</span>
        <span className="text-fg-muted">{tally.missed} missed</span>
      </div>

      <CaseDiagram c={current} auf={auf} size={208} />

      {revealed ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-fg">{title}</div>
            <code className="nums text-sm text-fg-muted">{current.algorithm}</code>
            <div className="mt-1 text-xs text-fg-subtle">recognized in {formatMs(elapsed)}s</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => answer(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-fg-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <X size={15} /> Missed
            </button>
            <button
              type="button"
              onClick={() => answer(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              <Check size={15} /> Got it
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={reveal}
          className="rounded-lg border border-border bg-surface px-5 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
        >
          Reveal{' '}
          <kbd className="ml-1 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-fg-muted">
            Space
          </kbd>
        </button>
      )}
    </div>
  )
}
