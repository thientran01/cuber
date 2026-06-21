/**
 * App data store: sessions + solves with optimistic localStorage persistence.
 *
 * This is the single source of truth the UI reads from. Writes update React
 * state and the localStorage mirror synchronously. The Supabase sync layer
 * (Phase 0 backend task) will subscribe to the same actions to push/pull in the
 * background — the `repo` interface here stays the swap point.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { CubeEvent, Penalty, Session, Solve } from '@/lib/types'
import { computeStats, type SessionStats } from '@/lib/stats/averages'
import { loadState, saveState, type PersistedState } from './localCache'
import { ensureAuth, fetchAll, pushSession, pushSolve, removeSession, removeSolve } from './supabase'

function uid(): string {
  return crypto.randomUUID()
}

function createDefaultState(): PersistedState {
  const id = uid()
  const session: Session = {
    id,
    name: 'Main',
    event: '333',
    createdAt: Date.now(),
    sortOrder: 0,
  }
  return { sessions: { [id]: session }, solves: {}, activeSessionId: id }
}

type Action =
  | { type: 'addSolve'; solve: Solve }
  | { type: 'setPenalty'; id: string; penalty: Penalty }
  | { type: 'setComment'; id: string; comment: string }
  | { type: 'deleteSolve'; id: string }
  | { type: 'addSession'; session: Session }
  | { type: 'renameSession'; id: string; name: string }
  | { type: 'deleteSession'; id: string }
  | { type: 'setActiveSession'; id: string }
  | { type: 'mergeRemote'; sessions: Record<string, Session>; solves: Record<string, Solve> }

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'addSolve':
      return { ...state, solves: { ...state.solves, [action.solve.id]: action.solve } }

    case 'setPenalty': {
      const solve = state.solves[action.id]
      if (!solve) return state
      return {
        ...state,
        solves: { ...state.solves, [action.id]: { ...solve, penalty: action.penalty } },
      }
    }

    case 'setComment': {
      const solve = state.solves[action.id]
      if (!solve) return state
      return {
        ...state,
        solves: { ...state.solves, [action.id]: { ...solve, comment: action.comment } },
      }
    }

    case 'deleteSolve': {
      const next = { ...state.solves }
      delete next[action.id]
      return { ...state, solves: next }
    }

    case 'addSession':
      return {
        ...state,
        sessions: { ...state.sessions, [action.session.id]: action.session },
        activeSessionId: action.session.id,
      }

    case 'renameSession': {
      const session = state.sessions[action.id]
      if (!session) return state
      return {
        ...state,
        sessions: { ...state.sessions, [action.id]: { ...session, name: action.name } },
      }
    }

    case 'deleteSession': {
      const sessionIds = Object.keys(state.sessions)
      if (sessionIds.length <= 1) return state // keep at least one session
      const sessions = { ...state.sessions }
      delete sessions[action.id]
      // drop the session's solves too
      const solves = Object.fromEntries(
        Object.entries(state.solves).filter(([, s]) => s.sessionId !== action.id),
      )
      const activeSessionId =
        state.activeSessionId === action.id ? Object.keys(sessions)[0] : state.activeSessionId
      return { sessions, solves, activeSessionId }
    }

    case 'setActiveSession':
      return state.sessions[action.id] ? { ...state, activeSessionId: action.id } : state

    case 'mergeRemote': {
      // NOTE — cloud sync is dormant until anonymous auth is enabled. This is a
      // simple remote-wins merge; before turning sync on, harden it:
      //   - per-row last-write-wins via `updated_at` (today remote always wins,
      //     which can clobber an edit made during the initial fetch window)
      //   - tombstones for offline deletes (else a deleted row is resurrected
      //     from the remote snapshot on the next load)
      //   - defer creating the default 'Main' session until after the first
      //     merge (else a fresh device mints a duplicate)
      // `cube_solves` has an ON DELETE CASCADE FK, so deleting a session does
      // clean up its solves server-side.
      // Remote is authoritative for shared ids; local-only rows are preserved
      // (and pushed separately).
      const sessions = { ...state.sessions, ...action.sessions }
      const solves = { ...state.solves, ...action.solves }
      const activeSessionId = sessions[state.activeSessionId]
        ? state.activeSessionId
        : (Object.keys(sessions)[0] ?? state.activeSessionId)
      return { sessions, solves, activeSessionId }
    }

    default:
      return state
  }
}

export interface NewSolveInput {
  timeMs: number
  penalty: Penalty
  scramble: string
  event: CubeEvent
}

interface DataContextValue {
  sessions: Session[]
  activeSession: Session
  /** Solves for the active session, chronological (oldest first). */
  solves: Solve[]
  stats: SessionStats
  addSolve: (input: NewSolveInput) => void
  setPenalty: (id: string, penalty: Penalty) => void
  setComment: (id: string, comment: string) => void
  deleteSolve: (id: string) => void
  addSession: (name: string, event?: CubeEvent) => void
  renameSession: (id: string, name: string) => void
  deleteSession: (id: string) => void
  setActiveSession: (id: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() ?? createDefaultState())

  // Latest state for fire-and-forget sync pushes that read post-dispatch values.
  const stateRef = useRef(state)
  stateRef.current = state

  // Optimistic localStorage mirror.
  useEffect(() => {
    saveState(state)
  }, [state])

  // Cloud sync: authenticate, push local-only rows, then merge the cloud copy.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const userId = await ensureAuth()
      if (cancelled || !userId) return
      const remote = await fetchAll()
      if (cancelled || !remote) return
      const local = stateRef.current
      for (const session of Object.values(local.sessions)) {
        if (!remote.sessions[session.id]) pushSession(session)
      }
      for (const solve of Object.values(local.solves)) {
        if (!remote.solves[solve.id]) pushSolve(solve)
      }
      dispatch({ type: 'mergeRemote', sessions: remote.sessions, solves: remote.solves })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const addSolve = useCallback((input: NewSolveInput) => {
    const solve: Solve = {
      id: uid(),
      sessionId: stateRef.current.activeSessionId,
      timeMs: input.timeMs,
      penalty: input.penalty,
      scramble: input.scramble,
      event: input.event,
      createdAt: Date.now(),
    }
    dispatch({ type: 'addSolve', solve })
    pushSolve(solve)
  }, [])

  const setPenalty = useCallback((id: string, penalty: Penalty) => {
    dispatch({ type: 'setPenalty', id, penalty })
    const solve = stateRef.current.solves[id]
    if (solve) pushSolve({ ...solve, penalty })
  }, [])

  const setComment = useCallback((id: string, comment: string) => {
    dispatch({ type: 'setComment', id, comment })
    const solve = stateRef.current.solves[id]
    if (solve) pushSolve({ ...solve, comment })
  }, [])

  const deleteSolve = useCallback((id: string) => {
    dispatch({ type: 'deleteSolve', id })
    removeSolve(id)
  }, [])

  const addSession = useCallback((name: string, event: CubeEvent = '333') => {
    const session: Session = {
      id: uid(),
      name,
      event,
      createdAt: Date.now(),
      sortOrder: Object.keys(stateRef.current.sessions).length,
    }
    dispatch({ type: 'addSession', session })
    pushSession(session)
  }, [])

  const renameSession = useCallback((id: string, name: string) => {
    dispatch({ type: 'renameSession', id, name })
    const session = stateRef.current.sessions[id]
    if (session) pushSession({ ...session, name })
  }, [])

  const deleteSession = useCallback((id: string) => {
    dispatch({ type: 'deleteSession', id })
    removeSession(id)
  }, [])

  const setActiveSession = useCallback((id: string) => {
    dispatch({ type: 'setActiveSession', id })
  }, [])

  const value = useMemo<DataContextValue>(() => {
    const sessions = Object.values(state.sessions).sort((a, b) => a.sortOrder - b.sortOrder)
    const activeSession = state.sessions[state.activeSessionId] ?? sessions[0]
    const solves = Object.values(state.solves)
      .filter((s) => s.sessionId === activeSession.id)
      .sort((a, b) => a.createdAt - b.createdAt)
    return {
      sessions,
      activeSession,
      solves,
      stats: computeStats(solves),
      addSolve,
      setPenalty,
      setComment,
      deleteSolve,
      addSession,
      renameSession,
      deleteSession,
      setActiveSession,
    }
  }, [
    state,
    addSolve,
    setPenalty,
    setComment,
    deleteSolve,
    addSession,
    renameSession,
    deleteSession,
    setActiveSession,
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
