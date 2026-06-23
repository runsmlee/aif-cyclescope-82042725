import type { Cycle, PhaseName } from '../types'
import {
  identifyBottleneck,
  calcBottleneckPercentage,
  formatDuration,
} from '../utils/cycleCalc'

interface BottleneckCalloutProps {
  cycles: Cycle[]
}

const phaseLabels: Record<PhaseName, string> = {
  hypothesis: 'Hypothesis → Deploy',
  deploy: 'Deploy → Learning',
  learning: 'Deploy → Learning',
}

export function BottleneckCallout({ cycles }: BottleneckCalloutProps) {
  if (cycles.length < 3) return null

  const bottleneck = identifyBottleneck(cycles)
  const percentage = calcBottleneckPercentage(cycles, bottleneck.phase)

  // Track analytics
  if (typeof window !== 'undefined' && window.aif?.track) {
    window.aif.track('bottleneck_viewed', {
      phase: bottleneck.phase,
      percentage: Math.round(percentage),
    })
  }

  return (
    <div
      data-testid="bottleneck-callout"
      className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <svg
            className="h-4 w-4 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Bottleneck: {phaseLabels[bottleneck.phase]}
          </p>
          <p className="text-sm text-amber-800/90 mt-1 leading-relaxed">
            Averaging{' '}
            <span className="font-semibold tabular-nums">
              {formatDuration(bottleneck.averageDuration)}
            </span>{' '}
            —{' '}
            <span className="font-semibold tabular-nums">
              {Math.round(percentage)}%
            </span>{' '}
            of your cycle time
          </p>
        </div>
      </div>
    </div>
  )
}
