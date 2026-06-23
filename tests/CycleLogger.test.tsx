import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CycleLogger } from '../src/components/CycleLogger'

describe('CycleLogger', () => {
  const mockOnLog = vi.fn()

  beforeEach(() => {
    mockOnLog.mockClear()
  })

  it('renders without crash', () => {
    render(<CycleLogger onLog={mockOnLog} />)
    expect(screen.getByText(/log a cycle/i)).toBeInTheDocument()
  })

  it('renders input fields for hypothesis name and 3 phase timestamps', () => {
    render(<CycleLogger onLog={mockOnLog} />)
    expect(screen.getByLabelText(/hypothesis name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hypothesis formed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/code deployed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/learning validated/i)).toBeInTheDocument()
  })

  it('submitting with all fields populated calls onLog with correct cycle data', async () => {
    render(<CycleLogger onLog={mockOnLog} />)

    fireEvent.change(screen.getByLabelText(/hypothesis name/i), {
      target: { value: 'Users want faster checkout' },
    })
    fireEvent.change(screen.getByLabelText(/hypothesis formed/i), {
      target: { value: '2024-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText(/code deployed/i), {
      target: { value: '2024-06-01T14:00' },
    })
    fireEvent.change(screen.getByLabelText(/learning validated/i), {
      target: { value: '2024-06-01T18:00' },
    })

    fireEvent.click(screen.getByRole('button', { name: /log cycle/i }))

    await waitFor(() => {
      expect(mockOnLog).toHaveBeenCalledTimes(1)
    })

    const callArg = mockOnLog.mock.calls[0][0]
    expect(callArg.hypothesis).toBe('Users want faster checkout')
    expect(callArg.hypothesisFormedAt).toBe('2024-06-01T10:00')
    expect(callArg.codeDeployedAt).toBe('2024-06-01T14:00')
    expect(callArg.learningValidatedAt).toBe('2024-06-01T18:00')
  })

  it('submitting with missing timestamps shows validation message', async () => {
    render(<CycleLogger onLog={mockOnLog} />)

    fireEvent.change(screen.getByLabelText(/hypothesis name/i), {
      target: { value: 'Test' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log cycle/i }))

    await waitFor(() => {
      expect(screen.getByText(/fill in all fields/i)).toBeInTheDocument()
    })
    expect(mockOnLog).not.toHaveBeenCalled()
  })

  it('timestamp inputs accept datetime-local format', () => {
    render(<CycleLogger onLog={mockOnLog} />)
    const datetimeInputs = document.querySelectorAll('input[type="datetime-local"]')
    expect(datetimeInputs).toHaveLength(3)
  })

  it('form resets after successful submission', async () => {
    render(<CycleLogger onLog={mockOnLog} />)

    fireEvent.change(screen.getByLabelText(/hypothesis name/i), {
      target: { value: 'Test hypothesis' },
    })
    fireEvent.change(screen.getByLabelText(/hypothesis formed/i), {
      target: { value: '2024-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText(/code deployed/i), {
      target: { value: '2024-06-01T14:00' },
    })
    fireEvent.change(screen.getByLabelText(/learning validated/i), {
      target: { value: '2024-06-01T18:00' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log cycle/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/hypothesis name/i)).toHaveValue('')
    })
  })

  it('validates timestamps are sequential', async () => {
    render(<CycleLogger onLog={mockOnLog} />)

    fireEvent.change(screen.getByLabelText(/hypothesis name/i), {
      target: { value: 'Test' },
    })
    // Out of order: hypothesis is later than deploy
    fireEvent.change(screen.getByLabelText(/hypothesis formed/i), {
      target: { value: '2024-06-01T18:00' },
    })
    fireEvent.change(screen.getByLabelText(/code deployed/i), {
      target: { value: '2024-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText(/learning validated/i), {
      target: { value: '2024-06-01T12:00' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log cycle/i }))

    await waitFor(() => {
      expect(screen.getByText(/sequential/i)).toBeInTheDocument()
    })
    expect(mockOnLog).not.toHaveBeenCalled()
  })
})
