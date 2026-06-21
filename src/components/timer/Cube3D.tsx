import { useEffect, useRef } from 'react'
import type { TwistyPlayer } from 'cubing/twisty'

interface Props {
  scramble: string
  size?: number
}

/**
 * Interactive 3D cube showing the scramble, drag-to-rotate. cubing/twisty is
 * lazy-loaded (it's a large chunk) so it only downloads when 3D is selected.
 */
export function Cube3D({ scramble, size = 200 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<TwistyPlayer | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { TwistyPlayer: Player } = await import('cubing/twisty')
      if (cancelled || !hostRef.current) return
      const player = new Player({
        puzzle: '3x3x3',
        visualization: '3D',
        background: 'none',
        controlPanel: 'none',
        hintFacelets: 'none',
        experimentalSetupAlg: scramble,
        alg: '',
      })
      player.style.width = '100%'
      player.style.height = '100%'
      hostRef.current.replaceChildren(player)
      playerRef.current = player
    })()
    return () => {
      cancelled = true
      playerRef.current?.remove()
      playerRef.current = null
    }
    // Mount once; scramble updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (playerRef.current) playerRef.current.experimentalSetupAlg = scramble
  }, [scramble])

  return <div ref={hostRef} style={{ width: size, height: size }} />
}
