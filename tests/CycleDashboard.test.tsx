import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CycleDashboard } from '../src/components/CycleDashboard'
import type { Cycle } from '../src/types'

function makeCycle(
  hypothesis: string,
  t1: string,
  t2: string,
  t3: string,
  id: string,
): Cycle {
  return {
    id,
    hypothesis,
    hypothesisFormedAt: t1,
    codeDeployedAt: t2,
    learningValidatedAt: t3,
    createdAt: t1,
    phaseDurations: {
      hypothesis: new Date(t2).getTime() - new Date(t1).getTime(),
      deploy: new Date(t3).getTime() - new Date(t2).getTime(),
      learning: new Date(t3).getTime() - new Date(t2).getTime(),
    },
  }
}

describe('CycleDashboard', () => {
  it('renders without crash when cycles array is empty (shows prompt to log first cycle)', () => {
    render(<CycleDashboard cycles={[]} onDelete={() => {}} />)
    expect(screen.getByText(/log your first/i)).toBeInTheDocument()
  })

  it('renders total cycle time for the most recent cycle', () => {
    const cycles: Cycle[] = [
      makeCycle('Test A', '2024-06-01T10:00:00.000Z', '2024-06-01T14:00:00.000Z', '2024-06-01T18:00:00.000Z', '1'),
    ]
    render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    // 8h total cycle - look for total time specifically
    const totalElement = screen.getByText('Total Time')
    expect(totalElement).toBeInTheDocument()
    // Check that the formatted time appears near it
    const parent = totalElement.closest('div')
    expect(parent?.textContent).toMatch(/8h/)
  })

  it('renders horizontal bar chart showing phase proportions', () => {
    const cycles: Cycle[] = [
      makeCycle('Test A', '2024-06-01T10:00:00.000Z', '2024-06-01T14:00:00.000Z', '2024-06-01T18:00:00.000Z', '1'),
    ]
    render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    // Phase labels
    expect(screen.getAllByText(/hypothesis/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/deploy/i).length).toBeGreaterThan(0)
    // Bar elements
    const bars = document.querySelectorAll('[data-testid="phase-bar"]')
    expect(bars.length).toBeGreaterThanOrEqual(2)
  })

  it('renders average cycle time across all cycles', () => {
    const cycles: Cycle[] = [
      makeCycle('A', '2024-06-01T10:00:00.000Z', '2024-06-01T14:00:00.000Z', '2024-06-01T18:00:00.000Z', '1'),
      makeCycle('B', '2024-06-02T10:00:00.000Z', '2024-06-02T14:00:00.000Z', '2024-06-02T16:00:00.000Z', '2'),
    ]
    render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    expect(screen.getByText(/average/i)).toBeInTheDocument()
  })

  it('renders trend visualization when 2+ cycles exist', () => {
    const cycles: Cycle[] = [
      makeCycle('A', '2024-06-01T10:00:00.000Z', '2024-06-01T14:00:00.000Z', '2024-06-01T18:00:00.000Z', '1'),
      makeCycle('B', '2024-06-02T10:00:00.000Z', '2024-06-02T14:00:00.000Z', '2024-06-02T16:00:00.000Z', '2'),
    ]
    render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    expect(screen.getByTestId('trend-chart')).toBeInTheDocument()
  })

  it('bottleneck callout displays when 3+ complete cycles exist', () => {
    const cycles: Cycle[] = [
      makeCycle('A', '2024-06-01T10:00:00.000Z', '2024-06-01T14:00:00.000Z', '2024-06-01T18:00:00.000Z', '1'),
      makeCycle('B', '2024-06-02T10:00:00.000Z', '2024-06-02T14:00:00.000Z', '2024-06-02T18:00:00.000Z', '2'),
      makeCycle('C', '2024-06-03T10:00:00.000Z', '2024-06-03T14:00:00.000Z', '2024-06-03T18:00:00.000Z', '3'),
    ]
    render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    expect(screen.getByTestId('bottleneck-callout')).toBeInTheDocument()
  })

  it('bottleneck callout shows correct phase name and percentage', () => {
    // Create 3 cycles where deploy is always the longest phase
    const cycles: Cycle[] = [
      makeCycle('A', '2024-06-01T10:00:00.000Z', '2024-06-01T11:00:00.000Z', '2024-06-01T12:00:00.000Z', '1'),
      makeCycle('B', '2024-06-02T10:00:00.000Z', '2024-06-02T11:00:00.000Z', '2024-06-02T12:00:00.000Z', '2'),
      makeCycle('C', '2024-06-03T10:00:00.000Z', '2024-06-03T11:00:00.000Z', '2024-06-03T12:00:00.000Z', '3'),
    ]
    const { container } = render(<CycleDashboard cycles={cycles} onDelete={() => {}} />)
    const callout = screen.getByTestId('bottleneck-callout')
    expect(callout.textContent).toMatch(/deploy|code deployed/i)
    expect(callout.textContent).toMatch(/%/)
  })
})
