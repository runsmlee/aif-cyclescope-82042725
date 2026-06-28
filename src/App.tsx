import { useEffect } from 'react'
import { useCycles } from './hooks/useCycles'
import { CycleLogger } from './components/CycleLogger'
import { CycleDashboard } from './components/CycleDashboard'

function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.aif?.track) {
    window.aif.track(event, props)
  }
}

export default function App() {
  const { cycles, addCycle, deleteCycle } = useCycles()

  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname })
  }, [])

  function handleAddCycle(input: Parameters<typeof addCycle>[0]) {
    addCycle(input)
    trackEvent('cycle_logged', {
      hypothesis: input.hypothesis.length,
    })
  }

  function handleDeleteCycle(id: string) {
    deleteCycle(id)
    trackEvent('cycle_deleted')
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Subtle gradient backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(239, 68, 68, 0.06), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero copy — one job: create tension */}
        <header className="mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm shadow-primary/30">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              CycleScope
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            How fast are you actually iterating?
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mt-2.5 max-w-xl">
            Not deploy frequency. Not PR cycle time. The full loop from
            hypothesis to validated learning — the number that determines
            whether you find PMF before your runway hits zero.
          </p>
        </header>

        {/* Hero: Logger + Dashboard */}
        <main className="space-y-6">
          <CycleLogger onLog={handleAddCycle} />
          <CycleDashboard cycles={cycles} onDelete={handleDeleteCycle} />
        </main>

        {/* Footer */}
        <footer className="mt-10 pt-5 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Your data stays in your browser. No account, no sync.
          </p>
        </footer>
      </div>
    </div>
  )
}
