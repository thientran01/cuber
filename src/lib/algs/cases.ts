/**
 * OLL (57) + PLL (21) algorithm dataset for the CFOP trainer.
 *
 * Algorithms are standard speedsolving algs. Correctness is enforced by
 * `cases.verify.test.ts`, which uses cubing.js to check that every alg only
 * disturbs the last layer and that all cases are distinct. Each case's
 * recognition diagram is rendered from its own algorithm, so the diagram always
 * matches what the algorithm solves.
 */
export type AlgSet = 'OLL' | 'PLL'

export interface AlgCase {
  id: string
  set: AlgSet
  name: string
  group: string
  algorithm: string
  probability: string
}

export const PLL_CASES: AlgCase[] = [
  { id: 'Aa', set: 'PLL', name: 'Aa Perm', group: 'corners-only', algorithm: "x L2 D2 L' U' L D2 L' U L'", probability: '1/18' },
  { id: 'Ab', set: 'PLL', name: 'Ab Perm', group: 'corners-only', algorithm: "x R2 D2 R U R' D2 R U' R", probability: '1/18' },
  { id: 'E', set: 'PLL', name: 'E Perm', group: 'corners-only', algorithm: "x' L' U L D' L' U' L D L' U' L D' L' U L D", probability: '1/36' },
  { id: 'F', set: 'PLL', name: 'F Perm', group: 'adjacent-corner-swap', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", probability: '1/18' },
  { id: 'Ga', set: 'PLL', name: 'Ga Perm', group: 'adjacent-corner-swap', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'", probability: '1/18' },
  { id: 'Gb', set: 'PLL', name: 'Gb Perm', group: 'adjacent-corner-swap', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D", probability: '1/18' },
  { id: 'Gc', set: 'PLL', name: 'Gc Perm', group: 'adjacent-corner-swap', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D", probability: '1/18' },
  { id: 'Gd', set: 'PLL', name: 'Gd Perm', group: 'adjacent-corner-swap', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'", probability: '1/18' },
  { id: 'H', set: 'PLL', name: 'H Perm', group: 'edges-only', algorithm: 'M2 U M2 U2 M2 U M2', probability: '1/72' },
  { id: 'Ja', set: 'PLL', name: 'Ja Perm', group: 'adjacent-corner-swap', algorithm: "x R2 F R F' R U2 r' U r U2", probability: '1/18' },
  { id: 'Jb', set: 'PLL', name: 'Jb Perm', group: 'adjacent-corner-swap', algorithm: "R U R' F' R U R' U' R' F R2 U' R' U'", probability: '1/18' },
  { id: 'Na', set: 'PLL', name: 'Na Perm', group: 'diagonal-corner-swap', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", probability: '1/36' },
  { id: 'Nb', set: 'PLL', name: 'Nb Perm', group: 'diagonal-corner-swap', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R", probability: '1/36' },
  { id: 'Ra', set: 'PLL', name: 'Ra Perm', group: 'adjacent-corner-swap', algorithm: "R U' R' U' R U R D R' U' R D' R' U2 R'", probability: '1/18' },
  { id: 'Rb', set: 'PLL', name: 'Rb Perm', group: 'adjacent-corner-swap', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2", probability: '1/18' },
  { id: 'T', set: 'PLL', name: 'T Perm', group: 'adjacent-corner-swap', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", probability: '1/18' },
  { id: 'Ua', set: 'PLL', name: 'Ua Perm', group: 'edges-only', algorithm: "M2 U M U2 M' U M2", probability: '1/18' },
  { id: 'Ub', set: 'PLL', name: 'Ub Perm', group: 'edges-only', algorithm: "M2 U' M U2 M' U' M2", probability: '1/18' },
  { id: 'V', set: 'PLL', name: 'V Perm', group: 'diagonal-corner-swap', algorithm: "R' U R' U' y R' F' R2 U' R' U R' F R F", probability: '1/18' },
  { id: 'Y', set: 'PLL', name: 'Y Perm', group: 'diagonal-corner-swap', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", probability: '1/18' },
  { id: 'Z', set: 'PLL', name: 'Z Perm', group: 'edges-only', algorithm: "M' U M2 U M2 U M' U2 M2", probability: '1/36' },
]

export const OLL_CASES: AlgCase[] = [
  { id: '1', set: 'OLL', name: 'Runway', group: 'dot', algorithm: "R U2 R2 F R F' U2 R' F R F'", probability: '1/108' },
  { id: '2', set: 'OLL', name: 'Zamboni', group: 'dot', algorithm: "r U r' U2 r U2 R' U2 R U' r'", probability: '1/108' },
  { id: '3', set: 'OLL', name: 'Anti-Mounted Fish', group: 'dot', algorithm: "r' R2 U R' U r U2 r' U M'", probability: '1/108' },
  { id: '4', set: 'OLL', name: 'Mounted Fish', group: 'dot', algorithm: "M U' r U2 r' U' R U' R' M'", probability: '1/108' },
  { id: '5', set: 'OLL', name: 'Loud Mouth', group: 'square', algorithm: "r' U2 R U R' U r", probability: '1/54' },
  { id: '6', set: 'OLL', name: 'Big Lightning', group: 'square', algorithm: "r U2 R' U' R U' r'", probability: '1/54' },
  { id: '7', set: 'OLL', name: 'Mounted Lightning', group: 'lightning bolt', algorithm: "r U R' U R U2 r'", probability: '1/54' },
  { id: '8', set: 'OLL', name: 'Frying Pan', group: 'lightning bolt', algorithm: "r' U' R U' R' U2 r", probability: '1/54' },
  { id: '9', set: 'OLL', name: 'Kite', group: 'fish', algorithm: "R U R' U' R' F R2 U R' U' F'", probability: '1/54' },
  { id: '10', set: 'OLL', name: 'Anti-Kite', group: 'fish', algorithm: "R U R' U R' F R F' R U2 R'", probability: '1/54' },
  { id: '11', set: 'OLL', name: 'Downstairs', group: 'lightning bolt', algorithm: "r U R' U R' F R F' R U2 r'", probability: '1/54' },
  { id: '12', set: 'OLL', name: 'Upstairs', group: 'lightning bolt', algorithm: "M' R' U' R U' R' U2 R U' R r'", probability: '1/54' },
  { id: '13', set: 'OLL', name: 'Gun', group: 'knight', algorithm: "F U R U' R2 F' R U R U' R'", probability: '1/54' },
  { id: '14', set: 'OLL', name: 'Anti-Gun', group: 'knight', algorithm: "R' F R U R' F' R F U' F'", probability: '1/54' },
  { id: '15', set: 'OLL', name: 'Squeegee', group: 'knight', algorithm: "r' U' r R' U' R U r' U r", probability: '1/54' },
  { id: '16', set: 'OLL', name: 'Anti-Squeegee', group: 'knight', algorithm: "r U r' R U R' U' r U' r'", probability: '1/54' },
  { id: '17', set: 'OLL', name: 'Slash', group: 'dot', algorithm: "R U R' U R' F R F' U2 R' F R F'", probability: '1/54' },
  { id: '18', set: 'OLL', name: 'Crown', group: 'dot', algorithm: "r U R' U R U2 r' r' U' R U' R' U2 r", probability: '1/54' },
  { id: '19', set: 'OLL', name: 'Bunny', group: 'dot', algorithm: "r' R U R U R' U' M' R' F R F'", probability: '1/54' },
  { id: '20', set: 'OLL', name: 'Checkers', group: 'dot', algorithm: "r U R' U' M2 U R U' R' U' M'", probability: '1/54' },
  { id: '21', set: 'OLL', name: 'H / Double Sune', group: 'cross', algorithm: "R U2 R' U' R U R' U' R U' R'", probability: '1/54' },
  { id: '22', set: 'OLL', name: 'Pi', group: 'cross', algorithm: "R U2 R2 U' R2 U' R2 U2 R", probability: '1/54' },
  { id: '23', set: 'OLL', name: 'Headlights', group: 'cross', algorithm: "R2 D R' U2 R D' R' U2 R'", probability: '1/54' },
  { id: '24', set: 'OLL', name: 'T', group: 'cross', algorithm: "r U R' U' r' F R F'", probability: '1/54' },
  { id: '25', set: 'OLL', name: 'Bowtie', group: 'cross', algorithm: "F' r U R' U' r' F R", probability: '1/54' },
  { id: '26', set: 'OLL', name: 'Anti-Sune', group: 'cross', algorithm: "R U2 R' U' R U' R'", probability: '1/54' },
  { id: '27', set: 'OLL', name: 'Sune', group: 'cross', algorithm: "R U R' U R U2 R'", probability: '1/54' },
  { id: '28', set: 'OLL', name: 'Stealth', group: 'cross', algorithm: "r U R' U' r' R U R U' R'", probability: '1/54' },
  { id: '29', set: 'OLL', name: 'Awkward Fish', group: 'knight', algorithm: "R U R' U' R U' R' F' U' F R U R'", probability: '1/54' },
  { id: '30', set: 'OLL', name: 'Square', group: 'square', algorithm: "F R' F R2 U' R' U' R U R' F2", probability: '1/54' },
  { id: '31', set: 'OLL', name: 'P shape', group: 'P shape', algorithm: "R' U' F U R U' R' F' R", probability: '1/54' },
  { id: '32', set: 'OLL', name: 'P shape', group: 'P shape', algorithm: "L U F' U' L' U L F L'", probability: '1/54' },
  { id: '33', set: 'OLL', name: 'T shape', group: 'T shape', algorithm: "R U R' U' R' F R F'", probability: '1/54' },
  { id: '34', set: 'OLL', name: 'C shape', group: 'C shape', algorithm: "R U R' U' B' R' F R F' B", probability: '1/54' },
  { id: '35', set: 'OLL', name: 'Fish', group: 'fish', algorithm: "R U2 R2 F R F' R U2 R'", probability: '1/54' },
  { id: '36', set: 'OLL', name: 'W shape', group: 'W shape', algorithm: "L' U' L U' L' U L U L F' L' F", probability: '1/54' },
  { id: '37', set: 'OLL', name: 'Fish', group: 'fish', algorithm: "F R' F' R U R U' R'", probability: '1/54' },
  { id: '38', set: 'OLL', name: 'W shape', group: 'W shape', algorithm: "R U R' U R U' R' U' R' F R F'", probability: '1/54' },
  { id: '39', set: 'OLL', name: 'Lightning', group: 'lightning bolt', algorithm: "L F' L' U' L U F U' L'", probability: '1/54' },
  { id: '40', set: 'OLL', name: 'Lightning', group: 'lightning bolt', algorithm: "R' F R U R' U' F' U R", probability: '1/54' },
  { id: '41', set: 'OLL', name: 'Awkward', group: 'knight', algorithm: "R U R' U R U2 R' F R U R' U' F'", probability: '1/54' },
  { id: '42', set: 'OLL', name: 'Awkward', group: 'knight', algorithm: "R' U' R U' R' U2 R F R U R' U' F'", probability: '1/54' },
  { id: '43', set: 'OLL', name: 'P shape', group: 'P shape', algorithm: "F' U' L' U L F", probability: '1/54' },
  { id: '44', set: 'OLL', name: 'P shape', group: 'P shape', algorithm: "F U R U' R' F'", probability: '1/54' },
  { id: '45', set: 'OLL', name: 'T shape', group: 'T shape', algorithm: "F R U R' U' F'", probability: '1/54' },
  { id: '46', set: 'OLL', name: 'C shape', group: 'C shape', algorithm: "R' U' R' F R F' U R", probability: '1/54' },
  { id: '47', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "F' L' U' L U L' U' L U F", probability: '1/54' },
  { id: '48', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "F R U R' U' R U R' U' F'", probability: '1/54' },
  { id: '49', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "r U' r2 U r2 U r2 U' r", probability: '1/54' },
  { id: '50', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "r' U r2 U' r2 U' r2 U r'", probability: '1/54' },
  { id: '51', set: 'OLL', name: 'I shape', group: 'I shape', algorithm: "F U R U' R' U R U' R' F'", probability: '1/54' },
  { id: '52', set: 'OLL', name: 'I shape', group: 'I shape', algorithm: "R U R' U R U' B U' B' R'", probability: '1/54' },
  { id: '53', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "r' U' R U' R' U R U' R' U2 r", probability: '1/54' },
  { id: '54', set: 'OLL', name: 'L shape', group: 'L shape', algorithm: "r U R' U R U' R' U R U2 r'", probability: '1/54' },
  { id: '55', set: 'OLL', name: 'I shape', group: 'I shape', algorithm: "R U2 R2 U' R U' R' U2 F R F'", probability: '1/54' },
  { id: '56', set: 'OLL', name: 'I shape', group: 'I shape', algorithm: "r U r' U R U' R' U R U' R' r U' r'", probability: '1/54' },
  { id: '57', set: 'OLL', name: 'H / Checkerboard', group: 'cross', algorithm: "R U R' U' M' U R U' r'", probability: '1/54' },
]

export const ALL_CASES: AlgCase[] = [...OLL_CASES, ...PLL_CASES]

export type CaseStatus = 'unknown' | 'learning' | 'learned'

export interface CaseProgress {
  status: CaseStatus
  /** Best recognition time in ms (recognition trainer), or null. */
  bestRecognitionMs: number | null
  reps: number
}
