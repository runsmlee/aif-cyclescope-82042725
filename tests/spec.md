# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### useCycles.test.ts
- [ ] initializes with empty array when no localStorage data exists
- [ ] loads existing cycles from localStorage on mount
- [ ] addCycle() appends a new cycle with a generated ID and persists to localStorage
- [ ] addCycle() computes per-phase durations from timestamps
- [ ] deleteCycle() removes the correct cycle by ID and persists the change
- [ ] handles malformed localStorage data gracefully (falls back to empty array)

### cycleCalc.test.ts
- [ ] calcTotalCycleTime() returns correct elapsed time from first to last phase timestamp
- [ ] calcPhaseDuration() returns correct duration between two phase timestamps
- [ ] calcPhasePercentages() returns proportional breakdown summing to 100%
- [ ] calcAverageCycleTime() returns mean across N cycles
- [ ] calcTrend() returns array of cycle times in chronological order
- [ ] identifyBottleneck() returns the phase with highest average duration across cycles
- [ ] formatDuration() formats durations as "Xh Ym" or "Xd Yh" appropriately
- [ ] calcBottleneckPercentage() returns the bottleneck phase's share of total cycle time

### CycleLogger.test.tsx
- [ ] renders without crash
- [ ] renders input fields for hypothesis name and 3 phase timestamps
- [ ] submitting with all fields populated calls onLog with correct cycle data
- [ ] submitting with missing timestamps shows validation message
- [ ] timestamp inputs accept datetime-local format
- [ ] form resets after successful submission

### CycleDashboard.test.tsx
- [ ] renders without crash when cycles array is empty (shows prompt to log first cycle)
- [ ] renders total cycle time for the most recent cycle
- [ ] renders horizontal bar chart showing phase proportions
- [ ] renders average cycle time across all cycles
- [ ] renders trend visualization when 2+ cycles exist
- [ ] bottleneck callout displays when 3+ complete cycles exist
- [ ] bottleneck callout shows correct phase name and percentage

## User Journey Tests

### Primary Workflow
1. App loads → hero shows empty cycle logger form with prompt "Log your first iteration cycle"
2. User enters hypothesis name and 3 timestamps (hypothesis formed, code deployed, learning validated) → clicks "Log Cycle"
3. Cycle appears in dashboard below with total time, phase breakdown bar, and trend line
4. User logs 2 more cycles → bottleneck callout appears highlighting slowest phase
5. User refreshes page → all cycles persist from localStorage, dashboard renders immediately

### Edge Case Workflow
1. User logs a cycle where code deploy timestamp is BEFORE hypothesis timestamp → shows validation error "Timestamps must be sequential"
2. User deletes a cycle → dashboard updates, trend recalculates, bottleneck updates if affected

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md features)
- [ ] AC: User logs a complete cycle (3 phase timestamps) and sees the total cycle time in hours/days, a horizontal bar showing each phase's proportion, and an updated trend line of average cycle time across all logged cycles — all rendered in the hero viewport without navigation
- [ ] AC: After logging 3+ complete cycles, the bottleneck callout displays the slowest phase name, its average duration, and its percentage of total cycle time
