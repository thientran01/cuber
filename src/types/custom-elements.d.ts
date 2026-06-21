import type { HTMLAttributes } from 'react'

/**
 * JSX typings for the cubing.js web components we render directly:
 * - <scramble-display> (npm: scramble-display) — 2D cube net from a scramble
 * - <twisty-player> (cubing/twisty) — 2D/3D playable cube
 *
 * Custom-element attributes are passed as strings; for `Alg` objects we set
 * element *properties* imperatively via a ref instead.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'scramble-display': HTMLAttributes<HTMLElement> & {
        event?: string
        scramble?: string
        visualization?: '2D' | '3D'
        checkered?: string
      }
      'twisty-player': HTMLAttributes<HTMLElement> & {
        puzzle?: string
        alg?: string
        'experimental-setup-alg'?: string
        visualization?: string
        background?: string
        'control-panel'?: string
        'hint-facelets'?: string
        'back-view'?: string
      }
    }
  }
}
