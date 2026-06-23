import type {
  Cycle,
  PhaseName,
  PhasePercentage,
  BottleneckResult,
} from '../types'

/**
 * Calculate total cycle time from first to last phase timestamp.
 */
export function calcTotalCycleTime(cycle: Cycle): number {
  const start = new Date(cycle.hypothesisFormedAt).getTime()
  const end = new Date(cycle.learningValidatedAt).getTime()
  return end - start
}

/**
 * Calculate duration between two phases.
 * hypothesis -> deploy: hypothesisFormedAt -> codeDeployedAt
 * deploy -> learning: codeDeployedAt -> learningValidatedAt
 */
export function calcPhaseDuration(
  cycle: Cycle,
  from: PhaseName,
  to: PhaseName,
): number {
  const timestamps: Record<PhaseName, string> = {
    hypothesis: cycle.hypothesisFormedAt,
    deploy: cycle.codeDeployedAt,
    learning: cycle.learningValidatedAt,
  }
  const fromTime = new Date(timestamps[from]).getTime()
  const toTime = new Date(timestamps[to]).getTime()
  return toTime - fromTime
}

/**
 * Calculate proportional breakdown of each phase as a percentage of total cycle time.
 */
export function calcPhasePercentages(cycle: Cycle): PhasePercentage {
  const total = calcTotalCycleTime(cycle)
  if (total === 0) {
    return { hypothesis: 0, deploy: 0, learning: 0 }
  }
  const hypothesis = calcPhaseDuration(cycle, 'hypothesis', 'deploy')
  const deploy = calcPhaseDuration(cycle, 'deploy', 'learning')
  // The "learning" phase duration in a 3-phase model is the time from deploy to learning
  // (which is the same as deploy phase). But for proportional breakdown,
  // we distribute total time across hypothesis->deploy and deploy->learning.
  // hypothesis = first phase, deploy = second phase
  const hypoPct = (hypothesis / total) * 100
  const deployPct = (deploy / total) * 100
  return {
    hypothesis: hypoPct,
    deploy: deployPct,
    learning: deployPct, // In 3-timestamp model, learning phase overlaps with deploy phase
  }
}

/**
 * Calculate average cycle time across N cycles.
 */
export function calcAverageCycleTime(cycles: Cycle[]): number {
  if (cycles.length === 0) return 0
  const total = cycles.reduce((sum, c) => sum + calcTotalCycleTime(c), 0)
  return total / cycles.length
}

/**
 * Returns array of cycle times in chronological order.
 */
export function calcTrend(cycles: Cycle[]): number[] {
  return [...cycles]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((c) => calcTotalCycleTime(c))
}

/**
 * Identify the phase with the highest average duration across cycles.
 */
export function identifyBottleneck(cycles: Cycle[]): BottleneckResult {
  if (cycles.length === 0) {
    return { phase: 'deploy', averageDuration: 0 }
  }

  const phases: PhaseName[] = ['hypothesis', 'deploy', 'learning']
  const avgByPhase: Record<PhaseName, number> = {
    hypothesis: 0,
    deploy: 0,
    learning: 0,
  }

  for (const phase of phases) {
    let nextPhase: PhaseName
    if (phase === 'hypothesis') nextPhase = 'deploy'
    else nextPhase = 'learning'

    const durations = cycles.map((c) => calcPhaseDuration(c, phase, nextPhase))
    avgByPhase[phase] = durations.reduce((s, d) => s + d, 0) / durations.length
  }

  // Find the phase with max average
  let maxPhase: PhaseName = 'hypothesis'
  let maxAvg = avgByPhase.hypothesis

  for (const phase of phases) {
    if (avgByPhase[phase] > maxAvg) {
      maxAvg = avgByPhase[phase]
      maxPhase = phase
    }
  }

  return { phase: maxPhase, averageDuration: maxAvg }
}

/**
 * Calculate the bottleneck phase's percentage share of total average cycle time.
 */
export function calcBottleneckPercentage(
  cycles: Cycle[],
  phase: PhaseName,
): number {
  if (cycles.length === 0) return 0

  const nextPhase: PhaseName = phase === 'hypothesis' ? 'deploy' : 'learning'
  const phaseDurations = cycles.map((c) =>
    calcPhaseDuration(c, phase, nextPhase),
  )
  const avgPhase =
    phaseDurations.reduce((s, d) => s + d, 0) / phaseDurations.length
  const avgTotal = calcAverageCycleTime(cycles)

  if (avgTotal === 0) return 0
  return (avgPhase / avgTotal) * 100
}

/**
 * Format duration in ms as human readable string.
 * Default: "Xh Ym" format
 * With 'day': "Xd Yh" format for durations >= 1 day
 */
export function formatDuration(
  ms: number,
  mode: 'hour' | 'day' = 'hour',
): string {
  const totalSeconds = Math.floor(ms / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  if (mode === 'day' && totalDays >= 1) {
    const remainingHours = totalHours % 24
    return `${totalDays}d ${remainingHours}h`
  }

  const hours = totalHours
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

/**
 * Get display label for a phase name.
 */
export function getPhaseLabel(phase: PhaseName): string {
  const labels: Record<PhaseName, string> = {
    hypothesis: 'Hypothesis → Deploy',
    deploy: 'Deploy → Learning',
    learning: 'Deploy → Learning',
  }
  return labels[phase]
}
