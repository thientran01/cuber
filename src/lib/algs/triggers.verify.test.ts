import { describe, expect, it } from 'vitest'
import { ALL_CASES, type AlgCase } from './cases'
import { twoLookCases } from './twoLook'
import { DECOMPOSITIONS, TRIGGERS, triggerById } from './triggers'
import { caseStateAlg } from '@/lib/cube/setupScramble'

const norm = (s: string) => s.trim().replace(/\s+/g, ' ')

// Every case referenced by a trigger/decomposition, keyed `${set}:${id}`.
const ALG: Record<string, string> = {}
for (const c of [...ALL_CASES, ...twoLookCases('OLL'), ...twoLookCases('PLL')] as AlgCase[]) {
  ALG[`${c.set}:${c.id}`] = c.algorithm
}

describe('triggers dataset', () => {
  it('each trigger inverse is the true move-inverse of its notation', () => {
    // This is the guard that catches a bad "self-inverse": F R U R' U' F' is NOT
    // its own inverse — the move-inverse is F U R U' R' F'.
    for (const t of TRIGGERS) {
      expect(norm(caseStateAlg(t.notation)), `${t.id} inverse`).toBe(norm(t.inverse))
    }
  })

  it('each appearsIn case actually contains the trigger notation verbatim', () => {
    for (const t of TRIGGERS) {
      for (const u of t.appearsIn ?? []) {
        const alg = ALG[`${u.set}:${u.caseId}`]
        expect(alg, `case ${u.set}:${u.caseId} exists`).toBeDefined()
        expect(norm(alg), `${t.id} in ${u.set} ${u.caseId}`).toContain(norm(t.notation))
      }
    }
  })
})

describe('2-look decompositions', () => {
  it('every decomposition concatenates back to its case algorithm exactly', () => {
    for (const [key, d] of Object.entries(DECOMPOSITIONS)) {
      const alg = ALG[key]
      expect(alg, `case ${key} exists`).toBeDefined()
      const concat = d.steps.map((s) => s.notation).join(' ')
      expect(norm(concat), `decomposition ${key}`).toBe(norm(alg))
    }
  })

  it('any step labeled with a trigger id matches that trigger exactly', () => {
    // Guards against an accent pill claiming a chunk IS a trigger when its
    // notation differs (e.g. labeling "F R F'" as the sledgehammer "R' F R F'").
    for (const [key, d] of Object.entries(DECOMPOSITIONS)) {
      for (const s of d.steps) {
        const t = triggerById(s.label)
        if (t) expect(norm(s.notation), `${key} step "${s.label}"`).toBe(norm(t.notation))
      }
    }
  })

  it('flags M-slice edge perms as having no trigger structure', () => {
    for (const id of ['PLL:Ua', 'PLL:Ub', 'PLL:H', 'PLL:Z']) {
      expect(DECOMPOSITIONS[id].exactMatch, id).toBe(false)
    }
  })
})
