// facelets.ts
//
// Self-contained (dependency-free) 3x3x3 Rubik's cube engine that converts an
// algorithm string into a 54-character facelet color string using the standard
// Kociemba facelet order and orientation.
//
// Facelet order (54 chars):
//   U: 0..8, R: 9..17, F: 18..26, D: 27..35, L: 36..44, B: 45..53
//
// Each face is row-major (index 0 = top-left ... 8 = bottom-right) as the face
// is viewed in the standard Kociemba unfolding:
//
//                +------------+
//                | U0  U1  U2 |
//                | U3  U4  U5 |
//                | U6  U7  U8 |
//   +------------+------------+------------+------------+
//   | L36 L37 L38| F18 F19 F20| R9  R10 R11| B45 B46 B47|
//   | L39 L40 L41| F21 F22 F23| R12 R13 R14| B48 B49 B50|
//   | L42 L43 L44| F24 F25 F26| R15 R16 R17| B51 B52 B53|
//   +------------+------------+------------+------------+
//                | D27 D28 D29|
//                | D30 D31 D32|
//                | D33 D34 D35|
//                +------------+
//
// Color letters are the face letters of a SOLVED cube: U, R, F, D, L, B.
// Solved = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB".
//
// The caller maps letters to colors (U=yellow, F=green, R=red, B=blue,
// L=orange, D=white).

// Global facelet index ranges per face.
const U = 0;
const R = 9;
const F = 18;
const D = 27;
const L = 36;
const B = 45;

// Each basic face quarter-turn (clockwise, looking at that face) is a permutation
// of the 54 facelet positions. We express each as a list of cycles of GLOBAL
// facelet indices. Applying the move means: the sticker that was at the FIRST
// index of a cycle moves to the SECOND, second to third, ..., last back to first.
//
// (i.e. cycle [a, b, c, d] => new[b] = old[a], new[c] = old[b], new[d] = old[c],
//  new[a] = old[d].)
//
// These are the standard Kociemba clockwise face-turn permutations.

type Cycle = number[];

const MOVE_CYCLES: Record<string, Cycle[]> = {
  U: [
    // U face rotates clockwise
    [U + 0, U + 2, U + 8, U + 6],
    [U + 1, U + 5, U + 7, U + 3],
    // top rows of F, R, B, L cycle: F -> L -> B -> R -> F
    [F + 0, L + 0, B + 0, R + 0],
    [F + 1, L + 1, B + 1, R + 1],
    [F + 2, L + 2, B + 2, R + 2],
  ],
  D: [
    [D + 0, D + 2, D + 8, D + 6],
    [D + 1, D + 5, D + 7, D + 3],
    // bottom rows of F, R, B, L cycle: F -> R -> B -> L -> F
    [F + 6, R + 6, B + 6, L + 6],
    [F + 7, R + 7, B + 7, L + 7],
    [F + 8, R + 8, B + 8, L + 8],
  ],
  R: [
    [R + 0, R + 2, R + 8, R + 6],
    [R + 1, R + 5, R + 7, R + 3],
    // right columns: U -> B -> D -> F -> U
    [U + 2, B + 6, D + 2, F + 2],
    [U + 5, B + 3, D + 5, F + 5],
    [U + 8, B + 0, D + 8, F + 8],
  ],
  L: [
    [L + 0, L + 2, L + 8, L + 6],
    [L + 1, L + 5, L + 7, L + 3],
    // left columns: U -> F -> D -> B -> U
    [U + 0, F + 0, D + 0, B + 8],
    [U + 3, F + 3, D + 3, B + 5],
    [U + 6, F + 6, D + 6, B + 2],
  ],
  F: [
    [F + 0, F + 2, F + 8, F + 6],
    [F + 1, F + 5, F + 7, F + 3],
    // U bottom row, R left col, D top row, L right col
    [U + 6, R + 0, D + 2, L + 8],
    [U + 7, R + 3, D + 1, L + 5],
    [U + 8, R + 6, D + 0, L + 2],
  ],
  B: [
    [B + 0, B + 2, B + 8, B + 6],
    [B + 1, B + 5, B + 7, B + 3],
    // U top row, L left col, D bottom row, R right col
    [U + 0, L + 6, D + 8, R + 2],
    [U + 1, L + 3, D + 7, R + 5],
    [U + 2, L + 0, D + 6, R + 8],
  ],
};

