/**
 * WCA random-state scramble generation via cubing.js.
 *
 * `randomScrambleForEvent` is async (runs a solver in a module web worker, with
 * a one-time WASM warm-up). To make "next scramble" feel instant we keep a small
 * pre-generated queue per event and refill it in the background.
 */
import { randomScrambleForEvent } from 'cubing/scramble'
import type { CubeEvent } from '@/lib/types'

const QUEUE_TARGET = 4

const queues = new Map<CubeEvent, string[]>()
const filling = new Set<CubeEvent>()

function queueFor(event: CubeEvent): string[] {
  let q = queues.get(event)
  if (!q) {
    q = []
    queues.set(event, q)
  }
  return q
}

async function fill(event: CubeEvent): Promise<void> {
  if (filling.has(event)) return
  filling.add(event)
  try {
    while (queueFor(event).length < QUEUE_TARGET) {
      const alg = await randomScrambleForEvent(event)
      queueFor(event).push(alg.toString())
    }
  } catch (err) {
    console.error('[scramble] generation failed', err)
  } finally {
    filling.delete(event)
  }
}

/** Warm up the worker + start filling the queue for an event. Call on mount. */
export function primeScrambles(event: CubeEvent = '333'): void {
  void fill(event)
}

/** Get the next scramble string, refilling the queue in the background. */
export async function nextScramble(event: CubeEvent = '333'): Promise<string> {
  const q = queueFor(event)
  if (q.length === 0) {
    // Cold path: nothing queued yet — generate one directly, then backfill.
    const alg = await randomScrambleForEvent(event)
    void fill(event)
    return alg.toString()
  }
  const scramble = q.shift()!
  void fill(event)
  return scramble
}
