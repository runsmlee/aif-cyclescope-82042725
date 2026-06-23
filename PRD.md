# CycleScope — Product Requirements Document

## Problem
Early-stage startup founders have no visibility into how fast they iterate. "Are we moving fast enough?" is a gut feeling, not a metric. Cycle time — the elapsed time from forming a hypothesis through deploying code to validated customer learning — is the single best predictor of finding product-market fit before runway expires. Yet teams track it in spreadsheets (if at all), lose data across tools, and can't see where they're actually bottlenecked until it's too late.

## Target Users
Technical founders and small product teams (2-10 people) at pre-PMF startups who ship continuously but have no systematic way to measure whether their iteration velocity is improving or stalling.

## Core Feature (default: exactly ONE)
- **Cycle Time Tracker**: Users log each iteration cycle as a sequence of timestamped phases — Hypothesis Formed → Code Deployed → Validated Learning Recorded — and instantly see total cycle time, per-phase duration breakdown, and a rolling trend across all logged cycles. Acceptance Criteria: User logs a complete cycle (3 phase timestamps) and sees the total cycle time in hours/days, a horizontal bar showing each phase's proportion, and an updated trend line of average cycle time across all logged cycles — all rendered in the hero viewport without navigation.

## Should Have (optional — only if the ONE feature requires it)
- **Bottleneck Highlighter**: Automatically identifies the slowest phase across the last 5 cycles and surfaces it with a color-coded callout (e.g., "Code Review averaging 3.2 days — 62% of your cycle time"). Acceptance Criteria: After logging 3+ complete cycles, the bottleneck callout displays the slowest phase name, its average duration, and its percentage of total cycle time.

## Out of Scope (v1) — LIST AT LEAST 3 things explicitly NOT being built
- **Third-party API integrations (GitHub, Jira, analytics platforms)**: Automated data pulling requires backend infrastructure, OAuth flows, and rate-limit handling that would delay the MVP by weeks. Manual timestamp entry delivers 80% of the insight value in v1.
- **Benchmarking against other startups**: The "pivot velocity calculator benchmarked against stage-matched startups" requires a dataset of anonymized startup performance data we don't have. Building this before validating that users even track cycles would be premature.
- **Team collaboration / multi-user accounts**: Shared dashboards, role permissions, and real-time sync add backend complexity. A single-user local-first tool proves the value proposition first.
- **Automated hypothesis-to-learning linking**: Auto-detecting which deploy relates to which hypothesis requires deep toolchain integration. Manual association is faster to build and more accurate in v1.

## Success Metrics
- Primary: User logs a complete cycle in under 60 seconds on first visit (no onboarding required)
- Secondary: Returning user views their cycle trend within 5 seconds of page load

## Design Principles
- **Numbers that mean something**: Every number on screen must be immediately actionable — no vanity metrics, no dashboards-for-dashboards-sake
- **Log-first, read-second**: The primary interaction is entering data, not viewing reports — the input form IS the hero, not a sidebar
- **Calm density**: Show rich information (cycle breakdown, trends, bottleneck) without visual clutter — use whitespace and a single accent color for emphasis
- The hero contains the cycle logger and the immediately-rendered result — no "Get Started" button, no onboarding wizard, no empty-state redirect
