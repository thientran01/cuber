/**
 * CFOP "triggers" — the small, named, reusable move sequences that speedsolvers
 * chunk algorithms into. Knowing the triggers lets you reconstruct an alg from a
 * few chunks ("F · sexy · F'") instead of memorizing a raw 8-move list.
 *
 * The dataset (notation, inverses, and the 2-look decompositions below) was
 * curated and then adversarially verified against the already-cubing.js-verified
 * alg strings in `cases.ts` / `twoLook.ts`. `triggers.verify.test.ts` re-checks
 * it: every `inverse` is the true move-inverse of its `notation`, every
 * `appearsIn` notation is an exact substring of the referenced case's algorithm,
 * and every decomposition's steps concatenate back to the case's exact alg.
 */
import type { AlgSet } from './cases'

export type TriggerCategory = 'core' | 'setup' | 'wide'

export interface TriggerUsage {
  caseId: string
  set: AlgSet
  name: string
}

export interface Trigger {
  id: string
  name: string
  /** Exact, space-separated WCA notation. */
  notation: string
  /** The sequence that undoes it (reverse order, each move inverted). */
  inverse: string
  /** Left-hand mirror if one is commonly taught, else ''. */
  mirror: string
  category: TriggerCategory
  /** One plain line: what it does / why it matters. */
  does: string
  /** Brief finger-trick note. */
  fingerTrick: string
  /** Full-set OLL/PLL cases whose alg contains this trigger verbatim. */
  appearsIn?: TriggerUsage[]
}

