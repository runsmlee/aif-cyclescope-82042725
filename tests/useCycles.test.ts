import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCycles } from '../src/hooks/useCycles'
import type { Cycle } from '../src/types'

// Helper: create raw cycle input data
function makeCycleInput(
  hypothesis: string,
  t1: string,
  t2: string,
  t3: string,
) {
  return {
    hypothesis,
    hypothesisFormedAt: t1,
    codeDeployedAt: t2,
    learningValidatedAt: t3,
  }
}

describe('useCycles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with empty array when no localStorage data exists', () => {
    const { result } = renderHook(() => useCycles())
    expect(result.current.cycles).toEqual([])
  })

  it('loads existing cycles from localStorage on mount', () => {
    const stored: Cycle[] = [
      {
        id: 'existing-1',
        hypothesis: 'Test hypothesis',
        hypothesisFormedAt: '2024-01-01T10:00:00.000Z',
        codeDeployedAt: '2024-01-01T12:00:00.000Z',
        learningValidatedAt: '2024-01-01T14:00:00.000Z',
        createdAt: '2024-01-01T10:00:00.000Z',
      },
    ]
    localStorage.setItem('cyclescope-cycles', JSON.stringify(stored))

    const { result } = renderHook(() => useCycles())
    expect(result.current.cycles).toHaveLength(1)
    expect(result.current.cycles[0].hypothesis).toBe('Test hypothesis')
  })

  it('addCycle() appends a new cycle with a generated ID and persists to localStorage', () => {
    const { result } = renderHook(() => useCycles())

    act(() => {
      result.current.addCycle(
        makeCycleInput(
          'My hypothesis',
          '2024-01-01T10:00',
          '2024-01-01T12:00',
          '2024-01-01T14:00',
        ),
      )
    })

    expect(result.current.cycles).toHaveLength(1)
    expect(result.current.cycles[0].id).toBeTruthy()
    expect(result.current.cycles[0].hypothesis).toBe('My hypothesis')

    const stored = JSON.parse(
      localStorage.getItem('cyclescope-cycles') || '[]',
    )
    expect(stored).toHaveLength(1)
    expect(stored[0].hypothesis).toBe('My hypothesis')
  })

  it('addCycle() computes per-phase durations from timestamps', () => {
    const { result } = renderHook(() => useCycles())

    act(() => {
      result.current.addCycle(
        makeCycleInput(
          'Test',
          '2024-01-01T10:00',
          '2024-01-01T12:00',
          '2024-01-01T14:00',
        ),
      )
    })

    const cycle = result.current.cycles[0]
    expect(cycle.phaseDurations).toBeDefined()
    expect(cycle.phaseDurations!.hypothesis).toBe(2 * 3600000) // 2h
    expect(cycle.phaseDurations!.deploy).toBe(2 * 3600000) // 2h
    expect(cycle.phaseDurations!.learning).toBe(2 * 3600000) // 2h
  })

  it('deleteCycle() removes the correct cycle by ID and persists the change', () => {
    const { result } = renderHook(() => useCycles())

    act(() => {
      result.current.addCycle(
        makeCycleInput('A', '2024-01-01T10:00', '2024-01-01T11:00', '2024-01-01T12:00'),
      )
      result.current.addCycle(
        makeCycleInput('B', '2024-01-02T10:00', '2024-01-02T11:00', '2024-01-02T12:00'),
      )
    })

    expect(result.current.cycles).toHaveLength(2)
    const firstId = result.current.cycles[0].id

    act(() => {
      result.current.deleteCycle(firstId)
    })

    expect(result.current.cycles).toHaveLength(1)
    expect(result.current.cycles[0].hypothesis).toBe('B')

    const stored = JSON.parse(
      localStorage.getItem('cyclescope-cycles') || '[]',
    )
    expect(stored).toHaveLength(1)
    expect(stored[0].hypothesis).toBe('B')
  })

  it('handles malformed localStorage data gracefully (falls back to empty array)', () => {
    localStorage.setItem('cyclescope-cycles', '{not valid json')

    const { result } = renderHook(() => useCycles())
    expect(result.current.cycles).toEqual([])
  })
})
