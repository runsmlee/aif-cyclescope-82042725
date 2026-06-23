export type PhaseName = 'hypothesis' | 'deploy' | 'learning'

export interface PhaseDurations {
  hypothesis: number // ms from hypothesisFormed to codeDeployed
  deploy: number // ms from codeDeployed to learningValidated
  learning: number // ms (same as deploy for 3-phase model, or separate)
}

export interface Cycle {
  id: string
  hypothesis: string
  hypothesisFormedAt: string // ISO or datetime-local string
  codeDeployedAt: string
  learningValidatedAt: string
  createdAt: string
  phaseDurations?: PhaseDurations
}

export interface CycleInput {
  hypothesis: string
  hypothesisFormedAt: string
  codeDeployedAt: string
  learningValidatedAt: string
}

export interface PhasePercentage {
  hypothesis: number
  deploy: number
  learning: number
}

export interface BottleneckResult {
  phase: PhaseName
  averageDuration: number
}
