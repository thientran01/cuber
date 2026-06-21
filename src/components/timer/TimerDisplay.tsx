import type { TimerView } from '@/hooks/useTimer'
import { formatMs } from '@/lib/format'

const INSPECTION_MS = 15_000

interface Props {
  view: TimerView
  inspection: boolean
  /** Shown when idle — typically the last solve time. */
  idleText: string
}

interface Hero {
  text: string
  tone: string
}

function inspectionHero(remainingMs: number, phase: TimerView['phase']): Hero {
  // Holding / ready colors take precedence during inspection prep.
  if (phase === 'hold') return { text: inspectionText(remainingMs), tone: 'text-holding' }
  if (phase === 'ready') return { text: inspectionText(remainingMs), tone: 'text-ready' }

  if (remainingMs <= -2000) return { text: 'DNF', tone: 'text-danger' }
  if (remainingMs <= 0) return { text: '+2', tone: 'text-danger' }

  const elapsed = INSPECTION_MS - remainingMs
  const tone = elapsed >= 12_000 ? 'text-danger' : elapsed >= 8_000 ? 'text-warn' : 'text-fg'
  return { text: inspectionText(remainingMs), tone }
}

function inspectionText(remainingMs: number): string {
  if (remainingMs <= -2000) return 'DNF'
  if (remainingMs <= 0) return '+2'
  return String(Math.ceil(remainingMs / 1000))
}

function computeHero(view: TimerView, inspection: boolean, idleText: string): Hero {
  if (view.phase === 'running') return { text: formatMs(view.runningMs), tone: 'text-fg' }

  if (
    inspection &&
    view.inspectionRemainingMs !== null &&
    (view.phase === 'inspect' || view.phase === 'hold' || view.phase === 'ready')
  ) {
    return inspectionHero(view.inspectionRemainingMs, view.phase)
  }

  if (view.phase === 'hold') return { text: '0.00', tone: 'text-holding' }
  if (view.phase === 'ready') return { text: '0.00', tone: 'text-ready' }
  return { text: idleText, tone: 'text-fg' }
}

/** The hero timer number. Color reflects the timing state. */
export function TimerDisplay({ view, inspection, idleText }: Props) {
  const { text, tone } = computeHero(view, inspection, idleText)
  return (
    <div
      className={`nums select-none text-[clamp(3.5rem,13vw,9rem)] font-semibold leading-none tracking-tight tabular-nums transition-colors duration-100 ${tone}`}
    >
      {text}
    </div>
  )
}
