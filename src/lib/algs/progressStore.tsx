/**
 * Per-case learning progress (status + recognition stats), keyed `${set}:${id}`.
 * localStorage-first with a dormant Supabase sync (activates once anonymous
 * auth is enabled). Mirrors the solve store's optimistic pattern.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AlgSet, CaseProgress, CaseStatus } from '@/lib/algs/cases'
import { fetchProgress, pushProgress } from '@/lib/data/supabase'

const STORAGE_KEY = 'cube.v1.algProgress'
const DEFAULT: CaseProgress = { status: 'unknown', bestRecognitionMs: null, reps: 0 }
const ORDER: CaseStatus[] = ['unknown', 'learning', 'learned']

type ProgressMap = Record<string, CaseProgress>

const keyOf = (set: AlgSet, id: string) => `${set}:${id}`

function load(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as ProgressMap
  } catch {
    return {}
  }
}

function save(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

interface ProgressContextValue {
  get: (set: AlgSet, id: string) => CaseProgress
  setStatus: (set: AlgSet, id: string, status: CaseStatus) => void
  cycleStatus: (set: AlgSet, id: string) => void
  recordResult: (set: AlgSet, id: string, result: { correct: boolean; ms?: number }) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function AlgProgressProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<ProgressMap>(() => load())

  // Latest committed map, so event handlers read fresh state rather than the
  // value captured in their render closure.
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    save(map)
  }, [map])

  // Pull remote once (no-op until cloud sync is active); local wins on conflict.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const remote = await fetchProgress()
      if (cancelled || !remote) return
      setMap((local) => ({ ...remote, ...local }))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const get = (set: AlgSet, id: string): CaseProgress => mapRef.current[keyOf(set, id)] ?? DEFAULT

  const commit = (set: AlgSet, id: string, next: CaseProgress) => {
    setMap((prev) => ({ ...prev, [keyOf(set, id)]: next }))
    pushProgress(set, id, next)
  }

  const setStatus = (set: AlgSet, id: string, status: CaseStatus) =>
    commit(set, id, { ...get(set, id), status })

  const cycleStatus = (set: AlgSet, id: string) => {
    const cur = get(set, id)
    const next = ORDER[(ORDER.indexOf(cur.status) + 1) % ORDER.length]
    commit(set, id, { ...cur, status: next })
  }

  const recordResult = (set: AlgSet, id: string, { correct, ms }: { correct: boolean; ms?: number }) => {
    const cur = get(set, id)
    const reps = cur.reps + 1
    // Correct: advance unknown -> learning -> learned. Incorrect: only demote
    // learned -> learning; an unknown miss stays unknown (don't reward a miss).
    let status: CaseStatus = cur.status
    if (correct) {
      status = cur.status === 'unknown' ? 'learning' : 'learned'
    } else if (cur.status === 'learned') {
      status = 'learning'
    }
    const bestRecognitionMs =
      correct && ms != null
        ? cur.bestRecognitionMs == null
          ? ms
          : Math.min(cur.bestRecognitionMs, ms)
        : cur.bestRecognitionMs
    commit(set, id, { status, reps, bestRecognitionMs })
  }

  const value: ProgressContextValue = { get, setStatus, cycleStatus, recordResult }
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useAlgProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useAlgProgress must be used within <AlgProgressProvider>')
  return ctx
}

export const STATUS_LABEL: Record<CaseStatus, string> = {
  unknown: 'Unknown',
  learning: 'Learning',
  learned: 'Learned',
}

/** Tailwind text color token per status. */
export const STATUS_COLOR: Record<CaseStatus, string> = {
  unknown: 'text-fg-subtle',
  learning: 'text-warn',
  learned: 'text-ready',
}
