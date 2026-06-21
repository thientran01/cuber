import { useMemo } from 'react'
import type { AlgCase } from '@/lib/algs/cases'
import { caseStateAlg } from '@/lib/cube/setupScramble'
import { faceletsForAlg } from '@/lib/cube/facelets'

/**
 * Standard top-down OLL/PLL recognition diagram, drawn from the case's facelets.
 * - OLL: the U face shown yellow (oriented) vs dark (not), with yellow side
 *   "flaps" where a last-layer sticker points outward.
 * - PLL: U face yellow, side flaps in their real colors, with arrows showing the
 *   piece permutation.
 *
 * Facelet indices follow the verified engine's Kociemba layout; the top-down U
 * grid is indices 0..8 (back row 0-1-2, front row 6-7-8), with side flaps mapped
 * per face.
 */

const COLORS: Record<string, string> = {
  U: '#f5d020', // yellow (oriented)
  R: '#e5462f', // red
  F: '#2ba84a', // green
  D: '#f4f4f5', // white
  L: '#f2901f', // orange
  B: '#2f6fdb', // blue
}
const UNORIENTED = '#3a3a40' // dark grey for a not-oriented OLL sticker

// 24 whole-cube orientations, to normalize algs that rotate the cube (A/E/J/V).
const ROTATIONS = [
  '', 'y', 'y2', "y'", 'x', 'x y', 'x y2', "x y'", 'x2', 'x2 y', 'x2 y2', "x2 y'",
  "x'", "x' y", "x' y2", "x' y'", 'z', 'z y', 'z y2', "z y'", "z'", "z' y", "z' y2", "z' y'",
]

function centersSolved(f: string): boolean {
  return f[4] === 'U' && f[13] === 'R' && f[22] === 'F' && f[31] === 'D' && f[40] === 'L' && f[49] === 'B'
}

const AUF = ['', 'U', 'U2', "U'"]

/** Case facelets in upright (centers-solved) orientation, optionally pre-rotated by AUF. */
function caseFacelets(algorithm: string, auf: number): string {
  const base = `${caseStateAlg(algorithm)} ${AUF[auf % 4]}`.trim()
  for (const r of ROTATIONS) {
    const f = faceletsForAlg(r ? `${base} ${r}` : base)
    if (centersSolved(f)) return f
  }
  return faceletsForAlg(base)
}

// ---- geometry (viewBox 0 0 95 95) ----------------------------------------
const S = 20 // cell size
const G = 2 // gap
const T = 6 // flap thickness
const FG = 1.5 // grid-to-flap gap
const M = 8 // outer margin
const O = M + T + FG // grid origin
const SPAN = 3 * S + 2 * G // 64
const SIZE = 2 * O + SPAN // 95

function cell(uIdx: number) {
  const row = Math.floor(uIdx / 3)
  const col = uIdx % 3
  return { x: O + col * (S + G), y: O + row * (S + G), cx: O + col * (S + G) + S / 2, cy: O + row * (S + G) + S / 2 }
}

// Flap stickers: [global facelet index, x, y] around the grid.
interface Flap {
  idx: number
  x: number
  y: number
  w: number
  h: number
}
function flaps(): Flap[] {
  const out: Flap[] = []
  // Front (below grid): facelets 18,19,20 under U front row 6,7,8
  for (let c = 0; c < 3; c++) out.push({ idx: 18 + c, x: cell(6 + c).x, y: O + SPAN + FG, w: S, h: T })
  // Back (above grid): facelets 47,46,45 over U back row 0,1,2
  for (let c = 0; c < 3; c++) out.push({ idx: 47 - c, x: cell(c).x, y: O - FG - T, w: S, h: T })
  // Right (right of grid): facelets 11,10,9 beside U right column 2,5,8
  for (let r = 0; r < 3; r++) out.push({ idx: 11 - r, x: O + SPAN + FG, y: cell(r * 3 + 2).y, w: T, h: S })
  // Left (left of grid): facelets 36,37,38 beside U left column 0,3,6
  for (let r = 0; r < 3; r++) out.push({ idx: 36 + r, x: O - FG - T, y: cell(r * 3).y, w: T, h: S })
  return out
}
const FLAPS = flaps()

