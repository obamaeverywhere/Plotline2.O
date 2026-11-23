# Plotline performance audit

Audit date: **2026-11-02 (Asia/Dhaka)**. Workspace commit: `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Only the six audit Markdown reports were added; application source, dependencies, environment and configuration were unchanged.

This is a repository-wide structural audit with focused manual review and isolated runtime probes. **It is not a completed line-by-line semantic review of every algorithm or a successful browser/production validation.** The per-file ledger identifies structural-only files and outstanding work. No production database was connected, no package was installed/upgraded and no deployment or live exploit was performed.

## Measured facts

| Filesystem/structural measurement | Result |
|---|---:|
| All public files | 97,837,141 bytes (~93.3 MiB) |
| Model directory | 67,118,800 bytes (~64.0 MiB) |
| Texture directory | 26,568,553 bytes (~25.3 MiB) |
| Two HDRIs | 2,799,779 bytes (~2.67 MiB) |
| Largest buffer: potted_plant_01.bin | 5,345,188 bytes (~5.10 MiB) |
| glTF references | 37 manifests, no missing local references |
| Built-in Unit validation | 20 valid units, zero current validator errors/warnings |

**The public directory size is not initial page download size.** Assets depend on the scene/finishes/quality. No production bundle/gzip size, browser transfer, FPS, GPU allocation, latency or traffic capacity was measured. PC/WebXR priorities supersede the old phone/5 MB gate; this audit does not reintroduce it.

## Current implementation behavior

The React entry lazily splits Studio/Viewer/Changes; built-in Unit JSONs are eagerly imported. Viewer imports editor/reducer helpers, which bring pure trace text/size helpers through model.ts, while actual OCR dynamically imports Tesseract. Bundle consequences need a successful build.

Furniture is distance-sorted then built serially for the whole layout, not activated per room. URL caches share glTF downloads; materials are cached, geometry merged, and some foliage instanced. Failed URL promises remain cached, so automatic asset recovery is limited until page/module reset. FinishesPanel warms maps for all offered choices when opened; measure this before narrowing prefetch. The 20-second Ready cap is an escape from stuck downloads, not evidence every asset loaded.

High enables GTAO/MSAA/larger shadows; Low/Lite reduce cost. Lite omits scanned plants and avoids idle scene drawing. UI minimap/pin/wind rAF loops continue while the scene is idle. roomAt rebuilds polygons/maps, collision scans walls, and shadow signatures traverse scene objects. These are profiling targets, not established target-PC bottlenecks.

Scene setUnit synchronously derives/builds geometry and bakes daylight, including after opening edits. validate explicitly scans wall pairs with box rejection. Tracing/review workers already isolate significant work and should remain. Documented Draco/KTX2 loader wiring and per-room activation are not in active loaders; compression should follow measured transfer/visual budgets.

## Findings

| ID | Severity | Problem | File | Confidence | Impact | Fix Complexity |
|---|---|---|---|---|---|---|
| P1-006 | High | Public event writes have no application rate limit or quota | [supabase/migrations/20261004120000_events.sql:39](../supabase/migrations/20261004120000_events.sql#L39) | Confirmed | High | Medium |
| P2-003 | Medium | Staff history reads and rendering are unbounded | [supabase/migrations/20261004120000_events.sql:66](../supabase/migrations/20261004120000_events.sql#L66) | Strongly supported | Medium | Medium |
| P2-012 | Medium | External operations can wait indefinitely without cancellation | [src/lib/supabase.ts:23](../src/lib/supabase.ts#L23) | Strongly supported | Medium | Medium |
| P2-016 | Medium | Pending furniture loads are not reconciled with intervening edits | [src/three/PlotlineScene.ts:736](../src/three/PlotlineScene.ts#L736) | Strongly supported | Medium | Medium |
| P2-017 | Medium | Mirror render targets are not disposed when pieces are rebuilt | [src/furnish/procedural.ts:292](../src/furnish/procedural.ts#L292) | Strongly supported | Medium | Medium |
| P2-024 | Medium | Regression corpus and tools depend on absent Windows paths | [scripts/trace-fixtures.mjs:47](../scripts/trace-fixtures.mjs#L47) | Confirmed | Medium | Medium |
| P2-033 | Medium | Decoded image and graph workloads have no resource budget | [src/studio/StudioApp.tsx:69](../src/studio/StudioApp.tsx#L69) | Potential | Medium | Medium |
| P3-008 | Low | Archived workspaces retain old animation loops and listeners | [plotline_1.2/js/app.js:15](../plotline_1.2/js/app.js#L15) | Strongly supported | Low | Medium |
| P3-010 | Low | Archived Generate 3D rebuilds twice | [plotline_1.2/js/app.js:19](../plotline_1.2/js/app.js#L19) | Confirmed | Low | Low |

### P1-006 — Public event writes have no application rate limit or quota

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:39](../supabase/migrations/20261004120000_events.sql#L39), [supabase/migrations/20261004120000_events.sql:42](../supabase/migrations/20261004120000_events.sql#L42).

**Evidence and root cause:** Any existing token can insert unlimited unique event IDs; only each payload is capped at 8,000 bytes. The migration acknowledges absent throttling. Hosted protections were not inspected.

**Expected impact:** A valid/leaked link can grow permanent history and every staff read; actual capacity/denial of service was not measured.

**Recommended solution:** Enforce transactional per-token and aggregate budgets, bounded requests and monitored ingress; coordinate retryable errors with the repaired outbox.

**Verification/regression:** Exceed a test-token budget in disposable SQL and verify bounded acceptance, independent other-token access and recoverable retries.

### P2-003 — Staff history reads and rendering are unbounded

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Performance · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:66](../supabase/migrations/20261004120000_events.sql#L66), [src/lib/events.ts:173](../src/lib/events.ts#L173), [src/viewer/ChangeList.tsx:99](../src/viewer/ChangeList.tsx#L99).

**Evidence and root cause:** The RPC aggregates all links and all events, sorting supersession over history. No page/filter/cap exists. byLink filters the entire event array per link and React renders all rows.

**Expected impact:** Database sorts, payloads and UI work grow with retained history. No production latency benchmark was available.

**Recommended solution:** Add scoped keyset pages, server current-state summaries and paged export/history; index measured query patterns.

**Verification/regression:** Seed representative history in disposable SQL; inspect EXPLAIN, payload bytes and browser render latency.

### P2-012 — External operations can wait indefinitely without cancellation

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Reliability · **Fix complexity:** Medium.

**Affected code:** [src/lib/supabase.ts:23](../src/lib/supabase.ts#L23), [src/studio/SitePanel.tsx:78](../src/studio/SitePanel.tsx#L78), [src/studio/SitePanel.tsx:126](../src/studio/SitePanel.tsx#L126), [src/studio/localAI.ts:59](../src/studio/localAI.ts#L59), [src/trace/ai.ts:145](../src/trace/ai.ts#L145).

**Evidence and root cause:** RPC, wind, geocoding and AI fetches omit deadlines/abort signals. fetchSite waits for wind despite map timeouts. A stalled RPC blocks the serial queue; failed unit loads become unavailable without retry.

**Expected impact:** Publishing/loading/Site/AI may stay busy indefinitely or obscure transient failures.

**Recommended solution:** Add operation-specific deadlines/cancel controls, stale-request cancellation and retryable-versus-not-found states. Allow explicit cancellation for long local model warmup.

**Verification/regression:** Use a never-settling fetch for each workflow; verify cancellation/retry preserves work and avoids duplicate publication.

### P2-016 — Pending furniture loads are not reconciled with intervening edits

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Reliability · **Fix complexity:** Medium.

**Affected code:** [src/three/PlotlineScene.ts:736](../src/three/PlotlineScene.ts#L736), [src/three/PlotlineScene.ts:1265](../src/three/PlotlineScene.ts#L1265), [src/three/PlotlineScene.ts:445](../src/three/PlotlineScene.ts#L445), [src/viewer/ViewerApp.tsx:670](../src/viewer/ViewerApp.tsx#L670).

**Evidence and root cause:** Initial loading mounts original placements serially without checking current layout/existing IDs. addPiece uses a separate path. Enter can unlock after 20 seconds while downloads remain; keepView rebuild cancels the initial loop but retains only mounted objects.

**Expected impact:** Under delayed loads, edits may produce stale transforms, duplicates or missing unloaded pieces. Browser reproduction remains outstanding.

**Recommended solution:** Use one per-ID async reconciliation owner with scene generation and latest placement; restart/reconcile pending work and dispose abandoned builds.

**Verification/regression:** Delay glTF beyond Enter, edit/delete/add furniture and an opening; assert exactly one current object per placement.

### P2-017 — Mirror render targets are not disposed when pieces are rebuilt

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Performance · **Fix complexity:** Medium.

**Affected code:** [src/furnish/procedural.ts:292](../src/furnish/procedural.ts#L292), [src/three/PlotlineScene.ts:801](../src/three/PlotlineScene.ts#L801), [src/three/PlotlineScene.ts:1042](../src/three/PlotlineScene.ts#L1042), [src/three/render.ts:682](../src/three/render.ts#L682).

**Evidence and root cause:** Each mirror allocates a 512-square multisampled Reflector target. Its comment acknowledges missing teardown. Rebuild/clear paths dispose geometry but not those targets; repeated PMREM ownership also needs review.

**Expected impact:** Long edit sessions can retain GPU allocations. Actual memory growth was not measured.

**Recommended solution:** Give per-instance targets/materials explicit disposal separate from shared caches; clean rejected async builds and obsolete environments.

**Verification/regression:** Repeat vanity/mirror resize/delete and scene rebuilds in Firefox, track allocation counts and verify cleanup stabilizes.

### P2-024 — Regression corpus and tools depend on absent Windows paths

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Testing · **Fix complexity:** Medium.

**Affected code:** [scripts/trace-fixtures.mjs:47](../scripts/trace-fixtures.mjs#L47), [src/trace/evalio.ts:10](../src/trace/evalio.ts#L10), [src/trace/eval/sheets30.json:3](../src/trace/eval/sheets30.json#L3), [src/trace/eval/score30.test.ts:30](../src/trace/eval/score30.test.ts#L30), [src/trace/sheltechL2.test.ts:33](../src/trace/sheltechL2.test.ts#L33).

**Evidence and root cause:** The fixture generator imports Playwright from E:/dev/Plotline/node_modules; source sheets/caches and external browser harness use E: paths. The 30-sheet corpus is absent here. Several suites skip without fixtures; score30 requires only at least one processed sheet, not all or a quality floor.

**Expected impact:** A clean clone cannot reproduce acceptance evidence, and partial runs can hide gaps.

**Recommended solution:** Use local package resolution/configurable paths, reproducibly supply licensed fixtures and require all selected sheets plus explicit quality baselines in release checks.

**Verification/regression:** Generate/run the required corpus on a clean non-Windows checkout; a missing required sheet must fail.

### P2-033 — Decoded image and graph workloads have no resource budget

**Severity:** P2 · **Confidence:** Potential · **Category:** Performance · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:69](../src/studio/StudioApp.tsx#L69), [src/studio/StudioApp.tsx:217](../src/studio/StudioApp.tsx#L217), [src/studio/StudioApp.tsx:771](../src/studio/StudioApp.tsx#L771), [src/core/graph.ts:469](../src/core/graph.ts#L469), [src/three/PlotlineScene.ts:426](../src/three/PlotlineScene.ts#L426).

**Evidence and root cause:** Images cap compressed bytes, not pixels; rastersOf creates full RGBA/gray buffers on the main thread. JSON has no size/entity budget. validate scans wall pairs and setUnit synchronously bakes daylight despite worker-based tracing.

**Expected impact:** Large valid imports can exhaust memory or stall UI before cancellation. No maximum-size stress benchmark was performed.

**Recommended solution:** Define decoded-pixel/graph budgets, preserve old drafts on failure and profile/chunk/offload costly stages as evidence warrants.

**Verification/regression:** Stress accepted/rejected plan sizes and whole-floor graphs on target PCs; measure responsiveness and recovery.

### P3-008 — Archived workspaces retain old animation loops and listeners

**Severity:** P3 · **Confidence:** Strongly supported · **Category:** Legacy performance · **Fix complexity:** Medium.

**Affected code:** [plotline_1.2/js/app.js:15](../plotline_1.2/js/app.js#L15), [plotline_1.2/js/editor/PlanEditor.js:7](../plotline_1.2/js/editor/PlanEditor.js#L7), [plotline_1.2/js/renderer/ThreeRenderer.js:62](../plotline_1.2/js/renderer/ThreeRenderer.js#L62).

**Evidence and root cause:** Every workspace creates new renderer/editor objects without teardown; recursive rAF and document/window listeners survive dashboard DOM replacement.

**Expected impact:** Repeated archived project opening wastes CPU/GPU and duplicates handlers. Active PlotlineScene has separate substantial teardown.

**Recommended solution:** Keep archive inert or add explicit disposal, rAF cancellation and listener ownership.

**Verification/regression:** Open/close multiple archived projects; only one renderer/input-handler set may remain.

### P3-010 — Archived Generate 3D rebuilds twice

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy performance · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/app.js:19](../plotline_1.2/js/app.js#L19), [plotline_1.2/js/app.js:18](../plotline_1.2/js/app.js#L18).

**Evidence and root cause:** generate calls renderer.generate then setMode(3d), which calls it again when rooms exist. clear removes objects without resource disposal.

**Expected impact:** Redundant geometry work and resource churn per click in the archive.

**Recommended solution:** Choose one rebuild owner and dispose replaced resources if maintaining it.

**Verification/regression:** One click must invoke exactly one scene build.


## Verification plan

1. Record cold/warm Firefox waterfalls, first useful frame and room completion. Include delayed/failed models and texture recovery.
2. Measure validation, derivation, daylight and scene rebuild separately on representative large floor graphs, not just worker trace time.
3. Repeat mirror/vanity resize/delete, scene rebuild, StrictMode cleanup and context restore; track owned render targets and GPU allocations separately from shared caches.
4. Profile walking/idle overlays, collision and shadow signature traversal before introducing spatial indexes or new caches.
5. Seed isolated append-only history; measure query plans, payload growth, client memory and render time. Establish keyset/summary API budgets.
6. Measure localStorage serialization/quota with multiple drawings/images. Move durable records/blobs to transactions before relying on longer debounces.

Fix data loss, queue retry and loading reconciliation before optimization. Retain quality tiers, deterministic presets, merged geometry and asset-reference checks. No target FPS/load-time or concurrent-user claim is defensible until measured on the supported hardware and deployment.