export const TRIGGERS: Trigger[] = [
  {
    id: 'sexy-move',
    name: 'Sexy Move',
    notation: "R U R' U'",
    inverse: "U R U' R'",
    mirror: "L' U' L U",
    category: 'core',
    does: 'The most fundamental CFOP trigger — pulls a pair out of and back into the right slot. The backbone of countless OLL/PLL algs.',
    fingerTrick: 'Right index flicks U, ring/middle do R and R′ — one fluid wrist roll, no regrip.',
    appearsIn: [
      { caseId: 'F', set: 'PLL', name: 'F Perm' },
      { caseId: 'Gd', set: 'PLL', name: 'Gd Perm' },
      { caseId: 'Jb', set: 'PLL', name: 'Jb Perm' },
      { caseId: 'Na', set: 'PLL', name: 'Na Perm' },
      { caseId: 'Rb', set: 'PLL', name: 'Rb Perm' },
      { caseId: 'T', set: 'PLL', name: 'T Perm' },
      { caseId: 'Y', set: 'PLL', name: 'Y Perm' },
      { caseId: '9', set: 'OLL', name: 'Kite' },
      { caseId: '16', set: 'OLL', name: 'Anti-Squeegee' },
      { caseId: '19', set: 'OLL', name: 'Bunny' },
      { caseId: '21', set: 'OLL', name: 'H / Double Sune' },
      { caseId: '29', set: 'OLL', name: 'Awkward Fish' },
      { caseId: '33', set: 'OLL', name: 'T shape' },
      { caseId: '34', set: 'OLL', name: 'C shape' },
      { caseId: '40', set: 'OLL', name: 'Lightning' },
      { caseId: '41', set: 'OLL', name: 'Awkward' },
      { caseId: '42', set: 'OLL', name: 'Awkward' },
      { caseId: '45', set: 'OLL', name: 'T shape' },
      { caseId: '48', set: 'OLL', name: 'L shape' },
      { caseId: '57', set: 'OLL', name: 'H / Checkerboard' },
    ],
  },
  {
    id: 'reverse-sexy-move',
    name: 'Reverse Sexy Move',
    notation: "U R U' R'",
    inverse: "R U R' U'",
    mirror: "U' L' U L",
    category: 'core',
    does: 'The exact inverse of the sexy move — undoes it move-for-move. Often the front half of an alg that ends in a sexy move.',
    fingerTrick: 'Sexy rhythm started on U: index pushes U, ring R, index U′, ring R′.',
    appearsIn: [
      { caseId: 'Nb', set: 'PLL', name: 'Nb Perm' },
      { caseId: '13', set: 'OLL', name: 'Gun' },
      { caseId: '20', set: 'OLL', name: 'Checkers' },
      { caseId: '28', set: 'OLL', name: 'Stealth' },
      { caseId: '31', set: 'OLL', name: 'P shape' },
      { caseId: '37', set: 'OLL', name: 'Fish' },
      { caseId: '38', set: 'OLL', name: 'W shape' },
      { caseId: '44', set: 'OLL', name: 'P shape' },
      { caseId: '51', set: 'OLL', name: 'I shape' },
      { caseId: '53', set: 'OLL', name: 'L shape' },
      { caseId: '54', set: 'OLL', name: 'L shape' },
      { caseId: '56', set: 'OLL', name: 'I shape' },
    ],
  },
  {
    id: 'lefty-sexy-move',
    name: 'Lefty Sexy Move',
    notation: "L' U' L U",
    inverse: "U' L' U L",
    mirror: "R U R' U'",
    category: 'core',
    does: 'Left-hand mirror of the sexy move — same effect on the left slot. Used in mirrored algs and when the left hand is more ergonomic.',
    fingerTrick: 'Left index flicks U/U′, left ring/middle do L and L′. Symmetric to the right-hand roll.',
  },
  {
    id: 'sledgehammer',
    name: 'Sledgehammer',
    notation: "R' F R F'",
    inverse: "F R' F' R",
    mirror: "L F' L' F",
    category: 'core',
    does: 'Inserts/swaps a pair using the F face — the other half of the "sexy/sledge" duo. Core to the fish OLLs.',
    fingerTrick: 'Left thumb pushes F, right hand R′/R, left F′. Push-pull across the F face; keep the cube still.',
    appearsIn: [
      { caseId: 'Y', set: 'PLL', name: 'Y Perm' },
      { caseId: '1', set: 'OLL', name: 'Runway' },
      { caseId: '10', set: 'OLL', name: 'Anti-Kite' },
      { caseId: '11', set: 'OLL', name: 'Downstairs' },
      { caseId: '17', set: 'OLL', name: 'Slash' },
      { caseId: '19', set: 'OLL', name: 'Bunny' },
      { caseId: '33', set: 'OLL', name: 'T shape' },
      { caseId: '34', set: 'OLL', name: 'C shape' },
      { caseId: '38', set: 'OLL', name: 'W shape' },
      { caseId: '46', set: 'OLL', name: 'C shape' },
    ],
  },
  {
    id: 'hedgeslammer',
    name: 'Hedgeslammer',
    notation: "F R' F' R",
    inverse: "R' F R F'",
    mirror: "F' L F L'",
    category: 'core',
    does: 'The reverse sledgehammer — same pieces, opposite direction. Opens algs that end in a sledge.',
    fingerTrick: 'Left thumb F, right hand R′/R, left F′ — mirror push-pull of the sledge.',
    appearsIn: [
      { caseId: 'Nb', set: 'PLL', name: 'Nb Perm' },
      { caseId: '37', set: 'OLL', name: 'Fish' },
    ],
  },
  {
    id: 'sune',
    name: 'Sune',
    notation: "R U R' U R U2 R'",
    inverse: "R U2 R' U' R U' R'",
    mirror: "L' U' L U' L' U2 L",
    category: 'core',
    does: 'Orients three corners (one already oriented) — the workhorse OCLL case (OLL 27) and the first 2-look corner alg. Its inverse is the Anti-Sune.',
    fingerTrick: 'Two RU pulls then a double U (R U2 R′). Right index double-flicks the U2.',
    appearsIn: [
      { caseId: '27', set: 'OLL', name: 'Sune' },
      { caseId: '41', set: 'OLL', name: 'Awkward' },
    ],
  },
  {
    id: 'anti-sune',
    name: 'Anti-Sune',
    notation: "R U2 R' U' R U' R'",
    inverse: "R U R' U R U2 R'",
    mirror: "L' U2 L U L' U L",
    category: 'core',
    does: 'The mirror corner-orientation case to Sune (OLL 26); orients the same corners the other way. The exact inverse of Sune.',
    fingerTrick: 'Lead with the U2 (R U2 R′), then two reverse-sexy-style pulls.',
    appearsIn: [{ caseId: '26', set: 'OLL', name: 'Anti-Sune' }],
  },
  {
    id: 'f2l-insert-right',
    name: 'Insert Pair (right)',
    notation: "R U R'",
    inverse: "R U' R'",
    mirror: "L' U' L",
    category: 'setup',
    does: 'Inserts a joined pair into the front-right slot (or extracts a corner). The atomic half of the sexy move and the most common F2L join.',
    fingerTrick: 'R, index flicks U, R′. One smooth roll; the U is a flick, not a regrip.',
  },
  {
    id: 'f2l-insert-right-inverse',
    name: 'Insert Pair (right, reverse)',
    notation: "R U' R'",
    inverse: "R U R'",
    mirror: "L' U L",
    category: 'setup',
    does: 'The opposite-direction right-slot insert/extract; pairs with R U R′ depending which way the pair goes in.',
    fingerTrick: 'R, index back-flicks U′, R′. Mirror rhythm of R U R′.',
  },
  {
    id: 'f2l-insert-left',
    name: 'Insert Pair (left)',
    notation: "L' U' L",
    inverse: "L' U L",
    mirror: "R U R'",
    category: 'setup',
    does: 'Left-hand mirror of R U R′ — inserts/extracts a pair in the front-left slot.',
    fingerTrick: "L′, left index flicks U′, L. Symmetric left-hand roll.",
  },
  {
    id: 'f2l-insert-left-inverse',
    name: 'Insert Pair (left, reverse)',
    notation: "L' U L",
    inverse: "L' U' L",
    mirror: "R U' R'",
    category: 'setup',
    does: 'Opposite-direction left-slot insert/extract; the left mirror of R U′ R′.',
    fingerTrick: "L′, left index flicks U (forward), L.",
  },
  {
    id: 'double-sexy',
    name: 'Double Sexy',
    notation: "R U R' U' R U R' U'",
    inverse: "U R U' R' U R U' R'",
    mirror: "L' U' L U L' U' L U",
    category: 'setup',
    does: 'Two sexy moves back to back — a recognizable super-chunk. Conjugated by F/F′ it forms common OLLs.',
    fingerTrick: 'The sexy roll done twice with no regrip — a continuous index-flick + R R′ cycle.',
  },
  {
    id: 'insertion-f-sexy-f',
    name: "F · Sexy · F'",
    notation: "F R U R' U' F'",
    inverse: "F U R U' R' F'",
    mirror: '',
    category: 'setup',
    does: 'A sexy move conjugated by F — "F, do a sexy, undo F." The canonical edge-orienting insertion; it IS the 2-look "Line" cross case.',
    fingerTrick: 'Left thumb pushes F, do one sexy, left thumb pulls F′.',
  },
  {
    id: 'wide-sexy-conjugate',
    name: "f · Sexy · f'",
    notation: "f R U R' U' f'",
    inverse: "f U R U' R' f'",
    mirror: '',
    category: 'wide',
    does: 'The F·sexy·F′ insertion done with the wide f move so it affects an extra slice — the 2-look "L-shape" cross case.',
    fingerTrick: 'Same as F·sexy·F′ but the F turns are wide (two layers).',
  },
]

