import { useState, useEffect, useCallback } from 'react'
import type { Cycle, CycleInput, PhaseDurations } from '../types'

const STORAGE_KEY = 'cyclescope-cycles'

function computePhaseDurations(input: {
  hypothesisFormedAt: string
  codeDeployedAt: string
  learningValidatedAt: string
}): PhaseDurations {
  const hypothesis = new Date(input.hypothesisFormedAt).getTime()
  const deploy = new Date(input.codeDeployedAt).getTime()
  const learning = new Date(input.learningValidatedAt).getTime()

  return {
    hypothesis: deploy - hypothesis,
    deploy: learning - deploy,
    learning: learning - deploy,
  }
}

function loadFromStorage(): Cycle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Cycle[]
  } catch {
    return []
  }
}

function saveToStorage(cycles: Cycle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles))
  } catch {
    // Silently fail if storage is unavailable
  }
}

export function useCycles() {
  const [cycles, setCycles] = useState<Cycle[]>(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(cycles)
  }, [cycles])

  const addCycle = useCallback((input: CycleInput): void => {
    const newCycle: Cycle = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cycle-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      hypothesis: input.hypothesis,
      hypothesisFormedAt: input.hypothesisFormedAt,
      codeDeployedAt: input.codeDeployedAt,
      learningValidatedAt: input.learningValidatedAt,
      createdAt: new Date().toISOString(),
      phaseDurations: computePhaseDurations(input),
    }

    setCycles((prev) => [...prev, newCycle])
  }, [])

  const deleteCycle = useCallback((id: string): void => {
    setCycles((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { cycles, addCycle, deleteCycle }
}
