import { useCallback, useEffect, useRef, useState } from 'react'
import type { CubeEvent } from '@/lib/types'
import { nextScramble, primeScrambles } from '@/lib/cube/scramble'

/**
 * Holds the current scramble for an event and exposes `next()`. The previous
 * scramble stays visible until the next one resolves (instant from the queue),
 * so there's no flicker between solves.
 */
export function useScramble(event: CubeEvent = '333') {
  const [scramble, setScramble] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const reqId = useRef(0)

  const next = useCallback(async () => {
    const id = ++reqId.current
    setLoading(true)
    const s = await nextScramble(event)
    // Ignore stale results if another request superseded this one.
    if (id === reqId.current) {
      setScramble(s)
      setLoading(false)
    }
  }, [event])

  useEffect(() => {
    primeScrambles(event)
    void next()
  }, [event, next])

  return { scramble, loading, next }
}
