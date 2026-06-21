/**
 * Supabase backend: anonymous-auth client + row mappers + CRUD helpers.
 *
 * Cloud sync is optional. With env vars set and anonymous sign-ins enabled, the
 * store hydrates from and pushes to Supabase in the background. Without them
 * (or if anonymous auth is disabled), the app runs local-first and these
 * helpers no-op.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CubeEvent, Penalty, Session, Solve } from '@/lib/types'
import type { AlgSet, CaseProgress } from '@/lib/algs/cases'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null

export const cloudEnabled = Boolean(supabase)

/** Ensure a session exists (anonymous if needed). Returns the user id, or null if unavailable. */
export async function ensureAuth(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  if (data.session?.user) return data.session.user.id
  const res = await supabase.auth.signInAnonymously()
  if (res.error) {
    console.warn(
      '[supabase] anonymous sign-in unavailable — enable it under Auth → Sign In/Up. Running local-only.',
      res.error.message,
    )
    return null
  }
  return res.data.user?.id ?? null
}

// ---- row mappers ---------------------------------------------------------

interface SolveRow {
  id: string
  session_id: string
  time_ms: number
  penalty: Penalty
  scramble: string
  event: string
  comment: string | null
  created_at: number
  updated_at: number
}

interface SessionRow {
  id: string
  name: string
  event: string
  sort_order: number
  created_at: number
  updated_at: number
}

function solveToRow(s: Solve): SolveRow {
  return {
    id: s.id,
    session_id: s.sessionId,
    time_ms: s.timeMs,
    penalty: s.penalty,
    scramble: s.scramble,
    event: s.event,
    comment: s.comment ?? null,
    created_at: s.createdAt,
    updated_at: Date.now(),
  }
}

function rowToSolve(r: SolveRow): Solve {
  return {
    id: r.id,
    sessionId: r.session_id,
    timeMs: r.time_ms,
    penalty: r.penalty,
    scramble: r.scramble,
    event: r.event as CubeEvent,
    createdAt: r.created_at,
    comment: r.comment ?? undefined,
  }
}

function sessionToRow(s: Session): SessionRow {
  return {
    id: s.id,
    name: s.name,
    event: s.event,
    sort_order: s.sortOrder,
    created_at: s.createdAt,
    updated_at: Date.now(),
  }
}

function rowToSession(r: SessionRow): Session {
  return {
    id: r.id,
    name: r.name,
    event: r.event as CubeEvent,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

// ---- CRUD (fire-and-forget; user_id defaults to auth.uid() via RLS) -------

export async function fetchAll(): Promise<{
  sessions: Record<string, Session>
  solves: Record<string, Solve>
} | null> {
  if (!supabase) return null
  const [sessionsRes, solvesRes] = await Promise.all([
    supabase.from('cube_sessions').select('*'),
    supabase.from('cube_solves').select('*'),
  ])
  if (sessionsRes.error || solvesRes.error) {
    console.warn('[supabase] fetch failed', sessionsRes.error ?? solvesRes.error)
    return null
  }
  const sessions: Record<string, Session> = {}
  for (const row of sessionsRes.data as SessionRow[]) sessions[row.id] = rowToSession(row)
  const solves: Record<string, Solve> = {}
  for (const row of solvesRes.data as SolveRow[]) solves[row.id] = rowToSolve(row)
  return { sessions, solves }
}

export function pushSolve(solve: Solve): void {
  if (!supabase) return
  void supabase
    .from('cube_solves')
    .upsert(solveToRow(solve))
    .then(({ error }) => error && console.warn('[supabase] pushSolve', error.message))
}

export function removeSolve(id: string): void {
  if (!supabase) return
  void supabase
    .from('cube_solves')
    .delete()
    .eq('id', id)
    .then(({ error }) => error && console.warn('[supabase] removeSolve', error.message))
}

export function pushSession(session: Session): void {
  if (!supabase) return
  void supabase
    .from('cube_sessions')
    .upsert(sessionToRow(session))
    .then(({ error }) => error && console.warn('[supabase] pushSession', error.message))
}

export function removeSession(id: string): void {
  if (!supabase) return
  void supabase
    .from('cube_sessions')
    .delete()
    .eq('id', id)
    .then(({ error }) => error && console.warn('[supabase] removeSession', error.message))
}

// ---- alg progress (keyed `${set}:${id}`) ---------------------------------

interface ProgressRow {
  alg_set: AlgSet
  case_id: string
  status: CaseProgress['status']
  best_recognition_ms: number | null
  reps: number
}

export async function fetchProgress(): Promise<Record<string, CaseProgress> | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('cube_alg_progress').select('*')
  if (error) {
    console.warn('[supabase] fetchProgress', error.message)
    return null
  }
  const out: Record<string, CaseProgress> = {}
  for (const r of data as ProgressRow[]) {
    out[`${r.alg_set}:${r.case_id}`] = {
      status: r.status,
      bestRecognitionMs: r.best_recognition_ms,
      reps: r.reps,
    }
  }
  return out
}

export function pushProgress(set: AlgSet, caseId: string, p: CaseProgress): void {
  if (!supabase) return
  void supabase
    .from('cube_alg_progress')
    .upsert(
      {
        alg_set: set,
        case_id: caseId,
        status: p.status,
        best_recognition_ms: p.bestRecognitionMs,
        reps: p.reps,
        updated_at: Date.now(),
      },
      { onConflict: 'user_id,alg_set,case_id' },
    )
    .then(({ error }) => error && console.warn('[supabase] pushProgress', error.message))
}
