/**
 * 2-Look OLL/PLL — the beginner-friendly subset that solves the last layer in
 * two steps each instead of one. The standard re-entry path: ~10 OLL + 7 PLL
 * algorithms instead of 57 + 21.
 *
 * Most of these cases are already in the full dataset (`cases.ts`) and are
 * referenced here so progress stays in sync (learning "Sune" in 2-look is the
 * same as learning OLL 27). The only genuinely new entries are the three OLL
 * edge-orientation ("make the cross") cases: in 2-look those are recognized by
 * edge pattern alone and use the simple `F R U R' U' F'` family, so they don't
 * map to a single one of the 57. Their algs are checked in `cases.verify.test.ts`.
 */
import { OLL_CASES, PLL_CASES, type AlgCase } from './cases'

export interface TwoLookStep {
  /** Step heading, e.g. "1 · Orient Edges". */
  title: string
  /** One-line instruction shown next to the heading. */
  blurb: string
  cases: AlgCase[]
}

/**
 * Orient-edges (yellow cross) cases. All corners are already oriented; only the
 * edge pattern — line / L / dot — distinguishes them.
 */
export const TWO_LOOK_EO: AlgCase[] = [
  { id: '2L-Line', set: 'OLL', name: 'Line', group: 'orient-edges', algorithm: "F R U R' U' F'", probability: '—' },
  { id: '2L-L', set: 'OLL', name: 'L-Shape', group: 'orient-edges', algorithm: "f R U R' U' f'", probability: '—' },
  {
    id: '2L-Dot',
    set: 'OLL',
    name: 'Dot',
    group: 'orient-edges',
    algorithm: "F R U R' U' F' f R U R' U' f'",
    probability: '—',
  },
]

function pick(cases: AlgCase[], ids: string[]): AlgCase[] {
  return ids.map((id) => cases.find((c) => c.id === id)).filter((c): c is AlgCase => Boolean(c))
}

export const TWO_LOOK_OLL: TwoLookStep[] = [
  { title: '1 · Orient Edges', blurb: 'Make the yellow cross', cases: TWO_LOOK_EO },
  {
    title: '2 · Orient Corners',
    blurb: 'OCLL — orient the last corners',
    // Sune / Anti-Sune first (most common, easiest), then the rest.
    cases: pick(OLL_CASES, ['27', '26', '21', '22', '23', '24', '25']),
  },
]

export const TWO_LOOK_PLL: TwoLookStep[] = [
  { title: '1 · Permute Corners', blurb: 'Solve the corners', cases: PLL_CASES.filter((c) => c.group === 'corners-only') },
  { title: '2 · Permute Edges', blurb: 'Solve the edges', cases: PLL_CASES.filter((c) => c.group === 'edges-only') },
]

export const TWO_LOOK_BY_SET: Record<'OLL' | 'PLL', TwoLookStep[]> = {
  OLL: TWO_LOOK_OLL,
  PLL: TWO_LOOK_PLL,
}

/** Total algorithm count for a set's 2-look path (for UI copy). */
export function twoLookCount(set: 'OLL' | 'PLL'): number {
  return TWO_LOOK_BY_SET[set].reduce((n, step) => n + step.cases.length, 0)
}