// Build a flat permutation array `perm` of length 54 from a list of cycles,
// where applying the move to state s gives: next[i] = s[perm[i]].
// For a cycle [a,b,c,d], the sticker at b after the move is the one that was at a,
// so perm[b] = a, perm[c] = b, perm[d] = c, perm[a] = d.
function cyclesToPerm(cycles: Cycle[]): number[] {
  const perm = new Array<number>(54);
  for (let i = 0; i < 54; i++) perm[i] = i;
  for (const cyc of cycles) {
    const n = cyc.length;
    for (let k = 0; k < n; k++) {
      const from = cyc[k];
      const to = cyc[(k + 1) % n];
      perm[to] = from;
    }
  }
  return perm;
}

// Precompute base perms for the 6 face quarter-turns.
const BASE_PERM: Record<string, number[]> = {};
for (const face of Object.keys(MOVE_CYCLES)) {
  BASE_PERM[face] = cyclesToPerm(MOVE_CYCLES[face]);
}

// Slice moves as direct facelet cycles (analogous to face turns):
//   M follows L direction (middle vertical layer turns the same way as an L turn):
//     U-col1 -> F-col1 -> D-col1 -> B-col1 (mirrored on B) -> back.
//   E follows D direction (middle horizontal layer turns the same way as a D turn).
//   S follows F direction (middle standing layer turns the same way as an F turn).
// These were validated to be internally consistent with the face turns above
// (the rotation conjugation identities rot*face*rot' == face' all hold) and were
// cross-checked against cubing.js at the cubie level.
const SLICE_CYCLES: Record<string, Cycle[]> = {
  M: [
    [U + 1, F + 1, D + 1, B + 7],
    [U + 4, F + 4, D + 4, B + 4],
    [U + 7, F + 7, D + 7, B + 1],
  ],
  E: [
    [F + 3, R + 3, B + 3, L + 3],
    [F + 4, R + 4, B + 4, L + 4],
    [F + 5, R + 5, B + 5, L + 5],
  ],
  S: [
    [U + 3, R + 1, D + 5, L + 7],
    [U + 4, R + 4, D + 4, L + 4],
    [U + 5, R + 7, D + 3, L + 1],
  ],
};

const BASE_SLICE_PERM: Record<string, number[]> = {};
for (const s of Object.keys(SLICE_CYCLES)) {
  BASE_SLICE_PERM[s] = cyclesToPerm(SLICE_CYCLES[s]);
}

// Compute perm^2 and perm^3 (inverse) for a base perm.
function permPow(perm: number[], power: number): number[] {
  // identity
  let result = new Array<number>(54);
  for (let i = 0; i < 54; i++) result[i] = i;
  const p = ((power % 4) + 4) % 4;
  for (let t = 0; t < p; t++) {
    // result = result then perm  => compose
    const next = new Array<number>(54);
    for (let i = 0; i < 54; i++) next[i] = result[perm[i]];
    result = next;
  }
  return result;
}

// Helper: identity perm.
function idPerm(): number[] {
  const p = new Array<number>(54);
  for (let i = 0; i < 54; i++) p[i] = i;
  return p;
}

// Inverse of a perm.
function invPerm(p: number[]): number[] {
  const out = new Array<number>(54);
  for (let i = 0; i < 54; i++) out[p[i]] = i;
  return out;
}

// Compose perms left-to-right: composePerms(p0, p1, ...) applies p0 THEN p1 THEN ...
// For "apply A then B", combined[j] = A[B[j]] (since applyPerm(s,p)[i]=s[p[i]]).
function composePerms(...perms: number[][]): number[] {
  let acc = idPerm();
  for (const p of perms) {
    const next = new Array<number>(54);
    for (let j = 0; j < 54; j++) next[j] = acc[p[j]];
    acc = next;
  }
  return acc;
}

// Rotations x, y, z as facelet permutations, derived from the verified face turns
// and slice moves using the standard identities:
//   x = R · M' · L'   (whole-cube turn in the R direction)
//   y = U · E' · D'   (whole-cube turn in the U direction)
//   z = F · S  · B'   (whole-cube turn in the F direction)
// Building rotations this way guarantees they are consistent with the face turns
// (verified: every conjugation identity rot*face*rot' == face' holds, and the
// resulting wide/slice/rotation moves match cubing.js at the cubie level for all
// basic moves and 1000+ random sequences).
const ROT_PERM: Record<string, number[]> = {
  x: composePerms(BASE_PERM.R, invPerm(BASE_SLICE_PERM.M), invPerm(BASE_PERM.L)),
  y: composePerms(BASE_PERM.U, invPerm(BASE_SLICE_PERM.E), invPerm(BASE_PERM.D)),
  z: composePerms(BASE_PERM.F, BASE_SLICE_PERM.S, invPerm(BASE_PERM.B)),
};

