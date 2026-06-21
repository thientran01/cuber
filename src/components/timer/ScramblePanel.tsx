import 'scramble-display'
import { useState } from 'react'
import type { CubeEvent } from '@/lib/types'
import { Cube3D } from './Cube3D'

type CubeView = '2D' | '3D'
const STORAGE_KEY = 'cube.v1.cubeView'

function initialView(): CubeView {
  try {
    return localStorage.getItem(STORAGE_KEY) === '3D' ? '3D' : '2D'
  } catch {
    return '2D'
  }
}

interface Props {
  scramble: string | null
  event: CubeEvent
  className?: string
}

/** Scramble notation + cube preview (2D net or lazy-loaded interactive 3D). */
export function ScramblePanel({ scramble, event, className }: Props) {
  const [view, setView] = useState<CubeView>(initialView)
  const pick = (v: CubeView) => {
    setView(v)
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {
      // ignore
    }
  }

  return (
    <div className={className}>
      <p className="nums mx-auto max-w-2xl text-center text-base leading-relaxed text-fg-muted sm:text-lg">
        {scramble ?? 'Generating scramble…'}
      </p>
      <div className="mt-5 flex flex-col items-center gap-2.5">
        <div className="flex h-[180px] items-center justify-center">
          {view === '2D' ? (
            <scramble-display
              event={event}
              scramble={scramble ?? ''}
              visualization="2D"
              style={{ width: '232px', height: '174px' }}
            />
          ) : (
            <Cube3D scramble={scramble ?? ''} size={180} />
          )}
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 text-xs">
          {(['2D', '3D'] as CubeView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => pick(v)}
              aria-pressed={view === v}
              aria-label={`${v} cube view`}
              className={`rounded-md px-2.5 py-0.5 transition-colors ${
                view === v ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
