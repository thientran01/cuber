import { useEffect, useRef, useState } from 'react'
import type { Penalty } from '@/lib/types'

export type TimerPhase = 'idle' | 'inspect' | 'hold' | 'ready' | 'running'

export interface SolveResult {
  timeMs: number
  /** Penalty derived from inspection overrun (+2 over 15s, DNF over 17s). */
  penalty: Penalty
}

interface UseTimerOptions {
  inspection: boolean
  holdThresholdMs?: number
  onComplete: (result: SolveResult) => void
  /** When true, keyboard handling is suspended (e.g. a dialog/input is open). */
  disabled?: boolean
}

export interface TimerView {
  phase: TimerPhase
  /** Elapsed solve time while running, else 0. */
  runningMs: number
  /** Remaining inspection ms while inspecting/holding, else null. */
  inspectionRemainingMs: number | null
}

const INSPECTION_MS = 15_000
const INSPECTION_PLUS2_MS = 15_000
const INSPECTION_DNF_MS = 17_000

function isTypingTarget(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

/**
 * Speedcubing timer interaction as a state machine.
 *
 * Without inspection: hold Space (red) → after threshold turns green (ready) →
 * release to start → any key stops.
 *
 * With inspection: tap Space to begin the 15s inspection → hold Space again to
 * prepare (red → green) → release to start the solve. Inspection overrun adds
 * +2 (>15s) or DNF (>17s).
 */
export function useTimer({
  inspection,
  holdThresholdMs = 400,
  onComplete,
  disabled = false,
}: UseTimerOptions) {
  const [view, setView] = useState<TimerView>({
    phase: 'idle',
    runningMs: 0,
    inspectionRemainingMs: null,
  })

  // Latest values via refs so the once-attached listeners never go stale.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const inspectionRef = useRef(inspection)
  inspectionRef.current = inspection
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled

  const m = useRef({
    phase: 'idle' as TimerPhase,
    spaceDown: false,
    inspectionStart: 0,
    solveStart: 0,
    holdTimeout: 0 as ReturnType<typeof setTimeout> | 0,
    raf: 0,
  })

  useEffect(() => {
    const machine = m.current

    function publish() {
      const now = performance.now()
      if (machine.phase === 'running') {
        setView({ phase: 'running', runningMs: now - machine.solveStart, inspectionRemainingMs: null })
      } else if (
        inspectionRef.current &&
        machine.inspectionStart &&
        (machine.phase === 'inspect' || machine.phase === 'hold' || machine.phase === 'ready')
      ) {
        setView({
          phase: machine.phase,
          runningMs: 0,
          inspectionRemainingMs: INSPECTION_MS - (now - machine.inspectionStart),
        })
      } else {
        setView({ phase: machine.phase, runningMs: 0, inspectionRemainingMs: null })
      }
    }

    function loop() {
      // Stalling past the 17s inspection limit without starting a solve is a DNF.
      if (
        inspectionRef.current &&
        machine.phase === 'inspect' &&
        machine.inspectionStart &&
        performance.now() - machine.inspectionStart > INSPECTION_DNF_MS
      ) {
        machine.phase = 'idle'
        machine.inspectionStart = 0
        machine.spaceDown = false
        clearTimeout(machine.holdTimeout)
        stopLoop()
        publish()
        onCompleteRef.current({ timeMs: 0, penalty: 'dnf' })
        return
      }
      publish()
      if (machine.phase !== 'idle') {
        machine.raf = requestAnimationFrame(loop)
      }
    }

    function startLoop() {
      cancelAnimationFrame(machine.raf)
      machine.raf = requestAnimationFrame(loop)
    }

    function stopLoop() {
      cancelAnimationFrame(machine.raf)
    }

    function startHold() {
      machine.phase = 'hold'
      clearTimeout(machine.holdTimeout)
      machine.holdTimeout = setTimeout(() => {
        if (machine.phase === 'hold') {
          machine.phase = 'ready'
          publish()
        }
      }, holdThresholdMs)
      publish()
    }

    function startRunning() {
      machine.solveStart = performance.now()
      machine.phase = 'running'
      startLoop()
    }

    function stopRunning() {
      const elapsed = performance.now() - machine.solveStart
      let penalty: Penalty = 'none'
      if (inspectionRef.current && machine.inspectionStart) {
        const inspectionElapsed = machine.solveStart - machine.inspectionStart
        if (inspectionElapsed > INSPECTION_DNF_MS) penalty = 'dnf'
        else if (inspectionElapsed > INSPECTION_PLUS2_MS) penalty = 'plus2'
      }
      machine.phase = 'idle'
      machine.inspectionStart = 0
      stopLoop()
      publish()
      onCompleteRef.current({ timeMs: Math.round(elapsed), penalty })
    }

    function onSpaceDown() {
      switch (machine.phase) {
        case 'idle':
          if (inspectionRef.current) {
            machine.inspectionStart = performance.now()
            machine.phase = 'inspect'
            startLoop()
          } else {
            startHold()
          }
          break
        case 'inspect':
          startHold()
          break
        default:
          break
      }
    }

    function onSpaceUp() {
      switch (machine.phase) {
        case 'hold':
          // released before the ready threshold — cancel the prep
          clearTimeout(machine.holdTimeout)
          if (inspectionRef.current && machine.inspectionStart) {
            machine.phase = 'inspect'
          } else {
            machine.phase = 'idle'
            stopLoop()
          }
          publish()
          break
        case 'ready':
          startRunning()
          break
        default:
          break
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (disabledRef.current) return

      // Running: any key stops the solve.
      if (machine.phase === 'running') {
        e.preventDefault()
        stopRunning()
        return
      }

      if (e.code !== 'Space') return
      if (isTypingTarget()) return
      e.preventDefault()
      if (machine.spaceDown) return // ignore auto-repeat
      machine.spaceDown = true
      onSpaceDown()
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== 'Space') return
      machine.spaceDown = false
      if (disabledRef.current) return
      onSpaceUp()
    }

    // Window lost focus (alt-tab, OS shortcut, tab switch) — the keyup may never
    // arrive. Clear the held-key flag and abandon any prep/inspection so the
    // next Space press is honored. A solve already running is left alone.
    function resetToSafe() {
      machine.spaceDown = false
      clearTimeout(machine.holdTimeout)
      if (machine.phase !== 'running' && machine.phase !== 'idle') {
        machine.phase = 'idle'
        machine.inspectionStart = 0
        stopLoop()
        publish()
      }
    }

    function handleBlur() {
      resetToSafe()
    }

    function handleVisibility() {
      if (document.hidden) resetToSafe()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(machine.holdTimeout)
      cancelAnimationFrame(machine.raf)
    }
  }, [holdThresholdMs])

  return view
}