export interface DecompStep {
  /** A trigger id (resolves to its name) or a structural label like "conjugate". */
  label: string
  notation: string
}

export interface Decomposition {
  steps: DecompStep[]
  /** True when the steps are recognizable triggers; false for M-slice algs with no R/U/F structure. */
  exactMatch: boolean
  /** Short teaching note, e.g. "F · sexy · F'". */
  note: string
}

/** Decompositions for the 2-look set, keyed `${set}:${caseId}`. */
export const DECOMPOSITIONS: Record<string, Decomposition> = {
  'OLL:2L-Line': {
    steps: [
      { label: 'conjugate', notation: 'F' },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'conjugate', notation: "F'" },
    ],
    exactMatch: true,
    note: "F · sexy · F' — one sexy move conjugated by F.",
  },
  'OLL:2L-L': {
    steps: [
      { label: 'conjugate', notation: 'f' },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'conjugate', notation: "f'" },
    ],
    exactMatch: true,
    note: "f · sexy · f' — the Line case, conjugated by the wide f.",
  },
  'OLL:2L-Dot': {
    steps: [
      { label: 'conjugate', notation: 'F' },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'conjugate', notation: "F'" },
      { label: 'conjugate', notation: 'f' },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'conjugate', notation: "f'" },
    ],
    exactMatch: true,
    note: 'Line then L-shape back to back — two conjugated sexy moves.',
  },
  'OLL:27': {
    steps: [{ label: 'sune', notation: "R U R' U R U2 R'" }],
    exactMatch: true,
    note: 'The Sune itself — a single named trigger.',
  },
  'OLL:26': {
    steps: [{ label: 'anti-sune', notation: "R U2 R' U' R U' R'" }],
    exactMatch: true,
    note: 'The Anti-Sune itself — a single named trigger.',
  },
  'OLL:21': {
    steps: [
      { label: 'setup', notation: "R U2 R' U'" },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'f2l-insert-right-inverse', notation: "R U' R'" },
    ],
    exactMatch: true,
    note: 'Double-Sune H-case — R U2 R′ U′, then a sexy move, then R U′ R′.',
  },
  'OLL:24': {
    steps: [
      { label: 'wide', notation: "r U R' U' r'" },
      { label: 'insert', notation: "F R F'" },
    ],
    exactMatch: true,
    note: 'A wide sexy-style block (r U R′ U′ r′), then F R F′.',
  },
  'OLL:25': {
    steps: [
      { label: 'conjugate', notation: "F'" },
      { label: 'wide', notation: "r U R' U' r'" },
      { label: 'conjugate', notation: 'F R' },
    ],
    exactMatch: true,
    note: "F' · (r U R' U' r') · F R — the OLL 24 block conjugated by F'.",
  },
  'PLL:2L-Headlights': {
    steps: [
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'T-perm body', notation: "R' F R2 U' R' U' R U R' F'" },
    ],
    exactMatch: true,
    note: 'T-perm — opens with a sexy move, then the F-conjugated R2 body.',
  },
  'PLL:2L-Diagonal': {
    steps: [
      { label: 'conjugate', notation: 'F' },
      { label: 'body', notation: "R U' R' U' R U R'" },
      { label: 'conjugate', notation: "F'" },
      { label: 'sexy-move', notation: "R U R' U'" },
      { label: 'sledgehammer', notation: "R' F R F'" },
    ],
    exactMatch: true,
    note: "Y-perm — F · body · F', then it ends with sexy + sledge.",
  },
  'PLL:Ua': {
    steps: [{ label: 'M-slice', notation: "M2 U M U2 M' U M2" }],
    exactMatch: false,
    note: 'M-slice edge cycle — pure M/U moves, no R/U/F trigger structure. Learn as one unit.',
  },
  'PLL:Ub': {
    steps: [{ label: 'M-slice', notation: "M2 U' M U2 M' U' M2" }],
    exactMatch: false,
    note: 'M-slice edge cycle (mirror of Ua). Learn as one unit.',
  },
  'PLL:H': {
    steps: [{ label: 'M-slice', notation: 'M2 U M2 U2 M2 U M2' }],
    exactMatch: false,
    note: 'M-slice opposite-edge swap — all M2/U. Learn as one unit.',
  },
  'PLL:Z': {
    steps: [{ label: 'M-slice', notation: "M2 U M2 U M' U2 M2 U2 M' U2" }],
    exactMatch: false,
    note: 'M-slice adjacent-edge swap — pure M/U. Learn as one unit.',
  },
}

const TRIGGER_BY_ID: Record<string, Trigger> = Object.fromEntries(
  TRIGGERS.map((t) => [t.id, t]),
)

export function triggerById(id: string): Trigger | undefined {
  return TRIGGER_BY_ID[id]
}

export function decompositionFor(set: AlgSet, id: string): Decomposition | undefined {
  return DECOMPOSITIONS[`${set}:${id}`]
}
