import type { Cycle } from '../types'
import {
  calcTotalCycleTime,
  calcPhasePercentages,
  calcAverageCycleTime,
  calcTrend,
  formatDuration,
} from '../utils/cycleCalc'
import { BottleneckCallout } from './BottleneckCallout'

interface CycleDashboardProps {
  cycles: Cycle[]
  onDelete: (id: string) => void
}

const phaseColors: Record<string, string> = {
  hypothesis: 'bg-gradient-to-r from-blue-400 to-blue-500',
  deploy: 'bg-gradient-to-r from-primary to-red-600',
  learning: 'bg-gradient-to-r from-green-400 to-green-500',
}

const phaseLabels: Record<string, string> = {
  hypothesis: 'Hypothesis → Deploy',
  deploy: 'Deploy → Learning',
  learning: 'Deploy → Learning',
}

export function CycleDashboard({ cycles, onDelete }: CycleDashboardProps) {
  if (cycles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 p-10 sm:p-12 text-center shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
            <svg
              className="h-7 w-7 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5">
          No cycles logged yet
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          Log your first iteration cycle above — you'll see your total cycle
          time before you finish reading this sentence.
        </p>
      </div>
    )
  }

  // Sort cycles chronologically
  const sortedCycles = [...cycles].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const latestCycle = sortedCycles[sortedCycles.length - 1]
  const totalTime = calcTotalCycleTime(latestCycle)
  const percentages = calcPhasePercentages(latestCycle)
  const avgTime = calcAverageCycleTime(sortedCycles)
  const trend = calcTrend(sortedCycles)
  const trendData = trend.map((time, i) => ({
    cycle: `Cycle ${i + 1}`,
    time,
  }))

  const phases = ['hypothesis', 'deploy'] as const

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Most Recent Cycle Summary */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Most Recent Cycle
            </h3>
            <p className="text-base font-semibold text-gray-900 mt-1.5 truncate">
              {latestCycle.hypothesis}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Time
            </p>
            <p className="text-2xl font-bold text-primary mt-0.5 tabular-nums">
              {formatDuration(totalTime)}
            </p>
          </div>
        </div>

        {/* Phase Breakdown Bars */}
        <div className="space-y-4 mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Phase Breakdown
          </p>
          {phases.map((phase) => (
            <div key={phase}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">
                  {phaseLabels[phase]}
                </span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {Math.round(percentages[phase])}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  data-testid="phase-bar"
                  className={`${phaseColors[phase]} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentages[phase]}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(percentages[phase])}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${phaseLabels[phase]} phase: ${Math.round(percentages[phase])}%`}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onDelete(latestCycle.id)}
          className="mt-5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors duration-150 inline-flex items-center gap-1 group"
          aria-label={`Delete cycle: ${latestCycle.hypothesis}`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          <span>Delete this cycle</span>
        </button>
      </div>

      {/* Average Cycle Time */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Average Cycle Time
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">
              {formatDuration(avgTime)}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-600 tabular-nums">
              {sortedCycles.length}
            </span>
            <span className="text-xs text-gray-400">
              {sortedCycles.length === 1 ? 'cycle' : 'cycles'}
            </span>
          </div>
        </div>
      </div>

      {/* Trend Visualization */}
      {sortedCycles.length >= 2 && (
        <div
          data-testid="trend-chart"
          className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)]"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            Cycle Time Trend
          </p>
          <div className="flex items-end gap-2 h-36">
            {trendData.map((d, i) => {
              const maxTime = Math.max(...trend)
              const heightPct = maxTime > 0 ? (d.time / maxTime) * 100 : 0
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
                >
                  <span className="text-[11px] font-medium text-gray-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatDuration(d.time)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-primary to-red-500 rounded-t-md transition-all duration-500 ease-out min-h-[4px] hover:from-red-600 hover:to-red-500"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {d.cycle}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottleneck Callout */}
      <BottleneckCallout cycles={sortedCycles} />

      {/* All Cycles List */}
      {sortedCycles.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)]">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            All Cycles ({sortedCycles.length})
          </p>
          <ul className="divide-y divide-gray-100">
            {sortedCycles
              .slice()
              .reverse()
              .map((cycle) => (
                <li
                  key={cycle.id}
                  className="flex items-center justify-between py-2.5 group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {cycle.hypothesis}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                      {formatDuration(calcTotalCycleTime(cycle))}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(cycle.id)}
                    className="flex-shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all duration-150 opacity-0 group-hover:opacity-100 sm:opacity-100"
                    aria-label={`Delete cycle: ${cycle.hypothesis}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