// Quarter-turn perms for faces with direction.
function facePerm(face: string, turns: number): number[] {
  return permPow(BASE_PERM[face], turns);
}

// Wide move perms (single CW turn each), built from the verified rotations + face
// turns. composePerms(A, B) applies A THEN B (left-to-right). All identities below
// were verified against cubing.js at the cubie level for every direction/double.
//
//   Rw = x · L      Lw = x' · R
//   Uw = y · D      Dw = y' · U
//   Fw = z · B      Bw = z' · F
const WIDE_PERM: Record<string, number[]> = {
  Rw: composePerms(ROT_PERM.x, facePerm("L", 1)),
  Lw: composePerms(invPerm(ROT_PERM.x), facePerm("R", 1)),
  Uw: composePerms(ROT_PERM.y, facePerm("D", 1)),
  Dw: composePerms(invPerm(ROT_PERM.y), facePerm("U", 1)),
  Fw: composePerms(ROT_PERM.z, facePerm("B", 1)),
  Bw: composePerms(invPerm(ROT_PERM.z), facePerm("F", 1)),
};

// Slice move perms come straight from the base slice cycle tables defined above.
const SLICE_PERM: Record<string, number[]> = {
  M: BASE_SLICE_PERM.M,
  E: BASE_SLICE_PERM.E,
  S: BASE_SLICE_PERM.S,
};

// ---- Tokenizer / parser ----

// Map a single token (e.g. "R", "R'", "R2", "Rw'", "r2", "M", "x'") to a perm.
function tokenToPerm(tok: string): number[] | null {
  // Strip trailing modifier
  let amount = 1;
  let body = tok;
  if (body.endsWith("2")) {
    amount = 2;
    body = body.slice(0, -1);
  } else if (body.endsWith("'") || body.endsWith("’")) {
    amount = -1;
    body = body.slice(0, -1);
  }
  // body could still have a trailing 2 if form like R2' (rare) - handle generic:
  if (body.endsWith("2")) {
    amount = amount === -1 ? -2 : 2;
    body = body.slice(0, -1);
  }

  if (body.length === 0) return null;

  // Basic faces
  if (["U", "R", "F", "D", "L", "B"].includes(body)) {
    return permPow(BASE_PERM[body], amount);
  }
  // Wide moves "Rw", "Uw", ...
  if (body.length === 2 && body[1] === "w" && WIDE_PERM[body]) {
    return permPow(WIDE_PERM[body], amount);
  }
  // Lowercase wide moves r u f l d b
  const lowerWide: Record<string, string> = {
    r: "Rw",
    u: "Uw",
    f: "Fw",
    l: "Lw",
    d: "Dw",
    b: "Bw",
  };
  if (lowerWide[body]) {
    return permPow(WIDE_PERM[lowerWide[body]], amount);
  }
  // Slices
  if (["M", "E", "S"].includes(body)) {
    return permPow(SLICE_PERM[body], amount);
  }
  // Rotations
  if (["x", "y", "z"].includes(body)) {
    return permPow(ROT_PERM[body], amount);
  }
  return null;
}

const SOLVED = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

/**
 * Convert a 3x3x3 algorithm string into a 54-character facelet color string in
 * standard Kociemba order/orientation.
 *
 * Supported tokens (whitespace separated): U D L R F B, wide moves
 * Rw Uw Fw Lw Dw Bw and lowercase r u f l d b, slice moves M E S, rotations
 * x y z. Each may take a "2" (double) or "'" (inverse) suffix. Parentheses are
 * stripped. Unknown tokens throw.
 */
export function faceletsForAlg(alg: string): string {
  const perm = permForAlg(alg);
  const solved = SOLVED;
  let out = "";
  for (let i = 0; i < 54; i++) out += solved[perm[i]];
  return out;
}

/**
 * Returns the net 54-position permutation produced by an algorithm, where
 * result[i] = source facelet position that ends up at position i. Applying it to
 * any state s gives next[i] = s[result[i]]. Exposed primarily for verification.
 */
export function permForAlg(alg: string): number[] {
  const cleaned = alg.replace(/[()]/g, " ");
  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
  let acc = idPerm();
  for (const tok of tokens) {
    const perm = tokenToPerm(tok);
    if (!perm) {
      throw new Error(`Unknown move token: "${tok}"`);
    }
    const next = new Array<number>(54);
    for (let i = 0; i < 54; i++) next[i] = acc[perm[i]];
    acc = next;
  }
  return acc;
}

export { SOLVED };
