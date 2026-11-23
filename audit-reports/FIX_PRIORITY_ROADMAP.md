# Plotline fix priority roadmap

Audit date: **2026-11-02 (Asia/Dhaka)**. Workspace commit: `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Only the six audit Markdown reports were added; application source, dependencies, environment and configuration were unchanged.

**54 open findings: 7 P1, 35 P2, 12 P3; no demonstrated P0.** Complexity is relative engineering scope, not a time promise. No application fixes were made. The complete report distinguishes local reproductions, code evidence and conditional risks.

## Stage 1: Critical security and stability

1. **P1-004:** preserve unrelated level drawings when replacing the sole flat; capture the exact data-loss regression first. Back up profiles before storage changes.
2. **P1-003:** repair durable outbox state, memory fallback, checked dequeue, transient 429 handling and bounded retry. Quotas must not discard buyer actions.
3. **P1-001/P1-002/P2-011:** shared versioned runtime parsing for events, Units and projects, plus defensive handling of invalid historical data.
4. **P1-005:** implement individual staff identity and scoped organization access before mutually untrusted organizations share the backend. Preserve RLS/table revokes.
5. **P1-006/P1-007:** enforce write budgets and revocable/expiring capabilities on both read/write paths, keeping event history.
6. **P2-001/P2-002/P2-028:** protect CSV exports, authoritative option/price lookup and both browser-key configuration paths alongside the larger access work.

Exit evidence: targeted regressions pass; no lost event under storage failures; malformed inputs rejected; isolated two-org denial tests where relevant; expired/revoked tokens disabled; synthetic secret-like client configuration cannot build; compatible older exports still load.

## Stage 2: Broken functionality

- **P2-005/P2-006/P2-018/P2-023:** transaction/revision-backed project/plan/picture state and a complete portable backup. Prefer one authoritative store over patching duplicated localStorage records separately.
- **P2-007 to P2-010:** token-scoped notes, current anchor transforms, buyer UI restriction and immutable published furniture.
- **P2-015 to P2-020:** fresh scene callbacks, one async placement owner, resource cleanup, safe committed picture writes and stale/CORS-aware image loading.
- **P2-021/P2-032:** tapered-column exact joins and robust route decoding/error containment.
- **P2-022:** selected derived-flat routes/shares while keeping one graph; depend on stable scoped identities.
- **P2-013/P2-014:** truthful clipboard fallback and handled XR startup failure.

Exit evidence: Firefox create→trace→review→preview→publish→buyer tests, two-tab/slow-download cases, and full project restoration into a fresh profile.

## Stage 3: Production readiness

- **P2-024/P2-025/P2-034/P3-001:** portable fixture corpus, committed disposable SQL/Firefox suites, pinned runtime and enforced clean build/typecheck/test gates.
- **P2-012/P2-027/P2-029/P2-030:** cancellable external calls, supported map fallback, correct endpoint classification and exact origin allowlist.
- **P2-035:** redacted diagnostics, synthetic published-link monitoring, tested backup restore and rollback.
- Obtain a successful registry advisory audit after authorized dependency setup; triage actual results, without automatic upgrades.
- Verify deployed rewrites, TLS/security headers, effective environment and staff/token indexing. No deployment is authorized by this audit.

Exit evidence: successful native build/tests, required corpus coverage and quality floor, actual advisory result, isolated security integration tests and deployed smoke checks.

## Stage 4: Performance and maintainability

- **P2-003/P2-033:** bounded history summaries/pages, decoded workload budgets and main-thread measurements.
- **P2-017:** verify GPU allocations stabilize after repeated edits; establish PC/WebXR baselines.
- **P3-004/P3-011:** extract storage/schema/async boundaries and reconcile current documentation; preserve core API and rendering stack.
- Finish semantic review of structural-only files and unreviewed large-module portions in the coverage ledger. AST parsing is not semantic release evidence.

## Stage 5: UX and enhancements

- **P2-026/P3-002:** accessible names, keyboard/focus and supported desktop/zoom layouts.
- **P2-031:** complete approved element-editing scoreboard incrementally.
- **P3-003:** public metadata and deliberate private-route indexing.
- **P3-005 to P3-010 and P3-012:** keep archived prototype inert; repair only if intentionally serving it. Do not port its detector into the active tracer.

## First implementation batch

Start with regression reproductions for the sole-flat loss, outbox durability and schema/crash boundaries; apply the smallest fixes that satisfy them. Back up local work before any storage migration. Then secure the actual backend scope and token lifecycle. Keep the graph/pure API, deterministic furnishing, structured materials, append-only history and useful quality controls. This roadmap is a recommendation; the user's audit instruction still prohibits source modification in this task.