// PLL permutation slots (upright). Identify the piece in each slot by its side
// sticker color(s), then arrow it to its home slot.
const EDGE_SLOTS = [
  { u: 1, flap: 46, solved: 'B' },
  { u: 3, flap: 37, solved: 'L' },
  { u: 5, flap: 10, solved: 'R' },
  { u: 7, flap: 19, solved: 'F' },
]
const CORNER_SLOTS = [
  { u: 0, flaps: [36, 47], solved: ['L', 'B'] },
  { u: 2, flaps: [11, 45], solved: ['R', 'B'] },
  { u: 6, flaps: [18, 38], solved: ['F', 'L'] },
  { u: 8, flaps: [20, 9], solved: ['F', 'R'] },
]
const samePair = (a: string[], b: string[]) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])

interface Arrow {
  x1: number
  y1: number
  x2: number
  y2: number
}
function pllArrows(f: string): Arrow[] {
  const arrows: Arrow[] = []
  for (const slot of EDGE_SLOTS) {
    const home = EDGE_SLOTS.find((s) => s.solved === f[slot.flap])
    if (home && home.u !== slot.u) {
      const a = cell(slot.u)
      const b = cell(home.u)
      arrows.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy })
    }
  }
  for (const slot of CORNER_SLOTS) {
    const pair = [f[slot.flaps[0]], f[slot.flaps[1]]]
    const home = CORNER_SLOTS.find((s) => samePair(s.solved, pair))
    if (home && home.u !== slot.u) {
      const a = cell(slot.u)
      const b = cell(home.u)
      arrows.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy })
    }
  }
  return arrows
}

function ArrowLine({ a }: { a: Arrow }) {
  // shorten to leave room for the head, then a triangle at the tip
  const dx = a.x2 - a.x1
  const dy = a.y2 - a.y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const head = 5
  const tipx = a.x2 - ux * 2
  const tipy = a.y2 - uy * 2
  const bx = tipx - ux * head
  const by = tipy - uy * head
  const px = -uy
  const py = ux
  const w = 2.6
  return (
    <g stroke="#101012" fill="#101012">
      <line x1={a.x1} y1={a.y1} x2={bx} y2={by} strokeWidth={2} strokeLinecap="round" />
      <polygon
        points={`${tipx},${tipy} ${bx + px * w},${by + py * w} ${bx - px * w},${by - py * w}`}
        stroke="none"
      />
    </g>
  )
}

interface Props {
  c: AlgCase
  size?: number
  auf?: number
}

export function CaseDiagram({ c, size = 96, auf = 0 }: Props) {
  const f = useMemo(() => caseFacelets(c.algorithm, auf), [c.algorithm, auf])
  const isOll = c.set === 'OLL'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${c.set} ${c.id} recognition diagram`}
    >
      {/* flaps */}
      {FLAPS.map((fl) => {
        const isU = f[fl.idx] === 'U'
        const fill = isOll ? (isU ? COLORS.U : 'transparent') : COLORS[f[fl.idx]]
        if (isOll && !isU) return null
        return (
          <rect key={fl.idx} x={fl.x} y={fl.y} width={fl.w} height={fl.h} rx={1} fill={fill} />
        )
      })}

      {/* U face 3x3 */}
      {Array.from({ length: 9 }, (_, u) => {
        const { x, y } = cell(u)
        const fill = isOll ? (f[u] === 'U' ? COLORS.U : UNORIENTED) : COLORS[f[u]]
        return <rect key={u} x={x} y={y} width={S} height={S} rx={2.5} fill={fill} stroke="#0a0a0b" strokeWidth={1.5} />
      })}

      {/* PLL permutation arrows */}
      {!isOll && pllArrows(f).map((a, i) => <ArrowLine key={i} a={a} />)}
    </svg>
  )
}
