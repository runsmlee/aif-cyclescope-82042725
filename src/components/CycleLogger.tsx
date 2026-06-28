import { useState, type FormEvent } from 'react'
import type { CycleInput } from '../types'

interface CycleLoggerProps {
  onLog: (input: CycleInput) => void
}

export function CycleLogger({ onLog }: CycleLoggerProps) {
  const [hypothesis, setHypothesis] = useState('')
  const [hypothesisFormedAt, setHypothesisFormedAt] = useState('')
  const [codeDeployedAt, setCodeDeployedAt] = useState('')
  const [learningValidatedAt, setLearningValidatedAt] = useState('')
  const [error, setError] = useState('')

  function validate(): string | null {
    if (!hypothesis.trim() || !hypothesisFormedAt || !codeDeployedAt || !learningValidatedAt) {
      return 'Please fill in all fields'
    }

    const t1 = new Date(hypothesisFormedAt).getTime()
    const t2 = new Date(codeDeployedAt).getTime()
    const t3 = new Date(learningValidatedAt).getTime()

    if (t1 >= t2 || t2 >= t3) {
      return 'Timestamps must be sequential (hypothesis → deploy → learning)'
    }

    return null
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onLog({
      hypothesis: hypothesis.trim(),
      hypothesisFormedAt,
      codeDeployedAt,
      learningValidatedAt,
    })

    // Reset form
    setHypothesis('')
    setHypothesisFormedAt('')
    setCodeDeployedAt('')
    setLearningValidatedAt('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200/80 p-6 sm:p-7 space-y-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)] animate-slide-up"
      aria-label="Cycle logger form"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Log a cycle — see your number in seconds
        </h2>
      </div>

      <div>
        <label
          htmlFor="hypothesis"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Hypothesis Name
        </label>
        <input
          id="hypothesis"
          type="text"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          placeholder="e.g., Users want faster checkout"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 hover:border-gray-400"
          aria-label="Hypothesis name"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="hypothesis-formed"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Hypothesis Formed
          </label>
          <input
            id="hypothesis-formed"
            type="datetime-local"
            value={hypothesisFormedAt}
            onChange={(e) => setHypothesisFormedAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 hover:border-gray-400"
            aria-label="Hypothesis formed"
          />
        </div>

        <div>
          <label
            htmlFor="code-deployed"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Code Deployed
          </label>
          <input
            id="code-deployed"
            type="datetime-local"
            value={codeDeployedAt}
            onChange={(e) => setCodeDeployedAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 hover:border-gray-400"
            aria-label="Code deployed"
          />
        </div>

        <div>
          <label
            htmlFor="learning-validated"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Learning Validated
          </label>
          <input
            id="learning-validated"
            type="datetime-local"
            value={learningValidatedAt}
            onChange={(e) => setLearningValidatedAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 hover:border-gray-400"
            aria-label="Learning validated"
          />
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 animate-fade-in"
          role="alert"
        >
          <svg
            className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-700 leading-snug">{error}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_3px_0_rgb(239_68_68/0.3)] hover:bg-red-600 hover:shadow-[0_4px_12px_-2px_rgb(239_68_68/0.35)] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150"
      >
        Log Cycle
      </button>
    </form>
  )
}
