import { describe, it, expect } from 'vitest'
import {
  calcTotalCycleTime,
  calcPhaseDuration,
  calcPhasePercentages,
  calcAverageCycleTime,
  calcTrend,
  identifyBottleneck,
  formatDuration,
  calcBottleneckPercentage,
} from '../src/utils/cycleCalc'
import type { Cycle } from '../src/types'

// Helper: create a cycle with specific ms timestamps
function makeCycle(
  hypothesis: string,
  t1: number,
  t2: number,
  t3: number,
  id = 'test-id',
): Cycle {
  return {
    id,
    hypothesis,
    hypothesisFormedAt: new Date(t1).toISOString(),
    codeDeployedAt: new Date(t2).toISOString(),
    learningValidatedAt: new Date(t3).toISOString(),
    createdAt: new Date(t1).toISOString(),
  }
}

describe('calcTotalCycleTime', () => {
  it('returns correct elapsed time from first to last phase timestamp', () => {
    const cycle = makeCycle('Test hypothesis', 0, 3600000, 7200000) // 0h, 1h, 2h
    const total = calcTotalCycleTime(cycle)
    expect(total).toBe(7200000) // 2 hours in ms
  })
})

describe('calcPhaseDuration', () => {
  it('returns correct duration between two phase timestamps', () => {
    const cycle = makeCycle('Test', 0, 3600000, 10800000)
    const phase1 = calcPhaseDuration(cycle, 'hypothesis', 'deploy')
    const phase2 = calcPhaseDuration(cycle, 'deploy', 'learning')
    expect(phase1).toBe(3600000) // 1 hour
    expect(phase2).toBe(7200000) // 2 hours
  })
})

describe('calcPhasePercentages', () => {
  it('returns proportional breakdown summing to 100%', () => {
    // 0 → 1h → 3h: total=3h
    // hypothesis phase (0→1h) = 1h = 33.33%
    // deploy phase (1h→3h) = 2h = 66.67%
    const cycle = makeCycle('Test', 0, 3600000, 10800000)
    const percentages = calcPhasePercentages(cycle)
    expect(percentages.hypothesis).toBeCloseTo(33.33, 1)
    expect(percentages.deploy).toBeCloseTo(66.67, 1)
    // Sum of hypothesis + deploy should = 100% (two actual phases)
    const sum = percentages.hypothesis + percentages.deploy
    expect(sum).toBeCloseTo(100, 0)
  })
})

describe('calcAverageCycleTime', () => {
  it('returns mean across N cycles', () => {
    const c1 = makeCycle('A', 0, 3600000, 7200000) // 2h
    const c2 = makeCycle('B', 0, 7200000, 21600000) // 6h
    const avg = calcAverageCycleTime([c1, c2])
    expect(avg).toBe((7200000 + 21600000) / 2) // 4h avg
  })
})

describe('calcTrend', () => {
  it('returns array of cycle times in chronological order', () => {
    const c1 = makeCycle('A', 0, 3600000, 7200000, 'c1') // 2h
    const c2 = makeCycle('B', 0, 3600000, 10800000, 'c2') // 3h
    const c3 = makeCycle('C', 0, 3600000, 14400000, 'c3') // 4h
    const trend = calcTrend([c1, c2, c3])
    expect(trend).toEqual([7200000, 10800000, 14400000])
  })
})

describe('identifyBottleneck', () => {
  it('returns the phase with highest average duration across cycles', () => {
    // Cycle 1: hypothesis=1h, deploy=3h, learning=1h
    const c1 = makeCycle('A', 0, 3600000, 18000000)
    // Cycle 2: hypothesis=1h, deploy=4h, learning=1h
    const c2 = makeCycle('B', 0, 3600000, 21600000)
    const bottleneck = identifyBottleneck([c1, c2])
    expect(bottleneck.phase).toBe('deploy')
  })
})

describe('formatDuration', () => {
  it('formats durations as "Xh Ym" for sub-day durations', () => {
    expect(formatDuration(3600000)).toBe('1h 0m') // 1 hour
    expect(formatDuration(5400000)).toBe('1h 30m') // 1.5 hours
    expect(formatDuration(90000000)).toBe('25h 0m') // 25 hours (still in h/m)
  })

  it('formats durations as "Xd Yh" for day+ durations', () => {
    expect(formatDuration(90000000, 'day')).toBe('1d 1h') // 25h
    expect(formatDuration(172800000, 'day')).toBe('2d 0h') // 48h
  })
})

describe('calcBottleneckPercentage', () => {
  it('returns the bottleneck phase share of total cycle time', () => {
    // hypothesis=1h, deploy=5h => total=6h, deploy=83.33%
    const cycle = makeCycle('A', 0, 3600000, 21600000)
    const cycles = [cycle]
    const bottleneck = identifyBottleneck(cycles)
    const pct = calcBottleneckPercentage(cycles, bottleneck.phase)
    expect(pct).toBeCloseTo(83.33, 0)
  })
})
