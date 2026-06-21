import { describe, expect, it } from 'vitest'
import type { Penalty, Solve } from '@/lib/types'
import {
  average,
  bestAverage,
  bestSingle,
  currentAverage,
  mean,
  sessionMean,
  trimCount,
} from './averages'

let counter = 0
/** Build a solve from a raw time (ms) + optional penalty. */
function s(timeMs: number, penalty: Penalty = 'none'): Solve {
  counter += 1
  return {
    id: String(counter),
    sessionId: 'sess',
    timeMs,
    penalty,
    scramble: '',
    event: '333',
    createdAt: counter,
  }
}
const dnf = () => s(0, 'dnf')

describe('bestSingle', () => {
  it('returns the lowest effective time, ignoring DNFs', () => {
    expect(bestSingle([s(12000), s(9000), s(15000)])).toBe(9000)
    expect(bestSingle([s(12000), dnf(), s(8000)])).toBe(8000)
  })
  it('applies +2', () => {
    expect(bestSingle([s(9000, 'plus2'), s(10000)])).toBe(10000) // 9000+2000 = 11000 > 10000
  })
  it('is null when every solve is a DNF', () => {
    expect(bestSingle([dnf(), dnf()])).toBeNull()
  })
})

describe('mean (mo3 semantics)', () => {
  it('is a plain mean with no trim', () => {
    expect(mean([s(10000), s(12000), s(14000)])).toBe(12000)
  })
  it('is DNF (null) if ANY solve is a DNF', () => {
    expect(mean([s(10000), dnf(), s(14000)])).toBeNull()
  })
  it('counts +2 in the effective time', () => {
    // effective: 12000, 12000, 14000 -> mean 12666.67
    expect(mean([s(10000, 'plus2'), s(12000), s(14000)])).toBeCloseTo((12000 + 12000 + 14000) / 3, 5)
  })
})

describe('trimCount', () => {
  it('matches ceil(N * 0.05)', () => {
    expect(trimCount(5)).toBe(1)
    expect(trimCount(12)).toBe(1)
    expect(trimCount(50)).toBe(3)
    expect(trimCount(100)).toBe(5)
  })
})

describe('average (aoN)', () => {
  it('matches the WCA worked example: 15.57 16.53 (14.97) 15.38 (DNF) is valid', () => {
    const a = average([s(15570), s(16530), s(14970), s(15380), dnf()])
    // drops best 14.97 and worst (DNF); mean of 15.38, 15.57, 16.53
    expect(a).toBeCloseTo((15380 + 15570 + 16530) / 3, 5)
  })
  it('is DNF (null) when two solves are DNF: (DNF) 16.53 (14.97) 15.38 (DNF)', () => {
    expect(average([dnf(), s(16530), s(14970), s(15380), dnf()])).toBeNull()
  })
  it('tolerates exactly one DNF in an ao5 (trimmed as the worst)', () => {
    expect(average([s(10000), s(11000), s(12000), s(13000), dnf()])).toBeCloseTo(
      (11000 + 12000 + 13000) / 3,
      5,
    )
  })
  it('applies +2 inside the average', () => {
    // 10.00+2 = 12.00 becomes the worst and is trimmed; middle three are 11,11,11.5? build explicitly
    const a = average([s(10000, 'plus2'), s(11000), s(11000), s(11500), s(9000)])
    // effective: 12000,11000,11000,11500,9000 -> sorted 9000,11000,11000,11500,12000
    // trim 1 each end -> 11000,11000,11500 -> mean 11166.67
    expect(a).toBeCloseTo((11000 + 11000 + 11500) / 3, 5)
  })
  it('is null below 3 solves', () => {
    expect(average([s(10000), s(11000)])).toBeNull()
  })
})

describe('currentAverage', () => {
  it('uses the most recent n solves', () => {
    const solves = [s(20000), s(10000), s(11000), s(12000), s(13000), s(14000)]
    // last 5: 10,11,12,13,14 -> trim best 10 worst 14 -> mean 11,12,13 = 12000
    expect(currentAverage(solves, 5)).toBe(12000)
  })
  it('uses mean semantics for n === 3', () => {
    const solves = [s(99000), s(10000), s(12000), s(14000)]
    expect(currentAverage(solves, 3)).toBe(12000) // last 3 mean, no trim
  })
  it('is null with fewer than n solves', () => {
    expect(currentAverage([s(10000)], 5)).toBeNull()
  })
})

describe('bestAverage', () => {
  it('finds the best ao5 window in the session', () => {
    // a fast window early, slower later
    const solves = [
      s(10000), s(10000), s(10000), s(10000), s(10000), // ao5 = 10000
      s(30000), s(30000), s(30000), s(30000), s(30000), // ao5 = 30000
    ]
    expect(bestAverage(solves, 5)).toBe(10000)
  })
  it('is null with fewer than n solves', () => {
    expect(bestAverage([s(10000), s(11000)], 5)).toBeNull()
  })
})

describe('sessionMean', () => {
  it('is the mean of all solves', () => {
    expect(sessionMean([s(10000), s(20000)])).toBe(15000)
  })
  it('is DNF (null) if any solve is a DNF', () => {
    expect(sessionMean([s(10000), dnf()])).toBeNull()
  })
})
