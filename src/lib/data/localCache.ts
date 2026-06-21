import type { Session, Solve } from '@/lib/types'

const STORAGE_KEY = 'cube.v1.state'

export interface PersistedState {
  sessions: Record<string, Session>
  solves: Record<string, Solve>
  activeSessionId: string
}

/** Read persisted state from localStorage, tolerating missing/corrupt data. */
export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed.sessions || !parsed.solves || !parsed.activeSessionId) return null
    return parsed
  } catch {
    return null
  }
}

/** Persist state to localStorage (best-effort). */
export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy-mode errors
  }
}
