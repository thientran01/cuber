import 'scramble-display'
import type { CubeEvent } from '@/lib/types'

interface Props {
  scramble: string | null
  event: CubeEvent
  className?: string
}

/** Scramble notation + a 2D cube net (cubing.js scramble-display web component). */
export function ScramblePanel({ scramble, event, className }: Props) {
  return (
    <div className={className}>
      <p className="nums mx-auto max-w-2xl text-center text-base leading-relaxed text-fg-muted sm:text-lg">
        {scramble ?? 'Generating scramble…'}
      </p>
      <div className="mt-5 flex justify-center">
        <scramble-display
          event={event}
          scramble={scramble ?? ''}
          visualization="2D"
          style={{ width: '232px', height: '174px' }}
        />
      </div>
    </div>
  )
}
