# Complete Plotline codebase audit

Audit date: **2026-11-02 (Asia/Dhaka)**. Workspace commit: `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Only the six audit Markdown reports were added; application source, dependencies, environment and configuration were unchanged.

## 1. Executive summary

Plotline is a digital show-flat tool for developer sales teams and apartment buyers. Staff trace/edit floor-plan graphs, generate furnished 3D/VR views and publish snapshots. Buyers explore, choose finishes and leave comments for a staff change list. The active stack is React/TypeScript/Vite, Three.js, Tesseract and Supabase PostgreSQL RPC, with Vercel SPA configuration. An archived JavaScript prototype remains in the repository.

This is a repository-wide structural audit with focused manual review and isolated runtime probes. **It is not a completed line-by-line semantic review of every algorithm or a successful browser/production validation.** The per-file ledger identifies structural-only files and outstanding work. No production database was connected, no package was installed/upgraded and no deployment or live exploit was performed.

**54 findings: 7 P1 high, 35 P2 medium, 12 P3 low; no demonstrated P0.** The pure wall graph, deterministic presets and extensive regression intent are sound foundations. Immediate concerns are project drawing loss, undurable buyer events, malformed data crashing consumers and absent organization-scoped access. Backend quotas/capability revocation and tested recovery also remain missing.

**Production readiness is not demonstrated.** Build/typecheck/Vitest could not start because dependencies are absent; npm audit could not reach the registry. These are verification limits, not proof a correctly prepared installation cannot build. Potential impacts are not presented as executed exploits, and archived findings do not describe the active deployment.

The first five priorities are **P1-004** sole-flat replacement loss, **P1-003** outbox loss/retry, **P1-001** event schema/staff crash, **P1-002** permissive Unit schema and **P1-005** organization-scoped staff authorization. P1-006/P1-007 belong in the same release-blocking backend work before broader customer access.

## 2. Architecture overview

See [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) for directory structure, Mermaid flow, persistence, actual RPC/schema contracts and deployment. Implementation—not the target document—was the authority.

- Frontend: three lazy React apps with pathname dispatch, local reducers/state, canvas/SVG editor and Three.js scenes.
- Backend: fetch/PostgREST RPC; shared staff key authorizes publishing/global history, UUID bearer tokens scope snapshots/events.
- Database: units/share_links/events/private.config; RLS, revoked table access, PK/FK/check constraints, append-only trigger.
- Local persistence: drafts/projects/layouts/notes/settings/credentials in localStorage, pictures in IndexedDB; JSON export is one unit.
- External services: static models/textures/HDRIs, Google Fonts, optional Gemini/Ollama, OSM/Nominatim/Overpass/Open-Meteo. No custom server, ORM or payment system.

## 3. Repository coverage

**587 tracked files** were inventoried: **279 relevant text/structured files** (242 source/config/style/doc files plus 37 glTF manifests), **304 binary media files** and **4 generated graphify-out files**. node_modules/dist/environment files were absent.

All **176 code files**, including **65 test files**, passed AST parsing; imports/exports and **860 direct test/it declarations** were indexed. That is not an executed case count or parameterized-test expansion. **79 code files** received focused manual excerpts review and **97 code files structural-only review**; large focused files still have unreviewed sections. Every relevant path is explicitly classified in Appendix A. All 20 built-in Units ran through actual core validators. All 37 glTF manifests resolved their local references.

### Progress checklist

- [x] Full tracked-file map/classification and code syntax/import/export indexing.
- [x] Manual tracing of high-risk import/publication/event/auth/storage/scene-lifecycle boundaries.
- [x] Isolated non-production probes and built-in graph checks.
- [x] Six reports and staged fix roadmap.
- [ ] Full semantic line-by-line review of every trace/procedural algorithm and every test body. Appendix A marks structural-only files; focused large files also have outstanding portions.
- [ ] Native typecheck/Vitest/build/advisories after authorized dependency setup.
- [ ] Firefox/WebGL/WebXR, accessibility/layout and actual workflow verification.
- [ ] Disposable PostgreSQL/Supabase roles/migrations/concurrency execution and deployed configuration review.
- [ ] Source-image comparison and required benchmark corpus reproduction; external fixture files are missing here.

No complete-semantic-coverage or production-readiness claim is made. Structural scans are useful coverage evidence but do not substitute for algorithm review; absent runtime/dependencies/fixtures prevented the requested full execution checks. The file ledger is the continuation checklist, and no file is silently classified as manually reviewed.

### Executed commands and outcomes

| Command/check | Exit/result | Evidence/limit |
|---|---|---|
| Initial `git status --short` | 0; clean | No pre-existing changes reported |
| `git rev-parse HEAD` | 0 | Commit recorded above |
| `rg --files --hidden` / tracked inventory | 0 | 587 tracked files |
| `node --version`, `npm --version` | 0 | v22.22.1 / 9.2.0 |
| `npm run` | 0 | dev/build/preview/test/typecheck/score30; no lint |
| `npm run build` | **127** | `sh: 1: tsc: not found`; Vite never ran |
| `npm run typecheck` | **127** | `sh: 1: tsc: not found` |
| `npm test` | **127** | `sh: 1: vitest: not found`; zero Vitest tests executed |
| `npm audit --json` (temporary cache, no retries, 15s fetch timeout) | **1** | `getaddrinfo EAI_AGAIN registry.npmjs.org`; no advisory result |
| System Babel AST/import/export/test inventory | 0 | 176 code files parsed; not tsc/build |
| glTF references | Pass | All 37 manifests reference existing local buffers/images |
| Lockfile structural check | Pass | v3, 119 entries including root; production ranges match manifest |
| Redacted credential pattern scan | No matches | Current relevant text; selected key/token/JWT forms only |
| Native Node TS-loader attempt under /tmp | **1** | `ERR_NO_TYPESCRIPT`; host compiled without TS support |
| Babel-based isolated runtime probes under /tmp | 0 | Existing system tools, actual pure modules, mocked network/storage |
| Native browser/score30/SQL validation | Not completed | Dependencies/external fixtures/harness/database runtime absent |
| `npm run lint` | Not invoked | Script/config absent |
| `scripts/verify-share.mjs` | Deliberately not run | Reads .env.local; keyed execution permanently writes live rows |

The dependency-audit failure is a network/tooling result, not a CVE count. Installed compatibility, deprecation and advisory status are **NOT VERIFIED**. No dependency changes were made. See [npm audit documentation](https://docs.npmjs.com/cli/v11/commands/npm-audit/) for the registry-backed check.

### Isolated runtime evidence

The loader used already-installed `/usr/share/nodejs/@babel/core` and its TypeScript plugin, resolved local extensionless/JSON imports and injected synthetic Supabase configuration. Actual project pure modules ran in Node; fetch/storage were mocks. This is narrower than a built browser app. All temporary scripts/logs were under /tmp. No real key/token or production data was used.

| Probe | Actual result |
|---|---|
| Null or throwing storage on sendEvent | Resolved with **0 RPC calls**; action lost |
| Event HTTP 429 | Row discarded, pending=0 |
| Failed dequeue storage write | Same row attempted **4 times**, then mock forced network stop; still pending |
| CSV benign `=1+1` | Emitted unchanged as formula-leading cells |
| Object furniture/finishSlots in isUnit | Accepted; array-method consumer throws |
| Null comment payload in describe | TypeError reading `object` |
| Object-valued comment text | Returned an object as detail (invalid React text child) |
| Project floors=1.5 | Accepted; slotsOf throws `Invalid array length` |
| Second saveOpenings write failure | Returned full; draft changed; preview old |
| Sole-flat replacement with ground drawing | Ground unit removed; level reference retained |
| Tapered-pillar AABB-only endpoint | Actual polygon containment false; dangling warning suppressed |
| Numeric-prefix public AI DNS | 127.audit.example, 10.audit.example, 192.168.audit.example accepted as local |
| Unknown option price | deltaOf accepted 999999999 |
| Malformed `%` route decoder | URIError |
| All built-in Unit validators | **20/20**, zero errors/warnings |

A separate probe showed horizontal arrow nudge on a vertical opening moves its wall offset by one inch (`model.ts:1497`, dx+dy). The action comment explicitly specifies this along-wall behavior; it is an interaction ambiguity to verify, not an extra confirmed defect. No formula was executed and no malformed row was sent to production.

## 4. Complete issue inventory

This inventory includes every distinct finding established within the stated coverage. It is not a guarantee that all repository defects were found. File references use the original commit's line numbers.

| ID | Severity | Problem | File | Confidence | Impact | Fix Complexity |
|---|---|---|---|---|---|---|
| P1-001 | High | Unvalidated buyer event payloads can break the staff list | [supabase/migrations/20261004120000_events.sql:21](../supabase/migrations/20261004120000_events.sql#L21) | Confirmed | High | Medium |
| P1-002 | High | Unit validation accepts crash-inducing nested structures | [src/studio/model.ts:1851](../src/studio/model.ts#L1851) | Confirmed | High | Medium |
| P1-003 | High | Outbox failures lose actions or continuously resend them | [src/lib/events.ts:61](../src/lib/events.ts#L61) | Confirmed | High | Medium |
| P1-004 | High | Replacing the sole flat deletes other level drawings | [src/data/building/projects.ts:91](../src/data/building/projects.ts#L91) | Confirmed | High | Low |
| P1-005 | High | Backend cannot isolate developer organizations | [supabase/migrations/20261003120000_share_links.sql:12](../supabase/migrations/20261003120000_share_links.sql#L12) | Confirmed | High | High |
| P1-006 | High | Public event writes have no application rate limit or quota | [supabase/migrations/20261004120000_events.sql:39](../supabase/migrations/20261004120000_events.sql#L39) | Confirmed | High | Medium |
| P1-007 | High | Share capabilities have no expiry or supported revocation | [supabase/migrations/20261003120000_share_links.sql:19](../supabase/migrations/20261003120000_share_links.sql#L19) | Confirmed | High | Medium |
| P2-001 | Medium | CSV export preserves buyer-controlled spreadsheet formulas | [src/lib/events.ts:182](../src/lib/events.ts#L182) | Confirmed | Medium | Low |
| P2-002 | Medium | Unknown finish options can supply arbitrary prices | [src/lib/events.ts:148](../src/lib/events.ts#L148) | Confirmed | Medium | Medium |
| P2-003 | Medium | Staff history reads and rendering are unbounded | [supabase/migrations/20261004120000_events.sql:66](../supabase/migrations/20261004120000_events.sql#L66) | Strongly supported | Medium | Medium |
| P2-004 | Medium | Late offline actions supersede newer intent by arrival order | [src/lib/events.ts:132](../src/lib/events.ts#L132) | Strongly supported | Medium | Medium |
| P2-005 | Medium | Opening saves partially commit draft and preview | [src/viewer/arrange.ts:178](../src/viewer/arrange.ts#L178) | Confirmed | Medium | Medium |
| P2-006 | Medium | Concurrent tabs overwrite shared local records without revisions | [src/studio/StudioApp.tsx:663](../src/studio/StudioApp.tsx#L663) | Strongly supported | Medium | Medium |
| P2-007 | Medium | Local pins are scoped to Unit ID rather than published link | [src/viewer/storage.ts:37](../src/viewer/storage.ts#L37) | Confirmed | Medium | Low |
| P2-008 | Medium | Stable note anchors are not used to position pins after edits | [src/viewer/storage.ts:19](../src/viewer/storage.ts#L19) | Strongly supported | Medium | Medium |
| P2-009 | Medium | Shared buyer links can expose local staff controls | [src/viewer/ViewerApp.tsx:69](../src/viewer/ViewerApp.tsx#L69) | Confirmed | Medium | Low |
| P2-010 | Medium | Local layouts override immutable published furniture snapshots | [src/viewer/ViewerApp.tsx:218](../src/viewer/ViewerApp.tsx#L218) | Strongly supported | Medium | Low |
| P2-011 | Medium | Project parser accepts invalid counts and references | [src/data/building/projects.ts:403](../src/data/building/projects.ts#L403) | Confirmed | Medium | Low |
| P2-012 | Medium | External operations can wait indefinitely without cancellation | [src/lib/supabase.ts:23](../src/lib/supabase.ts#L23) | Strongly supported | Medium | Medium |
| P2-013 | Medium | Clipboard failures are silent or falsely reported as copied | [src/studio/StudioApp.tsx:889](../src/studio/StudioApp.tsx#L889) | Strongly supported | Medium | Low |
| P2-014 | Medium | WebXR availability initialization has an unhandled rejection path | [src/viewer/ViewerApp.tsx:620](../src/viewer/ViewerApp.tsx#L620) | Strongly supported | Medium | Low |
| P2-015 | Medium | Plan rebuilds leave picking closures on old rooms and finish keys | [src/viewer/ViewerApp.tsx:563](../src/viewer/ViewerApp.tsx#L563) | Strongly supported | Medium | Medium |
| P2-016 | Medium | Pending furniture loads are not reconciled with intervening edits | [src/three/PlotlineScene.ts:736](../src/three/PlotlineScene.ts#L736) | Strongly supported | Medium | Medium |
| P2-017 | Medium | Mirror render targets are not disposed when pieces are rebuilt | [src/furnish/procedural.ts:292](../src/furnish/procedural.ts#L292) | Strongly supported | Medium | Medium |
| P2-018 | Medium | IndexedDB picture writes resolve before transaction commit | [src/studio/pictures.ts:17](../src/studio/pictures.ts#L17) | Strongly supported | Medium | Low |
| P2-019 | Medium | Late image callbacks can attach an old image to another drawing | [src/studio/StudioApp.tsx:470](../src/studio/StudioApp.tsx#L470) | Strongly supported | Medium | Low |
| P2-020 | Medium | External plan images can taint the Auto-trace canvas | [src/studio/StudioApp.tsx:752](../src/studio/StudioApp.tsx#L752) | Strongly supported | Medium | Medium |
| P2-021 | Medium | Tapered columns falsely join walls through their bounding box | [src/core/graph.ts:86](../src/core/graph.ts#L86) | Confirmed | Medium | Medium |
| P2-022 | Medium | Whole-floor drawings lack individual derived-flat viewer routes | [CLAUDE.md:103](../CLAUDE.md#L103) | Strongly supported | Medium | High |
| P2-023 | Medium | No complete portable project and picture backup exists | [src/studio/StudioApp.tsx:805](../src/studio/StudioApp.tsx#L805) | Confirmed | Medium | Medium |
| P2-024 | Medium | Regression corpus and tools depend on absent Windows paths | [scripts/trace-fixtures.mjs:47](../scripts/trace-fixtures.mjs#L47) | Confirmed | Medium | Medium |
| P2-025 | Medium | Database tests assert SQL text instead of actual role behavior | [src/lib/events.test.ts:159](../src/lib/events.test.ts#L159) | Confirmed | Medium | Medium |
| P2-026 | Medium | Controls and spatial interactions lack accessible names/keyboard paths | [src/studio/StudioApp.tsx:2012](../src/studio/StudioApp.tsx#L2012) | Confirmed | Medium | Medium |
| P2-027 | Medium | Site fallback uses the OSM editing API for read-only queries | [src/studio/SitePanel.tsx:22](../src/studio/SitePanel.tsx#L22) | Confirmed | Medium | Low |
| P2-028 | Medium | Secret-key guard omits the documented VITE variable path | [vite.config.ts:4](../vite.config.ts#L4) | Confirmed | Medium | Low |
| P2-029 | Medium | Local AI URL checks accept public DNS names as private IPs | [src/studio/localAI.ts:26](../src/studio/localAI.ts#L26) | Confirmed | Medium | Low |
| P2-030 | Medium | Local AI startup guidance allows every browser origin | [src/studio/localAI.ts:50](../src/studio/localAI.ts#L50) | Potential | Medium | Low |
| P2-031 | Medium | Approved every-element editing remains incomplete | [Docs/MANUAL.md:656](../Docs/MANUAL.md#L656) | Confirmed | Medium | High |
| P2-032 | Medium | Malformed route encoding throws before the unavailable fallback | [src/viewer/ViewerApp.tsx:178](../src/viewer/ViewerApp.tsx#L178) | Confirmed | Medium | Low |
| P2-033 | Medium | Decoded image and graph workloads have no resource budget | [src/studio/StudioApp.tsx:69](../src/studio/StudioApp.tsx#L69) | Potential | Medium | Medium |
| P2-034 | Medium | No committed browser suite verifies the main product workflows | [package.json:6](../package.json#L6) | Confirmed | Medium | Medium |
| P2-035 | Medium | Monitoring and tested recovery are absent from repository evidence | [src/lib/events.ts:114](../src/lib/events.ts#L114) | Confirmed | Medium | Medium |
| P3-001 | Low | No enforced release checks or pinned runtime policy | [package.json:6](../package.json#L6) | Confirmed | Low | Medium |
| P3-002 | Low | Fixed layouts can hide controls in narrow/short windows | [src/studio/studio.css:72](../src/studio/studio.css#L72) | Strongly supported | Low | Medium |
| P3-003 | Low | SEO/social metadata and indexing policy are minimal | [index.html:3](../index.html#L3) | Confirmed | Low | Medium |
| P3-004 | Low | Large orchestration modules and barrel cycles impede isolated changes | [src/studio/StudioApp.tsx:239](../src/studio/StudioApp.tsx#L239) | Confirmed | Low | Medium |
| P3-005 | Low | Archived prototype inserts unescaped data into innerHTML | [plotline_1.2/js/ui/UIController.js:4](../plotline_1.2/js/ui/UIController.js#L4) | Confirmed | Low | Low |
| P3-006 | Low | Archived detector indexes ImageData instead of pixel data | [plotline_1.2/js/editor/ImagePlanDetector.js:15](../plotline_1.2/js/editor/ImagePlanDetector.js#L15) | Confirmed | Low | Low |
| P3-007 | Low | Archived room outline ignores the detected top boundary | [plotline_1.2/js/editor/ImagePlanDetector.js:39](../plotline_1.2/js/editor/ImagePlanDetector.js#L39) | Confirmed | Low | Low |
| P3-008 | Low | Archived workspaces retain old animation loops and listeners | [plotline_1.2/js/app.js:15](../plotline_1.2/js/app.js#L15) | Strongly supported | Low | Medium |
| P3-009 | Low | Archived sun slider never passes its selected hour | [plotline_1.2/js/ui/UIController.js:9](../plotline_1.2/js/ui/UIController.js#L9) | Confirmed | Low | Low |
| P3-010 | Low | Archived Generate 3D rebuilds twice | [plotline_1.2/js/app.js:19](../plotline_1.2/js/app.js#L19) | Confirmed | Low | Low |
| P3-011 | Low | Architecture documents confuse planned and shipped guarantees | [ARCHITECTURE.md:102](../ARCHITECTURE.md#L102) | Confirmed | Low | Low |
| P3-012 | Low | Archived ceiling passes a material as the Mesh geometry argument | [plotline_1.2/js/renderer/ThreeRenderer.js:49](../plotline_1.2/js/renderer/ThreeRenderer.js#L49) | Strongly supported | Low | Low |

## 5. Detailed findings

Each item includes ID/title, severity/confidence, affected paths/lines, evidence/root cause, expected impact, recommended solution, estimated relative fix complexity and regression criteria. Code-confirmed absence/local reproduction is distinguished from deployed-system verification.

### P1-001 — Unvalidated buyer event payloads can break the staff list

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:21](../supabase/migrations/20261004120000_events.sql#L21), [supabase/migrations/20261004120000_events.sql:42](../supabase/migrations/20261004120000_events.sql#L42), [src/lib/events.ts:161](../src/lib/events.ts#L161), [src/viewer/ChangeList.tsx:145](../src/viewer/ChangeList.tsx#L145).

**Evidence and root cause:** SQL checks payload length, not JSON type or fields. JSON null is not SQL NULL and is not excluded. A local describe() probe with null threw TypeError; object-valued text becomes an invalid React child. add_event stores payload verbatim. No live insertion was attempted.

**Expected impact:** A valid link holder can poison the globally aggregated staff history. Append-only rows cannot simply be updated away.

**Recommended solution:** Validate kind-specific payload schemas and references in the RPC; validate returned data and quarantine malformed historical rows in the UI.

**Verification/regression:** In disposable SQL, reject JSON null/arrays/object text; render valid history beside a malformed legacy event without losing the list.

### P1-002 — Unit validation accepts crash-inducing nested structures

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Validation · **Fix complexity:** Medium.

**Affected code:** [src/studio/model.ts:1851](../src/studio/model.ts#L1851), [src/studio/model.ts:1881](../src/studio/model.ts#L1881), [src/studio/StudioApp.tsx:771](../src/studio/StudioApp.tsx#L771), [src/viewer/ViewerApp.tsx:175](../src/viewer/ViewerApp.tsx#L175).

**Evidence and root cause:** isUnit does not validate furniture/finishSlots although its comment says it does. Objects in either field passed the probe, survived normalizeUnit, then crashed array consumers. Site geometry/wind, unique IDs and nested materials are also shallowly checked.

**Expected impact:** Imported, restored or published data can blank the editor/viewer. The 20 built-ins did pass the current validators.

**Recommended solution:** Use one versioned runtime parser at all Unit boundaries; validate nested arrays, finite bounds, enums, IDs and relationships before derivation/rendering.

**Verification/regression:** Reject object arrays, duplicate IDs, invalid kinds/materials and malformed wind; maintain explicit older-export normalization.

### P1-003 — Outbox failures lose actions or continuously resend them

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Data integrity · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.ts:61](../src/lib/events.ts#L61), [src/lib/events.ts:106](../src/lib/events.ts#L106), [src/lib/events.ts:132](../src/lib/events.ts#L132).

**Evidence and root cause:** write() swallows storage failures and drain() reads only storage. Null/throwing stores yielded zero RPC calls and resolved success. Failed dequeue writes repeated the same RPC; the probe stopped it after four calls. All 4xx, including reproduced 429, discard the row.

**Expected impact:** Buyer choices/comments disappear or cause retry loops. Server UUID idempotency avoids duplicate rows but not request load or lost new actions.

**Recommended solution:** Provide memory fallback, durable queue states, checked dequeue, bounded backoff, retryable 408/429 handling and visible permanent rejection. Validate stored queue shape.

**Verification/regression:** Test append/dequeue quota failure, blocked storage, malformed queue, 429/5xx and replay; assert preserved actions and bounded sends.

### P1-004 — Replacing the sole flat deletes other level drawings

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Data integrity · **Fix complexity:** Low.

**Affected code:** [src/data/building/projects.ts:91](../src/data/building/projects.ts#L91), [src/data/building/projects.ts:109](../src/data/building/projects.ts#L109), [src/studio/ProjectPanel.tsx:72](../src/studio/ProjectPanel.tsx#L72).

**Evidence and root cause:** For older projects without plan, removing the last flat returns null. placeFlat then clears units while retaining levels. A probe created one flat plus ground, changed the flat floor range and observed the ground unit disappear while its level reference remained.

**Expected impact:** The reachable older Building workflow can persist loss of ground/basement/roof drawings.

**Recommended solution:** Replace a flat atomically while preserving unrelated unit and level entries; validate references before saving.

**Verification/regression:** Change range/mirror/offset of the sole flat with several levels; all drawings and pictures must remain reachable.

### P1-005 — Backend cannot isolate developer organizations

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** High.

**Affected code:** [supabase/migrations/20261003120000_share_links.sql:12](../supabase/migrations/20261003120000_share_links.sql#L12), [supabase/migrations/20261003120000_share_links.sql:33](../supabase/migrations/20261003120000_share_links.sql#L33), [supabase/migrations/20261004120000_events.sql:55](../supabase/migrations/20261004120000_events.sql#L55).

**Evidence and root cause:** The actual schema has one private staff_key and no organization ownership/membership or staff sessions. events_for_staff returns all links/events after checking that key. RLS and table revokes exist and should remain.

**Expected impact:** Every key holder has global staff scope. This is a blocker for mutually untrusted organizations, not a demonstrated anonymous RLS bypass in a single-founder pilot.

**Recommended solution:** Before multi-org use, add individual authenticated staff, org ownership and scoped checks in each RPC plus RLS. Use revocable expiring sessions instead of a permanent shared browser key.

**Verification/regression:** Test two organizations across publish/list/read/write; retain direct-table denial tests.

### P1-006 — Public event writes have no application rate limit or quota

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:39](../supabase/migrations/20261004120000_events.sql#L39), [supabase/migrations/20261004120000_events.sql:42](../supabase/migrations/20261004120000_events.sql#L42).

**Evidence and root cause:** Any existing token can insert unlimited unique event IDs; only each payload is capped at 8,000 bytes. The migration acknowledges absent throttling. Hosted protections were not inspected.

**Expected impact:** A valid/leaked link can grow permanent history and every staff read; actual capacity/denial of service was not measured.

**Recommended solution:** Enforce transactional per-token and aggregate budgets, bounded requests and monitored ingress; coordinate retryable errors with the repaired outbox.

**Verification/regression:** Exceed a test-token budget in disposable SQL and verify bounded acceptance, independent other-token access and recoverable retries.

### P1-007 — Share capabilities have no expiry or supported revocation

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261003120000_share_links.sql:19](../supabase/migrations/20261003120000_share_links.sql#L19), [supabase/migrations/20261003120000_share_links.sql:36](../supabase/migrations/20261003120000_share_links.sql#L36), [supabase/migrations/20261004120000_events.sql:13](../supabase/migrations/20261004120000_events.sql#L13).

**Evidence and root cause:** share_links stores no expires_at/revoked_at; neither lookup nor event write checks lifecycle. Events reference tokens without delete cascade, so deleting a used link is not a clean revocation path.

**Expected impact:** A disclosed capability keeps revealing its snapshot and accepting actions indefinitely. UUID entropy does not provide expiry.

**Recommended solution:** Add staff-scoped revocation/expiration checked on both reads and writes, retaining historical events.

**Verification/regression:** Expired/revoked links must fail resolve/add_event while staff history survives.

### P2-001 — CSV export preserves buyer-controlled spreadsheet formulas

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Low.

**Affected code:** [src/lib/events.ts:182](../src/lib/events.ts#L182), [src/lib/events.ts:190](../src/lib/events.ts#L190), [src/viewer/ChangeList.tsx:47](../src/viewer/ChangeList.tsx#L47).

**Evidence and root cause:** CSV cell escaping handles delimiters but not formula-leading text. A benign =1+1 probe was exported unchanged from buyer name/comment.

**Expected impact:** A spreadsheet may interpret untrusted text as formulas. No spreadsheet execution or command-execution exploit was attempted.

**Recommended solution:** Neutralize formula-leading/control characters at export, then apply CSV quoting; document display preservation.

**Verification/regression:** Test =,+,-,@, tabs/newlines across all text fields; inspect bytes and supported spreadsheet behavior.

### P2-002 — Unknown finish options can supply arbitrary prices

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.ts:148](../src/lib/events.ts#L148), [src/lib/events.ts:150](../src/lib/events.ts#L150), [supabase/migrations/20261004120000_events.sql:48](../supabase/migrations/20261004120000_events.sql#L48).

**Evidence and root cause:** deltaOf trusts any client integer for an unknown option; the probe returned 999999999. The server binds neither option nor slot/ref to the published unit. Unknown labels/brands are trusted too.

**Expected impact:** Staff totals and CSV can record fabricated requests/prices. No payment system or payment exploit exists here.

**Recommended solution:** Resolve accepted option/slot/price from the token snapshot on the server, including supported custom unit catalogs.

**Verification/regression:** Reject fabricated or wrong-slot options; accept a valid custom option with its authoritative snapshot price.

### P2-003 — Staff history reads and rendering are unbounded

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Performance · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:66](../supabase/migrations/20261004120000_events.sql#L66), [src/lib/events.ts:173](../src/lib/events.ts#L173), [src/viewer/ChangeList.tsx:99](../src/viewer/ChangeList.tsx#L99).

**Evidence and root cause:** The RPC aggregates all links and all events, sorting supersession over history. No page/filter/cap exists. byLink filters the entire event array per link and React renders all rows.

**Expected impact:** Database sorts, payloads and UI work grow with retained history. No production latency benchmark was available.

**Recommended solution:** Add scoped keyset pages, server current-state summaries and paged export/history; index measured query patterns.

**Verification/regression:** Seed representative history in disposable SQL; inspect EXPLAIN, payload bytes and browser render latency.

### P2-004 — Late offline actions supersede newer intent by arrival order

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Data integrity · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.ts:132](../src/lib/events.ts#L132), [supabase/migrations/20261004120000_events.sql:22](../supabase/migrations/20261004120000_events.sql#L22), [supabase/migrations/20261004120000_events.sql:73](../supabase/migrations/20261004120000_events.sql#L73).

**Evidence and root cause:** Events have no logical version/occurrence timestamp. Server receipt time alone determines supersession, so an older offline choice replayed after a newer online choice becomes current.

**Expected impact:** Staff current state can differ from the latest buyer intent across browsers using the same link.

**Recommended solution:** Define a conflict policy and validated logical version; retain occurrence and ingestion time without trusting arbitrary client time as authority.

**Verification/regression:** Queue A offline, submit later B elsewhere, replay A and verify the documented conflict resolution.

### P2-005 — Opening saves partially commit draft and preview

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Data integrity · **Fix complexity:** Medium.

**Affected code:** [src/viewer/arrange.ts:178](../src/viewer/arrange.ts#L178), [src/viewer/arrange.ts:223](../src/viewer/arrange.ts#L223), [src/viewer/ViewerApp.tsx:889](../src/viewer/ViewerApp.tsx#L889).

**Evidence and root cause:** Separate localStorage writes update draft then preview. A forced second-write failure returned full with new draft and old preview; the UI rolls its in-memory plan back. makeDraft has the same shape.

**Expected impact:** The editor, live scene and persisted preview can disagree; retries may report stale plans.

**Recommended solution:** Store one versioned plan in a transaction/single authoritative record and derive views. Detect/recover partial writes until migrated.

**Verification/regression:** Fail each save boundary and reload both views; require all-old or all-new state.

### P2-006 — Concurrent tabs overwrite shared local records without revisions

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Data integrity · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:663](../src/studio/StudioApp.tsx#L663), [src/studio/StudioApp.tsx:682](../src/studio/StudioApp.tsx#L682), [src/data/building/projects.ts:424](../src/data/building/projects.ts#L424), [src/lib/events.ts:132](../src/lib/events.ts#L132).

**Evidence and root cause:** Drafts/projects/layouts/outbox use whole-record read-modify-write. The draft storage listener has no revision/merge protocol; project/layout/outbox coordination is absent. Autosave ignores saveProjects failure.

**Expected impact:** Two editing tabs or delayed autosaves can lose changes/actions silently. Storage events do not provide transactions.

**Recommended solution:** Use revision-aware durable records/transactions and one coordinated writer/drainer, with visible conflict and save-failure recovery.

**Verification/regression:** Interleave two browser contexts saving the same project/outbox; assert no silent loss.

### P2-007 — Local pins are scoped to Unit ID rather than published link

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Data integrity · **Fix complexity:** Low.

**Affected code:** [src/viewer/storage.ts:37](../src/viewer/storage.ts#L37), [src/viewer/ViewerApp.tsx:532](../src/viewer/ViewerApp.tsx#L532), [src/viewer/ViewerApp.tsx:1017](../src/viewer/ViewerApp.tsx#L1017), [src/viewer/ViewerApp.tsx:1201](../src/viewer/ViewerApp.tsx#L1201).

**Evidence and root cause:** All snapshots of one unit use plotline.pins.<unitId>. A note from link A appears locally on B; removing it on B submits the removal to B, not A.

**Expected impact:** Shared-workstation link contexts and staff event history disagree. No cross-device note disclosure was established.

**Recommended solution:** Separate ordinary local notes from token/version/buyer-scoped notes and define server rehydration.

**Verification/regression:** Publish two tokens for one unit; comment/remove independently and verify isolated UI/event streams.

### P2-008 — Stable note anchors are not used to position pins after edits

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Correctness · **Fix complexity:** Medium.

**Affected code:** [src/viewer/storage.ts:19](../src/viewer/storage.ts#L19), [src/viewer/Notes.tsx:35](../src/viewer/Notes.tsx#L35), [src/viewer/ViewerApp.tsx:1052](../src/viewer/ViewerApp.tsx#L1052).

**Evidence and root cause:** Entity IDs/local offsets are stored, but PinLayer projects p.point and focusPin targets that old world point; no current-transform resolution exists.

**Expected impact:** Furniture/opening moves leave notes floating at former positions.

**Recommended solution:** Resolve current entity/local anchors, preserve sufficient hit coordinates and represent deleted targets explicitly.

**Verification/regression:** Move/resize an anchored piece/opening and reload; the note follows or reports deletion.

### P2-009 — Shared buyer links can expose local staff controls

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Authorization UX · **Fix complexity:** Low.

**Affected code:** [src/viewer/ViewerApp.tsx:69](../src/viewer/ViewerApp.tsx#L69), [src/viewer/ViewerApp.tsx:73](../src/viewer/ViewerApp.tsx#L73), [src/viewer/ViewerApp.tsx:1174](../src/viewer/ViewerApp.tsx#L1174), [src/viewer/arrange.ts:20](../src/viewer/arrange.ts#L20).

**Evidence and root cause:** SHARED hides load-screen links, but Hud receives STAFF directly for Arrange/Edit plan. Remembered staff or ?staff=1 works independently of a buyer token/config link. Only opening edits additionally check !TOKEN.

**Expected impact:** The buyer-only UI contract fails and snapshots can be changed locally. This does not grant server publish/global-read authority.

**Recommended solution:** Exclude shared routes in the effective editor predicate and guard handlers/shortcuts as well as buttons.

**Verification/regression:** Open /s/token and ?c links with remembered staff and staff=1; editing must remain unavailable.

### P2-010 — Local layouts override immutable published furniture snapshots

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Data integrity · **Fix complexity:** Low.

**Affected code:** [src/viewer/ViewerApp.tsx:218](../src/viewer/ViewerApp.tsx#L218), [src/viewer/arrange.ts:38](../src/viewer/arrange.ts#L38), [src/studio/StudioApp.tsx:899](../src/studio/StudioApp.tsx#L899).

**Evidence and root cause:** Viewer applies readLayout(u.id) even on token routes. Publications retain the unit ID; local furniture is not scoped to a token/version.

**Expected impact:** One buyer link can show different furniture in an existing staff browser and a clean browser.

**Recommended solution:** Use embedded snapshot furniture on token routes; make any token-scoped local experiment explicit.

**Verification/regression:** Publish new furniture with a conflicting saved layout; compare existing/clean browsers.

### P2-011 — Project parser accepts invalid counts and references

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Validation · **Fix complexity:** Low.

**Affected code:** [src/data/building/projects.ts:403](../src/data/building/projects.ts#L403), [src/data/building/projects.ts:273](../src/data/building/projects.ts#L273), [src/data/building/projects.ts:341](../src/data/building/projects.ts#L341).

**Evidence and root cause:** Any finite plan.floors passes, with little nested validation. floors:1.5 passed then slotsOf threw Invalid array length. Null/missing units, invalid offsets and level references are not rigorously checked; a broad catch can discard the list.

**Expected impact:** Bad/stale storage can crash building views or hide valid projects.

**Recommended solution:** Validate bounded integer counts, nested Units, offsets and references; quarantine individual records.

**Verification/regression:** Test fractional/negative/huge counts, bad references and mixed valid/invalid records.

### P2-012 — External operations can wait indefinitely without cancellation

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Reliability · **Fix complexity:** Medium.

**Affected code:** [src/lib/supabase.ts:23](../src/lib/supabase.ts#L23), [src/studio/SitePanel.tsx:78](../src/studio/SitePanel.tsx#L78), [src/studio/SitePanel.tsx:126](../src/studio/SitePanel.tsx#L126), [src/studio/localAI.ts:59](../src/studio/localAI.ts#L59), [src/trace/ai.ts:145](../src/trace/ai.ts#L145).

**Evidence and root cause:** RPC, wind, geocoding and AI fetches omit deadlines/abort signals. fetchSite waits for wind despite map timeouts. A stalled RPC blocks the serial queue; failed unit loads become unavailable without retry.

**Expected impact:** Publishing/loading/Site/AI may stay busy indefinitely or obscure transient failures.

**Recommended solution:** Add operation-specific deadlines/cancel controls, stale-request cancellation and retryable-versus-not-found states. Allow explicit cancellation for long local model warmup.

**Verification/regression:** Use a never-settling fetch for each workflow; verify cancellation/retry preserves work and avoids duplicate publication.

### P2-013 — Clipboard failures are silent or falsely reported as copied

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** UX · **Fix complexity:** Low.

**Affected code:** [src/studio/StudioApp.tsx:889](../src/studio/StudioApp.tsx#L889), [src/viewer/ViewerApp.tsx:725](../src/viewer/ViewerApp.tsx#L725), [src/viewer/ChangeList.tsx:110](../src/viewer/ChangeList.tsx#L110).

**Evidence and root cause:** Studio swallows clipboard rejection then toasts Link copied; Clipboard API availability is not guarded. Viewer/Changes omit rejection handling. Studio staff-key storage access also precedes its try block.

**Expected impact:** Sharing may succeed while the user receives no copied link or actionable fallback.

**Recommended solution:** Guard clipboard/storage access and present a selectable URL; distinguish publication from copy success.

**Verification/regression:** Test missing/denied clipboard, publication with copy failure and blocked storage.

### P2-014 — WebXR availability initialization has an unhandled rejection path

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Reliability · **Fix complexity:** Low.

**Affected code:** [src/viewer/ViewerApp.tsx:620](../src/viewer/ViewerApp.tsx#L620).

**Evidence and root cause:** The isSessionSupported/emulation promise chain has no catch; toggle() error handling covers a different operation.

**Expected impact:** Browser XR denial can produce unhandled rejection and unexplained VR absence; desktop crash was not reproduced.

**Recommended solution:** Handle startup rejection and availability state; dispose controller/session resources with the scene.

**Verification/regression:** Reject isSessionSupported; assert no unhandled rejection and working desktop viewing.

### P2-015 — Plan rebuilds leave picking closures on old rooms and finish keys

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Correctness · **Fix complexity:** Medium.

**Affected code:** [src/viewer/ViewerApp.tsx:563](../src/viewer/ViewerApp.tsx#L563), [src/viewer/ViewerApp.tsx:596](../src/viewer/ViewerApp.tsx#L596), [src/viewer/ViewerApp.tsx:638](../src/viewer/ViewerApp.tsx#L638), [src/viewer/ViewerApp.tsx:906](../src/viewer/ViewerApp.tsx#L906).

**Evidence and root cause:** The scene effect depends on given and captures unit/rooms/keys. commitPlan changes unit and rebuilds geometry in place without updating that callback. Low-wall edits can merge/split rooms.

**Expected impact:** Note room attribution and finish picks can use outdated faces after topology edits.

**Recommended solution:** Read current model data through refs or re-register callbacks on relevant dependencies without recreating the renderer.

**Verification/regression:** Change/delete a low wall; verify note room IDs and surface finish keys match new faces.

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

### P2-018 — IndexedDB picture writes resolve before transaction commit

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Data integrity · **Fix complexity:** Low.

**Affected code:** [src/studio/pictures.ts:17](../src/studio/pictures.ts#L17).

**Evidence and root cause:** run() resolves on request.onsuccess and omits transaction.oncomplete/onabort. Request success does not guarantee a committed write.

**Expected impact:** A picture can appear saved yet disappear after a later transaction abort.

**Recommended solution:** Resolve durable writes on transaction completion and reject aborts; handle blocked/version-change lifecycle.

**Verification/regression:** Abort after request success; putPicture must reject and a committed write must survive reopening.

### P2-019 — Late image callbacks can attach an old image to another drawing

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Correctness · **Fix complexity:** Low.

**Affected code:** [src/studio/StudioApp.tsx:470](../src/studio/StudioApp.tsx#L470), [src/studio/StudioApp.tsx:589](../src/studio/StudioApp.tsx#L589), [src/studio/StudioApp.tsx:727](../src/studio/StudioApp.tsx#L727), [src/studio/StudioApp.tsx:752](../src/studio/StudioApp.tsx#L752).

**Evidence and root cause:** getPicture checks opening.current, but loadImage/loadPlanSrc and the Image effect have no generation check/cleanup. Old FileReader/Image callbacks may finish after a drawing switch.

**Expected impact:** The wrong raster can be displayed, saved or traced under the new drawing.

**Recommended solution:** Capture drawing/image generations for every loader; abort/detach stale work.

**Verification/regression:** Delay image A, switch/load B, then complete A; B must keep its picture and scale.

### P2-020 — External plan images can taint the Auto-trace canvas

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Correctness · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:752](../src/studio/StudioApp.tsx#L752), [src/studio/StudioApp.tsx:217](../src/studio/StudioApp.tsx#L217), [src/studio/StudioApp.tsx:926](../src/studio/StudioApp.tsx#L926).

**Evidence and root cause:** HTTPS plan sources are accepted without setting crossOrigin; rastersOf calls getImageData outside a failure guard. A visible cross-origin image can therefore be unreadable as pixels.

**Expected impact:** An imported unit can display its plan but fail immediately on Auto-trace.

**Recommended solution:** Load CORS-enabled images into a local Blob or require a local file; catch taint/raster errors and explain recovery.

**Verification/regression:** Test CORS-enabled and non-CORS hosts; require tracing or a controlled attach-local-file prompt.

### P2-021 — Tapered columns falsely join walls through their bounding box

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Geometry · **Fix complexity:** Medium.

**Affected code:** [src/core/graph.ts:86](../src/core/graph.ts#L86), [src/core/graph.ts:139](../src/core/graph.ts#L139), [src/core/geometry.ts:39](../src/core/geometry.ts#L39).

**Evidence and root cause:** The editor stores tapered four-corner pillars, but joinTouching uses their rectangular AABB. A probe endpoint outside the actual polygon but inside its AABB had its dangling warning suppressed.

**Expected impact:** Derived room closure/floors can disagree with the visible column outline.

**Recommended solution:** Use actual convex polygon containment/intersections/rim traversal; retain rectangle fast paths only for rectangles.

**Verification/regression:** Test an AABB-only endpoint and an endpoint truly touching the slanted side.

### P2-022 — Whole-floor drawings lack individual derived-flat viewer routes

**Severity:** P2 · **Confidence:** Strongly supported · **Category:** Incomplete feature · **Fix complexity:** High.

**Affected code:** [CLAUDE.md:103](../CLAUDE.md#L103), [src/data/building/projects.ts:289](../src/data/building/projects.ts#L289), [src/data/building/index.ts:46](../src/data/building/index.ts#L46), [src/three/building.ts:219](../src/three/building.ts#L219), [src/viewer/spawn.ts:38](../src/viewer/spawn.ts#L38).

**Evidence and root cause:** The approved workflow calls for opening each flat separately. setSlot makes one FLATS entry per floor drawing; building picks only carry stem/floor; projectUnit returns the whole Unit. Studio flat derivation is not a viewer selected-flat identity.

**Expected impact:** A multi-apartment drawing opens/shares as a whole floor, not a selected apartment.

**Recommended solution:** Carry derived-flat identity through pick/route/publication and scope presentation/finishes without duplicating the wall graph. Define common-core/floor-instance behavior.

**Verification/regression:** Trace two flats, stack on two floors, open/share each and verify isolation of rooms and finishes.

### P2-023 — No complete portable project and picture backup exists

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Data integrity · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:805](../src/studio/StudioApp.tsx#L805), [src/data/building/projects.ts:424](../src/data/building/projects.ts#L424), [src/studio/pictures.ts:27](../src/studio/pictures.ts#L27), [Docs/MANUAL.md:579](../Docs/MANUAL.md#L579).

**Evidence and root cause:** Export contains only the current Unit and an image name. Projects/layout assignments are localStorage and pictures IndexedDB. No whole-project backup import/export was found; the manual acknowledges browser clearing loses work.

**Expected impact:** A browser-profile loss can destroy stacking, other drawings and source images despite having exported one Unit.

**Recommended solution:** Provide a versioned backup package with every drawing, assignment, picture and required metadata; validate restoration.

**Verification/regression:** Export a multi-drawing project, clear a disposable profile and restore it in another browser.

### P2-024 — Regression corpus and tools depend on absent Windows paths

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Testing · **Fix complexity:** Medium.

**Affected code:** [scripts/trace-fixtures.mjs:47](../scripts/trace-fixtures.mjs#L47), [src/trace/evalio.ts:10](../src/trace/evalio.ts#L10), [src/trace/eval/sheets30.json:3](../src/trace/eval/sheets30.json#L3), [src/trace/eval/score30.test.ts:30](../src/trace/eval/score30.test.ts#L30), [src/trace/sheltechL2.test.ts:33](../src/trace/sheltechL2.test.ts#L33).

**Evidence and root cause:** The fixture generator imports Playwright from E:/dev/Plotline/node_modules; source sheets/caches and external browser harness use E: paths. The 30-sheet corpus is absent here. Several suites skip without fixtures; score30 requires only at least one processed sheet, not all or a quality floor.

**Expected impact:** A clean clone cannot reproduce acceptance evidence, and partial runs can hide gaps.

**Recommended solution:** Use local package resolution/configurable paths, reproducibly supply licensed fixtures and require all selected sheets plus explicit quality baselines in release checks.

**Verification/regression:** Generate/run the required corpus on a clean non-Windows checkout; a missing required sheet must fail.

### P2-025 — Database tests assert SQL text instead of actual role behavior

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Testing · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.test.ts:159](../src/lib/events.test.ts#L159), [scripts/verify-share.mjs:1](../scripts/verify-share.mjs#L1), [supabase/migrations/20261004120000_events.sql:55](../supabase/migrations/20261004120000_events.sql#L55).

**Evidence and root cause:** Committed SQL tests use regex/string checks. Actual SQL execution is referenced only in an external E: temporary script. verify-share reads .env.local and a keyed run permanently inserts records.

**Expected impact:** Grants/RLS/definer/constraint/migration behavior can regress while text assertions pass. Production verification was deliberately not run.

**Recommended solution:** Commit disposable SQL integration tests for every role/RPC, malformed data, append-only/idempotency and migration reruns; prevent production targets.

**Verification/regression:** Run migrations twice and two-tenant denial/valid-operation tests against a disposable database.

### P2-026 — Controls and spatial interactions lack accessible names/keyboard paths

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Accessibility · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:2012](../src/studio/StudioApp.tsx#L2012), [src/studio/StudioApp.tsx:2082](../src/studio/StudioApp.tsx#L2082), [src/studio/LibraryPanel.tsx:44](../src/studio/LibraryPanel.tsx#L44), [src/viewer/Notes.tsx:77](../src/viewer/Notes.tsx#L77), [src/viewer/ChangeList.tsx:73](../src/viewer/ChangeList.tsx#L73), [src/studio/IssueLayer.tsx:92](../src/studio/IssueLayer.tsx#L92).

**Evidence and root cause:** Several metadata/search/note/key inputs use placeholders or nearby text without an associated label. Studio canvas has tabIndex=-1; SVG marks use pointer events without focusable keyboard equivalents. Many property Row controls are correctly wrapped in labels.

**Expected impact:** Screen-reader identification and keyboard access are incomplete; contrast/focus behavior remains browser-unverified.

**Recommended solution:** Add semantic names, keyboard-operable markers and essential spatial alternatives, and manage popover focus/state beyond color.

**Verification/regression:** Inspect accessibility tree and complete import/review/comment with keyboard/screen reader; verify zoom and focus recovery.

### P2-027 — Site fallback uses the OSM editing API for read-only queries

**Severity:** P2 · **Confidence:** Confirmed · **Category:** External integration · **Fix complexity:** Low.

**Affected code:** [src/studio/SitePanel.tsx:22](../src/studio/SitePanel.tsx#L22), [src/studio/SitePanel.tsx:71](../src/studio/SitePanel.tsx#L71), [Docs/SOURCES.md:53](../Docs/SOURCES.md#L53).

**Evidence and root cause:** Overpass failure triggers api.openstreetmap.org/api/0.6/map.json. The code acknowledges this temporary read-only use is contrary to the editing API policy, verified against the official policy during the audit.

**Expected impact:** Production map context depends on an unsupported usage pattern and may be blocked.

**Recommended solution:** Replace with a suitable Overpass provider/extract/read service with attribution, caching and explicit budgets.

**Verification/regression:** Force primary failure and verify the replacement works without calling the editing API.

### P2-028 — Secret-key guard omits the documented VITE variable path

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Low.

**Affected code:** [vite.config.ts:4](../vite.config.ts#L4), [src/lib/supabase.ts:6](../src/lib/supabase.ts#L6), [Docs/SETUP_SUPABASE_ON_VERCEL.md:64](../Docs/SETUP_SUPABASE_ON_VERCEL.md#L64).

**Evidence and root cause:** The build guard checks SUPABASE_KEY only. Client/setup also use VITE_SUPABASE_PUBLISHABLE_KEY, directly exposed by Vite without that key-type guard. configured only checks truthiness.

**Expected impact:** An operator mistake can embed a privileged key in a browser bundle. No actual secret-like credential was found in the checkout scan.

**Recommended solution:** Validate final effective client configuration for both naming paths at build time; reject secret/service-role forms and provide redacted setup examples.

**Verification/regression:** Use synthetic secret/service-role-shaped values in both paths; both must fail before asset output.

### P2-029 — Local AI URL checks accept public DNS names as private IPs

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Low.

**Affected code:** [src/studio/localAI.ts:26](../src/studio/localAI.ts#L26), [src/studio/localAI.ts:39](../src/studio/localAI.ts#L39).

**Evidence and root cause:** Private-address regexes test hostname prefixes instead of IP literals. https://127.audit.example, https://10.audit.example and https://192.168.audit.example all passed the local-only predicate.

**Expected impact:** A configured misleading host can receive plan crops without remote opt-in. This requires configuration; no ordinary-link exfiltration was demonstrated.

**Recommended solution:** Allow http/https, parse exact IP literals and private/loopback ranges; require explicit remote consent for other hosts.

**Verification/regression:** Test literal IPs, IPv6, public numeric-prefix DNS, invalid protocols and explicit remote settings.

### P2-030 — Local AI startup guidance allows every browser origin

**Severity:** P2 · **Confidence:** Potential · **Category:** Security · **Fix complexity:** Low.

**Affected code:** [src/studio/localAI.ts:50](../src/studio/localAI.ts#L50), [src/studio/Panel.tsx:4](../src/studio/Panel.tsx#L4).

**Evidence and root cause:** START_LINE sets OLLAMA_ORIGINS to *. This is setup guidance, not evidence of the current workstation configuration. Local calls have no application authentication.

**Expected impact:** Where browser/server networking permits it, unrelated origins may consume local compute. Actual cross-origin exposure was not tested.

**Recommended solution:** Use the exact Plotline/development origin allowlist, keep loopback binding and document remote setup separately.

**Verification/regression:** With a disposable server, allow Plotline and deny an unrelated origin under supported browsers.

### P2-031 — Approved every-element editing remains incomplete

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Incomplete feature · **Fix complexity:** High.

**Affected code:** [Docs/MANUAL.md:656](../Docs/MANUAL.md#L656), [src/three/materials.ts:126](../src/three/materials.ts#L126), [src/furnish/finishes.ts:30](../src/furnish/finishes.ts#L30), [CLAUDE.md:98](../CLAUDE.md#L98).

**Evidence and root cause:** The approved scope exceeds current controls. The manual lists outside/boundary paint, outdoor finishes, door/curtain materials and steps as unchangeable; zone materials are fixed by kind.

**Expected impact:** Staff cannot perform several explicitly approved edits; no unrelated feature requirements are inferred.

**Recommended solution:** Complete the manual scoreboard incrementally using structured per-instance overrides and editable entities, with separate buyer permissions.

**Verification/regression:** Create/change/export/publish each supported element through UI; unrelated elements must remain unchanged.

### P2-032 — Malformed route encoding throws before the unavailable fallback

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Correctness · **Fix complexity:** Low.

**Affected code:** [src/viewer/ViewerApp.tsx:178](../src/viewer/ViewerApp.tsx#L178), [src/main.tsx:11](../src/main.tsx#L11).

**Evidence and root cause:** decodeURIComponent(m[1]) is outside a catch; the /u/% decoder probe threw URIError. Root has Suspense but no error boundary. Path dispatch also uses broad prefixes.

**Expected impact:** Malformed links can blank the application instead of yielding a controlled error.

**Recommended solution:** Guard decoding, match explicit routes and add a recoverable error boundary with redacted diagnostics.

**Verification/regression:** Open bad escapes/unknown routes and verify a clear fallback and recovery link.

### P2-033 — Decoded image and graph workloads have no resource budget

**Severity:** P2 · **Confidence:** Potential · **Category:** Performance · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:69](../src/studio/StudioApp.tsx#L69), [src/studio/StudioApp.tsx:217](../src/studio/StudioApp.tsx#L217), [src/studio/StudioApp.tsx:771](../src/studio/StudioApp.tsx#L771), [src/core/graph.ts:469](../src/core/graph.ts#L469), [src/three/PlotlineScene.ts:426](../src/three/PlotlineScene.ts#L426).

**Evidence and root cause:** Images cap compressed bytes, not pixels; rastersOf creates full RGBA/gray buffers on the main thread. JSON has no size/entity budget. validate scans wall pairs and setUnit synchronously bakes daylight despite worker-based tracing.

**Expected impact:** Large valid imports can exhaust memory or stall UI before cancellation. No maximum-size stress benchmark was performed.

**Recommended solution:** Define decoded-pixel/graph budgets, preserve old drafts on failure and profile/chunk/offload costly stages as evidence warrants.

**Verification/regression:** Stress accepted/rejected plan sizes and whole-floor graphs on target PCs; measure responsiveness and recovery.

### P2-034 — No committed browser suite verifies the main product workflows

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Testing · **Fix complexity:** Medium.

**Affected code:** [package.json:6](../package.json#L6), [vite.config.ts:15](../vite.config.ts#L15), [Docs/AUTOTRACE_SCORER.md:68](../Docs/AUTOTRACE_SCORER.md#L68).

**Evidence and root cause:** All discovered tests use Vitest Node configuration. Playwright exists in devDependencies, but no committed browser config/spec/repeatable Firefox harness exists; documented acceptance harnesses live outside the repo.

**Expected impact:** DOM, clipboard, focus, storage events, slow assets and actual rendering can regress despite pure tests.

**Recommended solution:** Commit a small isolated Firefox suite for import/trace/review/preview/share/buyer actions plus failure/race cases.

**Verification/regression:** Run from a clean checkout in CI and preserve failure traces/screenshots without real buyer data.

### P2-035 — Monitoring and tested recovery are absent from repository evidence

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Operations · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.ts:114](../src/lib/events.ts#L114), [src/viewer/ViewerApp.tsx:569](../src/viewer/ViewerApp.tsx#L569), [BUILD_PLAN.md:73](../BUILD_PLAN.md#L73).

**Evidence and root cause:** Failures mainly become console warnings/toasts. No structured error reporting, synthetic health check, backup-restore test or rollback runbook was found. Backup intent in BUILD_PLAN is not execution evidence.

**Expected impact:** Lost buyer actions, malformed publications and renderer failures can go unnoticed; service/profile-loss recovery is unverified. External provider arrangements may exist.

**Recommended solution:** Add redacted diagnostics, synthetic link monitoring, queue/rejection signals, tested backups and rollback; avoid tokens/keys/buyer text in logs.

**Verification/regression:** Trigger controlled failures, verify signals, restore staging data and rehearse rollback.

### P3-001 — No enforced release checks or pinned runtime policy

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Operations · **Fix complexity:** Medium.

**Affected code:** [package.json:6](../package.json#L6), [vite.config.ts:15](../vite.config.ts#L15).

**Evidence and root cause:** No CI workflow, engines/runtime pin, lint script or lint configuration was found. Lockfile root production ranges match the manifest. Missing audit dependencies are an environment limit, not this defect.

**Expected impact:** Build/test/runtime differences may reach deployment without a required gate; lint absence alone proves no code bug.

**Recommended solution:** Pin supported runtime, use npm ci in CI and gate releases on native build/typecheck/tests/essential SQL/browser checks.

**Verification/regression:** A clean ephemeral release run must pass, and a deliberate failing check must block deployment.

### P3-002 — Fixed layouts can hide controls in narrow/short windows

**Severity:** P3 · **Confidence:** Strongly supported · **Category:** UX · **Fix complexity:** Medium.

**Affected code:** [src/studio/studio.css:72](../src/studio/studio.css#L72), [src/studio/studio.css:112](../src/studio/studio.css#L112), [src/studio/studio.css:335](../src/studio/studio.css#L335), [src/viewer/viewer.css:49](../src/viewer/viewer.css#L49), [src/viewer/viewer.css:64](../src/viewer/viewer.css#L64), [src/index.css:16](../src/index.css#L16).

**Evidence and root cause:** Studio reserves 270+320 px sidebars; Site is 512 px with a 480 px map. Viewer HUD/nav do not wrap, body hides overflow, and active CSS has no media queries.

**Expected impact:** Small desktop windows/zoom/tablets can lose usable canvas or controls. Exact overlap is not browser-verified; PC-first scope lowers mobile urgency.

**Recommended solution:** Make panels collapsible, bound popovers and define wrap/overflow/minimum-supported desktop dimensions.

**Verification/regression:** Check 1366×768, narrow windows, 200% zoom and touch in Firefox.

### P3-003 — SEO/social metadata and indexing policy are minimal

**Severity:** P3 · **Confidence:** Confirmed · **Category:** SEO · **Fix complexity:** Medium.

**Affected code:** [index.html:3](../index.html#L3), [src/main.tsx:11](../src/main.tsx#L11), [vercel.json:2](../vercel.json#L2).

**Evidence and root cause:** HTML has a static title without description/canonical/Open Graph/Twitter metadata. No robots/sitemap was found. All routes receive the SPA entry, including staff/token routes.

**Expected impact:** Public previews are weak and private-route indexing policy is undefined. Robots does not protect capability secrecy.

**Recommended solution:** Define public marketing routes/metadata and intentional noindex for staff/token views; never list capability URLs in sitemaps.

**Verification/regression:** Inspect deployed HTML/headers and public previews without sending private links to crawlers.

### P3-004 — Large orchestration modules and barrel cycles impede isolated changes

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Maintainability · **Fix complexity:** Medium.

**Affected code:** [src/studio/StudioApp.tsx:239](../src/studio/StudioApp.tsx#L239), [src/studio/model.ts:5](../src/studio/model.ts#L5), [src/trace/solve.ts:1](../src/trace/solve.ts#L1), [src/furnish/procedural.ts:1](../src/furnish/procedural.ts#L1), [src/core/flats.ts:23](../src/core/flats.ts#L23), [src/core/index.ts:109](../src/core/index.ts#L109).

**Evidence and root cause:** StudioApp/model/solve/procedural contain 2327/1912/3398/2454 lines. UI/storage/publication/worker ownership is concentrated, and core leaves import their re-exporting barrel. No circular-initialization crash was demonstrated.

**Expected impact:** Persistence/async behavior is hard to isolate and review; framework replacement is not justified.

**Recommended solution:** Extract storage/schema/loader/worker boundaries in small steps; use leaf imports internally and preserve pure core contracts.

**Verification/regression:** Run existing regressions plus lifecycle tests after each extraction.

### P3-005 — Archived prototype inserts unescaped data into innerHTML

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy security · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/ui/UIController.js:4](../plotline_1.2/js/ui/UIController.js#L4), [plotline_1.2/js/ui/UIController.js:6](../plotline_1.2/js/ui/UIController.js#L6), [plotline_1.2/js/renderer/ThreeRenderer.js:59](../plotline_1.2/js/renderer/ThreeRenderer.js#L59).

**Evidence and root cause:** Project/client/type/status and room names enter raw HTML templates. The archive is reference-only and not a production Vite entry; no equivalent active React sink was demonstrated.

**Expected impact:** If served with untrusted data the archive can execute markup in its origin. No active production XSS was established.

**Recommended solution:** Keep archive out of deployable roots or use textContent/DOM construction before reusing it.

**Verification/regression:** On an isolated origin, verify benign markup names render literally after correction.

### P3-006 — Archived detector indexes ImageData instead of pixel data

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy correctness · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/editor/ImagePlanDetector.js:15](../plotline_1.2/js/editor/ImagePlanDetector.js#L15), [plotline_1.2/js/editor/ImagePlanDetector.js:53](../plotline_1.2/js/editor/ImagePlanDetector.js#L53).

**Evidence and root cause:** Both detector paths index data[i] after receiving ctx.getImageData(...), whose channels are data.data[i].

**Expected impact:** Darkness checks read undefined and fail to identify actual wall ink in the archived auto-room tool.

**Recommended solution:** If keeping archive runnable, pass ImageData.data to both routines; do not port the old heuristic into the active tracer.

**Verification/regression:** Detect a synthetic rectangle with known dark boundary pixels.

### P3-007 — Archived room outline ignores the detected top boundary

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy correctness · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/editor/ImagePlanDetector.js:39](../plotline_1.2/js/editor/ImagePlanDetector.js#L39).

**Evidence and root cause:** The first two polygon points use left/right horizontal-ray hits at source.y, instead of top.y, despite detecting top.

**Expected impact:** After pixel-access repair the outline still omits the room upper section and reports wrong area.

**Recommended solution:** Use left/right x combined with top/bottom y for this rectangular legacy heuristic.

**Verification/regression:** Center-click a known rectangle and assert its complete outline/area.

### P3-008 — Archived workspaces retain old animation loops and listeners

**Severity:** P3 · **Confidence:** Strongly supported · **Category:** Legacy performance · **Fix complexity:** Medium.

**Affected code:** [plotline_1.2/js/app.js:15](../plotline_1.2/js/app.js#L15), [plotline_1.2/js/editor/PlanEditor.js:7](../plotline_1.2/js/editor/PlanEditor.js#L7), [plotline_1.2/js/renderer/ThreeRenderer.js:62](../plotline_1.2/js/renderer/ThreeRenderer.js#L62).

**Evidence and root cause:** Every workspace creates new renderer/editor objects without teardown; recursive rAF and document/window listeners survive dashboard DOM replacement.

**Expected impact:** Repeated archived project opening wastes CPU/GPU and duplicates handlers. Active PlotlineScene has separate substantial teardown.

**Recommended solution:** Keep archive inert or add explicit disposal, rAF cancellation and listener ownership.

**Verification/regression:** Open/close multiple archived projects; only one renderer/input-handler set may remain.

### P3-009 — Archived sun slider never passes its selected hour

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy correctness · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/ui/UIController.js:9](../plotline_1.2/js/ui/UIController.js#L9), [plotline_1.2/js/renderer/ThreeRenderer.js:51](../plotline_1.2/js/renderer/ThreeRenderer.js#L51).

**Evidence and root cause:** The handler calls sunUpdate without a value; sunUpdate hardcodes t=12. Active viewer has a separate site/date-aware implementation.

**Expected impact:** The archived slider does not change sunlight.

**Recommended solution:** Pass/store selected hour if maintaining the prototype.

**Verification/regression:** Move slider away from noon and assert changed sun position.

### P3-010 — Archived Generate 3D rebuilds twice

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy performance · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/app.js:19](../plotline_1.2/js/app.js#L19), [plotline_1.2/js/app.js:18](../plotline_1.2/js/app.js#L18).

**Evidence and root cause:** generate calls renderer.generate then setMode(3d), which calls it again when rooms exist. clear removes objects without resource disposal.

**Expected impact:** Redundant geometry work and resource churn per click in the archive.

**Recommended solution:** Choose one rebuild owner and dispose replaced resources if maintaining it.

**Verification/regression:** One click must invoke exactly one scene build.

### P3-011 — Architecture documents confuse planned and shipped guarantees

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Documentation · **Fix complexity:** Low.

**Affected code:** [ARCHITECTURE.md:102](../ARCHITECTURE.md#L102), [BUILD_PLAN.md:1](../BUILD_PLAN.md#L1), [CLAUDE.md:19](../CLAUDE.md#L19), [Docs/SOURCES.md:103](../Docs/SOURCES.md#L103).

**Evidence and root cause:** Target docs describe tenant tables, signed links, compressed/per-room assets and older Android/Bangla priorities absent or superseded in code. MANUAL/SOURCES better describe current browser-only storage.

**Expected impact:** Maintainers can assume security/persistence/performance guarantees that are only plans.

**Recommended solution:** Label current versus planned behavior and reconcile data/API names, scope and current deployment limits.

**Verification/regression:** Trace every implemented-table/route/command/guarantee claim to code or repeatable checks.

### P3-012 — Archived ceiling passes a material as the Mesh geometry argument

**Severity:** P3 · **Confidence:** Strongly supported · **Category:** Legacy correctness · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/renderer/ThreeRenderer.js:49](../plotline_1.2/js/renderer/ThreeRenderer.js#L49).

**Evidence and root cause:** ceiling() constructs new THREE.Mesh(new THREE.MeshStandardMaterial(...)), then assigns geometry afterward. Mesh expects geometry first and material second; construction can inspect geometry before that later assignment, and the intended ceiling material is never set in the material argument.

**Expected impact:** Archived scene generation can fail when creating ceilings, or use the wrong material. No r128 browser execution was available; the active renderer uses a different path.

**Recommended solution:** If keeping the archive runnable, construct Mesh(geo, material) directly and retain proper disposal.

**Verification/regression:** Generate a simple archived three-vertex room using its declared r128 dependency and assert no exception plus the intended ceiling material.


## 6. Security findings

[SECURITY_AUDIT.md](SECURITY_AUDIT.md) separates confirmed defects and conditional risks, records controls worth retaining and maps findings to OWASP risk families. No secret values were printed, no production records were read and no CVEs were guessed. Advisory status is NOT VERIFIED. CSV recommendations follow [OWASP's CSV Injection reference](https://github.com/OWASP/www-community/blob/master/pages/attacks/CSV_Injection.md). OSM usage was verified against the [official editing API policy](https://operations.osmfoundation.org/policies/api/).

## 7. Performance findings

[PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md) records measured filesystem sizes separately from unmeasured runtime risks. The public directory is 97,837,141 bytes (~93.3 MiB), not an asserted initial payload. Serial whole-layout loading, history growth, GPU ownership and main-thread derivation/baking are concrete profiling sites. No throughput/FPS/user-capacity numbers are invented. PC/WebXR priorities supersede old phone budgets.

## 8. Missing features and incomplete implementations

- Organization accounts/membership/scoped staff sessions, capability lifecycle and per-link write budgets are absent from actual SQL (P1-005–P1-007).
- Approved whole-floor workflow does not yet expose individual derived flats as viewer/shared identities (P2-022).
- Full project/picture backup/restore is missing; single-unit export is narrower (P2-023).
- The approved every-element scoreboard remains incomplete for outdoor surfaces, outside paint, door/curtain materials and steps (P2-031).
- Auto-trace is a draft/review system, not guaranteed reconstruction. The manual records remaining missing/misgrouped rooms and limits for common levels. Historical percentages/timings in Docs/HANDOFF were **not reproduced by this audit**. External benchmark/harness portability is incomplete (P2-024).
- Documented Draco/KTX2 and per-room asset activation targets are not present in loader wiring. Whether compression is release-critical needs target-PC measurements.
- Repeatable browser, isolated SQL, monitoring/restore and release workflows are missing from the repository (P2-025/P2-034/P2-035/P3-001).
- Bangla, payments, marketplace, native apps and other explicitly deferred ideas are not invented defects. Base price display is deliberately absent; structured finish deltas exist.

## 9. Technical debt and implementation strengths

The main debt is ownership at system boundaries: related draft/project/preview/layout state is duplicated, asynchronous callbacks carry old snapshots, and runtime type claims exceed validation. Large orchestration files make these paths hard to test. Small extractions of persistence, runtime schemas, network/lifecycle and scene object loading are justified. Replacing the framework/router/state stack is not.

Preserve wall-graph authority, derived rooms/flats, arbitrary-angle geometry, meter/integer-BDT conventions, stable entity IDs, pure core signatures, deterministic furnishing, structured finishes, the shared Tower adapter and append-only/idempotent event intent. Preserve RLS/table revokes, explicit definer search_path, atomic unit/link insertion, fallback assets and quality controls. The validator-clean 20 built-ins and complete 37-manifest local references are positive evidence, not visual/end-to-end correctness proof.

No package was confidently identified as unused: React/Three/Tesseract/Vite/Vitest are referenced, and Playwright/iwer support optional dev/verification paths. The hardcoded Playwright import is a portability defect, not proof the dependency should be removed. No deprecation/version-vulnerability/installed compatibility claim is made without runtime/registry evidence.

## 10. Recommended fix order

[FIX_PRIORITY_ROADMAP.md](FIX_PRIORITY_ROADMAP.md) gives dependencies and exit criteria: data loss/schema/access/lifecycle first, persistence and broken interactions next, then reproducible production checks, measured performance/boundary refactoring and UX/approved enhancements. Keep archived code work last unless intentionally served.

## 11. Production readiness checklist

| Area | Status | Basis |
|---|---|---|
| Source syntax inventory | PASS (limited) | 176 Babel parses; not type/build validation |
| Build | NOT VERIFIED | tsc absent; build stopped before Vite |
| Typecheck | NOT VERIFIED | Missing compiler |
| Native unit tests | NOT VERIFIED | vitest absent; 65 files indexed, not executed |
| Isolated probe execution | PASS | Harness succeeded and reproduced named defects; not an application pass |
| Built-in graph consistency | PASS (limited) | All 20 passed actual project validators |
| Asset local-reference integrity | PASS | All 37 glTF manifests resolved |
| Dependency advisories/compatibility | NOT VERIFIED | Registry DNS failure, absent installed tree |
| Event/Unit/project input validation | FAIL | P1-001/P1-002/P2-011 |
| Buyer action durability | FAIL | P1-003 |
| Project editing data integrity | FAIL | P1-004/P2-005/P2-006 |
| Multi-organization staff access | FAIL | P1-005; condition before multi-org deployment |
| Capability lifecycle/abuse controls | FAIL | P1-006/P1-007 |
| RLS/direct-table denial in source | PASS (limited) | Enabled/revoked in SQL; deployed state not queried |
| Actual database role/RPC behavior | NOT VERIFIED | No disposable/live SQL execution |
| API payload/price contracts | FAIL | P1-001/P2-002 |
| PK/FK/check/index declarations | PASS (limited) | Present; query workload suitability unverified |
| Non-destructive migration intent | PASS (source) | No destructive rewrite/DROP found; publish inserts atomically |
| Current-text secret patterns | PASS (limited) | No selected matches; history/env/accounts not inspected |
| Effective browser-key guard | FAIL | P2-028 |
| CSV export safety | FAIL | P2-001 |
| Deployed CORS/TLS/CSP/headers | NOT VERIFIED | Repository cannot establish hosted settings |
| Firefox/WebXR/device workflows | NOT VERIFIED | Browser/dependency setup absent |
| Accessibility | FAIL (source) | P2-026; contrast/assistive behavior not verified |
| Target performance/load capacity | NOT VERIFIED | Filesystem sizes only, no GPU/FPS/network benchmark |
| Bounded history reads | FAIL | P2-003 |
| CI/release gate | FAIL | No committed gate/runtime policy |
| Monitoring/restore/rollback | FAIL (repo evidence) | P2-035; external arrangements not inspected |
| Complete project portability | FAIL | Unit export does not include project/pictures |
| SEO/private indexing policy | FAIL (minimal) | P3-003; no private-link crawler test |
| Custom API server/ORM | NOT APPLICABLE | Direct Supabase RPC, no separate app server/ORM |
| Payments | NOT APPLICABLE | No payment implementation |

## 12. Final recommendations

1. **Five most important problems:** P1-004 project loss, P1-003 buyer-event loss/retry, P1-001 malformed event crash, P1-002 Unit parsing and P1-005 global staff scope.
2. **Solve immediately:** the data-loss/crash boundaries, then tenant-safe access, write budgets and revocable/expiring links before customer expansion. CSV/price/config safeguards can proceed alongside them.
3. **Production failure triggers:** invalid persisted/published data, blocked/quota storage, concurrent tabs, sole-flat replacement, unbounded history, stalled fetches and slow-asset editing races. Each ticket names its trigger; capacity is not benchmarked.
4. **Urgent security:** server-side event/option validation, actual resource ownership, quotas/token lifecycle, CSV neutralization and both effective client-key paths. No anonymous SQL/table-read bypass or actual secret leak was established.
5. **Justified changes:** shared runtime parsers, transaction/revision-backed persistence, authenticated scoped backend, history pages/summaries and explicit async/GPU ownership. Keep a single authoritative graph.
6. **Keep in principle:** stack/core API, deterministic presets, derived entities, structured finishes, asset registry, append-only/idempotency design, direct-table denial and quality fallback. Strengthen boundaries instead of rewriting them.
7. **First production-ready batch:** reproduce/fix P1-004/P1-003/P1-001/P1-002, back up local work before migrations, then implement actual backend scope/lifecycle. Require successful clean build/native suite/disposable SQL/Firefox/advisories before claiming readiness.

## Appendix A. Per-file coverage and interactions

**AST only** means full-file parsing/import-export indexing, not manual algorithm/test-body review. **Focused manual excerpts** also does not mean every line of a large file. Finding references identify relevant reviewed paths. JSON validators are not source-image comparisons. Docs received indexing/selected checks; the 591,706-byte historical HANDOFF was not fully manually read. All structural-only files and unreviewed portions remain explicit audit work.

| File | Lines | Coverage | Purpose and interactions |
|---|---:|---|---|
| `.gitignore` | 16 | Manual entry/config review | Entry/build/config/style/script |
| `ARCHITECTURE.md` | 138 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `BUILD_PLAN.md` | 92 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `CLAUDE.md` | 204 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/AUTOTRACE_100.md` | 283 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/AUTOTRACE_SCOREBOARD.md` | 340 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/AUTOTRACE_SCORER.md` | 116 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/AUTOTRACE_STRATEGY.md` | 191 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/GITHUB_COMMANDS.md` | 6 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/KEYS.md` | 274 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/MANUAL.md` | 690 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/PRODUCT_PHILOSOPHY.md` | 90 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/PRODUCT_SPEC.md` | 253 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/Plotline masterplan v2.md` | 96 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/SETUP_SUPABASE_ON_VERCEL.md` | 167 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `Docs/SOURCES.md` | 144 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `HANDOFF.md` | 1098 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `README.md` | 32 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `index.html` | 14 | Manual entry/config review | Entry/build/config/style/script |
| `package-lock.json` | 1856 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `package.json` | 32 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `plotline_1.2/Docs/projectGoal.md` | 254 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `plotline_1.2/README.md` | 22 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `plotline_1.2/index.html` | 21 | Manual entry/config review | Archived prototype |
| `plotline_1.2/js/app.js` | 26 | AST + focused manual excerpts | Archived prototype. Exports: (entry/side effects). Imports: ./state/AppState.js, ./project/ProjectStore.js, ./project/ProjectSerializer.js, ./core/Modal.js, ./editor/PlanEditor.js, ./renderer/ThreeRenderer.js, ./ui/UIController.js |
| `plotline_1.2/js/core/Geometry.js` | 7 | AST + focused manual excerpts | Archived prototype. Exports: Geometry. Imports: none |
| `plotline_1.2/js/core/Modal.js` | 5 | AST + focused manual excerpts | Archived prototype. Exports: Modal. Imports: none |
| `plotline_1.2/js/core/Units.js` | 7 | AST + focused manual excerpts | Archived prototype. Exports: Units. Imports: none |
| `plotline_1.2/js/editor/ImagePlanDetector.js` | 87 | AST + focused manual excerpts | Archived prototype. Exports: ImagePlanDetector. Imports: ../core/Geometry.js |
| `plotline_1.2/js/editor/PlanEditor.js` | 48 | AST + focused manual excerpts | Archived prototype. Exports: PlanEditor. Imports: ../core/Geometry.js, ../core/Units.js, ./ImagePlanDetector.js |
| `plotline_1.2/js/project/ProjectSerializer.js` | 4 | AST + focused manual excerpts | Archived prototype. Exports: ProjectSerializer. Imports: none |
| `plotline_1.2/js/project/ProjectStore.js` | 11 | AST + focused manual excerpts | Archived prototype. Exports: ProjectStore. Imports: none |
| `plotline_1.2/js/renderer/ThreeRenderer.js` | 76 | AST + focused manual excerpts | Archived prototype. Exports: ThreeRenderer. Imports: ../core/Geometry.js, ../core/Units.js |
| `plotline_1.2/js/state/AppState.js` | 11 | AST + focused manual excerpts | Archived prototype. Exports: AppState. Imports: none |
| `plotline_1.2/js/ui/ModalFactory.js` | 1 | AST + focused manual excerpts | Archived prototype. Exports: ModalFactory. Imports: none |
| `plotline_1.2/js/ui/UIController.js` | 10 | AST + focused manual excerpts | Archived prototype. Exports: UIController. Imports: none |
| `plotline_1.2/styles/components.css` | 1 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `plotline_1.2/styles/layout.css` | 1 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `plotline_1.2/styles/tokens.css` | 1 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `plotline_1.2/styles/viewport.css` | 26 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `public/assets/MANIFEST.md` | 128 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `public/assets/models/anthurium_botany_01/anthurium_botany_01_1k.gltf` | 584 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/armchair_01/ArmChair_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/calathea_orbifolia_01/calathea_orbifolia_01_1k.gltf` | 506 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/ceiling_fan/ceiling_fan_1k.gltf` | 267 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/ceramic_vase_01/ceramic_vase_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/chandelier_01/Chandelier_01_1k.gltf` | 243 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/classicnightstand_01/ClassicNightstand_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/coffee_table_round_01/coffee_table_round_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/covered_car/covered_car_1k.gltf` | 523 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/dining_chair_02/dining_chair_02_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/drawer_cabinet/drawer_cabinet_1k.gltf` | 447 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/electric_stove/electric_stove_1k.gltf` | 1675 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/fern_02/fern_02_1k.gltf` | 392 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/hanging_picture_frame_01/hanging_picture_frame_01_1k.gltf` | 339 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/metal_office_desk/metal_office_desk_1k.gltf` | 739 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/mid_century_lounge_chair/mid_century_lounge_chair_1k.gltf` | 159 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/modern_arm_chair_01/modern_arm_chair_01_1k.gltf` | 268 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/modern_ceiling_lamp_01/modern_ceiling_lamp_01_1k.gltf` | 340 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/modern_coffee_table_01/modern_coffee_table_01_1k.gltf` | 156 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/modern_wooden_cabinet/modern_wooden_cabinet_1k.gltf` | 595 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/modular_street_seating/modular_street_seating_1k.gltf` | 1363 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/ottoman_01/Ottoman_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/outdoor_table_chair_set_01/outdoor_table_chair_set_01_1k.gltf` | 355 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/pachira_aquatica_01/pachira_aquatica_01_1k.gltf` | 740 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/painted_wooden_chair_01/painted_wooden_chair_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/potted_plant_01/potted_plant_01_1k.gltf` | 430 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/potted_plant_02/potted_plant_02_1k.gltf` | 357 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/potted_plant_04/potted_plant_04_1k.gltf` | 391 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/round_wooden_table_01/round_wooden_table_01_1k.gltf` | 228 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/side_table_01/side_table_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/sofa_01/Sofa_01_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/sofa_02/sofa_02_1k.gltf` | 238 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/sofa_03/sofa_03_1k.gltf` | 253 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/throw_pillows_01/throw_pillows_01_1k.gltf` | 251 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/wall_clock/wall_clock_1k.gltf` | 491 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/wooden_display_shelves_01/wooden_display_shelves_01_1k.gltf` | 374 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/assets/models/wooden_table_02/wooden_table_02_1k.gltf` | 155 | Structured asset inspection | All referenced local buffers/images exist; binary/visual content not reviewed |
| `public/favicon.svg` | 1 | Text index/scan; selected passages | Full narrative review outstanding, especially historical HANDOFF/docs |
| `scripts/trace-fixtures.mjs` | 73 | AST + focused manual excerpts | Entry/build/config/style/script. Exports: (entry/side effects). Imports: node:fs, node:path, node:url |
| `scripts/verify-share.mjs` | 77 | AST + focused manual excerpts | Entry/build/config/style/script. Exports: (entry/side effects). Imports: node:fs |
| `src/core/banani-levels.test.ts` | 79 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/banani-b1.json, ../data/units/banani-b2.json, ../data/units/banani-ground.json, ../data/units/banani-roof.json, ../data/units/banani-typical.json, ../data/building, ../data/building/banani-tower, ./index, ./index |
| `src/core/dmd-levels.test.ts` | 141 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/dmd-b1.json, ../data/units/dmd-b2.json, ../data/units/dmd-ground.json, ../data/units/dmd-roof.json, ../data/units/dmd-typical.json, ../data/building, ../data/building/dmd-tower, ./index, ./index |
| `src/core/flats.test.ts` | 148 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index, ./index |
| `src/core/flats.ts` | 116 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: Flat, LOW_WALL_M, isCore, deriveFlats. Imports: ./geometry, ./graph, ./index, ./types |
| `src/core/geometry.test.ts` | 252 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index |
| `src/core/geometry.ts` | 386 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: Pt, Bounds, Graph, WallPiece, EPS, AREA_EPS, vertexMap, pillarCorners, cross, signedArea, polygonCentroid, pointInPolygon, mainRectangle, outlineBox, printedSizeCheck, unitBounds, wallFrame, wallPieces, roomPolygon, roomInnerPolygon, triangulate, nearestWall, roomLevelAt, roomAt. Imports: ./types |
| `src/core/graph.test.ts` | 303 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index |
| `src/core/graph.ts` | 551 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: TOUCH_M, flatTypeOf, deriveRooms, floorLevelAt, MIN_LABELLED_AREA_SQM, validate. Imports: ./types, ./geometry |
| `src/core/ids.ts` | 2 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: newId. Imports: none |
| `src/core/index.ts` | 154 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: newId, Pt, Bounds, Graph, WallPiece, deriveRooms, validate, MIN_LABELLED_AREA_SQM, TOUCH_M, wallFrame, wallPieces, roomPolygon, roomInnerPolygon, triangulate, signedArea, pointInPolygon, unitBounds, polygonCentroid, pillarCorners, mainRectangle, outlineBox, printedSizeCheck, nearestWall, roomAt, roomLevelAt, floorLevelAt, isOutdoor, parseLength, formatFeetInches, FT, sqmToSqft, mirrorUnit, LOW_WALL_M, deriveFlats, isCore, Flat, flatTypeOf, vertexById, DHAKA, DHAKA_WIND, sunPosition, sunAt, siteAnchor, siteToPlan, bearingInPlan, sitePlan, siteFromOverpass, waysFromOsmMap, windFromDaily, emptySite, setBlockHeight, removeFromSite, roomWind, sheltered, compassName, point16, words16, bearingOf, seasonOf, SEASON_NAME, windWords, monthLine, seasonNote, openingName, windSentence, Season, SHELTER_M, HEIGHT_GUESS_M, RoomWind, WindOpening. Imports: ./types, ./types |
| `src/core/levels.test.ts` | 128 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index, ./index, ../data/units/type-a.json, ../data/fixtures/ground-sample |
| `src/core/mirror.test.ts` | 113 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index, ./index |
| `src/core/mirror.ts` | 44 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: mirrorUnit. Imports: ./geometry, ./types |
| `src/core/sheltech-a.test.ts` | 118 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/sheltech-a.json, ./index, ./index |
| `src/core/sheltech-b.test.ts` | 121 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ./index, ./index |
| `src/core/sheltech-levels.test.ts` | 209 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/sheltech-ground.json, ../data/units/sheltech-b1.json, ../data/units/sheltech-b2.json, ../data/units/sheltech-roof.json, ../data/units/sheltech-l1.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ../data/fixtures/founder-sheltech-a-draft.json, ../data/building/demo-tower, ./index, ./index |
| `src/core/site.test.ts` | 276 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/fixtures/overpass-banani.json, ./graph, ./site, ./types |
| `src/core/site.ts` | 401 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: DHAKA, DHAKA_WIND, sunPosition, sunAt, siteAnchor, siteToPlan, bearingInPlan, sitePlan, STOREY_GUESS_M, HEIGHT_GUESS_M, siteFromOverpass, waysFromOsmMap, windFromDaily, emptySite, setBlockHeight, removeFromSite, WindOpening, RoomWind, roomWind, SHELTER_M, sheltered, compassName, point16, words16, bearingOf, Season, seasonOf, SEASON_NAME, windWords, monthLine, seasonNote, openingName, windSentence. Imports: ./geometry, ./index, ./types |
| `src/core/type-a.test.ts` | 52 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/type-a.json, ./index, ./index |
| `src/core/type-b.test.ts` | 83 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/type-b.json, ./index, ./index |
| `src/core/type-c.test.ts` | 93 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/type-c.json, ./index, ./index |
| `src/core/types.ts` | 320 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: Id, Vertex, OpeningKind, Opening, Wall, RoomKind, Slope, RoomLabel, Room, MaterialRef, FinishOption, FinishSlot, FurniturePlacement, Pillar, Unit, Site, SiteBuilding, SiteRoad, WindMonth, Configuration, ValidationIssue. Imports: none |
| `src/core/units.test.ts` | 43 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./index |
| `src/core/units.ts` | 38 | AST + focused manual excerpts | Pure graph/geometry/site contract. Exports: FT, sqmToSqft, parseLength, formatFeetInches. Imports: none |
| `src/data/building/banani-tower.ts` | 66 | AST + focused manual excerpts | Unit/tower/project/reference data. Exports: FLOOR_M, FLATS, FLOORS, LEVELS, CORE, GROUND, ROOF. Imports: ../../core, ../units/banani-b1.json, ../units/banani-b2.json, ../units/banani-ground.json, ../units/banani-roof.json, ../units/banani-typical.json, ./demo-tower |
| `src/data/building/demo-tower.ts` | 127 | **AST only; full manual review outstanding** | Unit/tower/project/reference data. Exports: FLOOR_M, FLATS, FLOORS, CORE, Rect, GROUND, ROOF. Imports: ../../core, ../units/type-a.json, ../units/type-b.json, ../units/type-c.json |
| `src/data/building/dmd-tower.ts` | 64 | AST + focused manual excerpts | Unit/tower/project/reference data. Exports: FLOOR_M, FLATS, FLOORS, CORE, GROUND, ROOF, LEVELS. Imports: ../../core, ../units/dmd-b1.json, ../units/dmd-b2.json, ../units/dmd-ground.json, ../units/dmd-roof.json, ../units/dmd-typical.json, ./demo-tower |
| `src/data/building/index.ts` | 141 | AST + focused manual excerpts | Unit/tower/project/reference data. Exports: Tower, projectTowers, towerOf, projectUnit, stemIn, floorIn, roleIn, topFloor, levelName, baseLevel, coverOf, voidsOver. Imports: ../../core, ../../core, ./banani-tower, ./demo-tower, ./dmd-tower, ./projects, ./sheltech-tower |
| `src/data/building/projects.test.ts` | 113 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../../core, ./projects |
| `src/data/building/projects.ts` | 441 | AST + focused manual excerpts | Unit/tower/project/reference data. Exports: PROJECTS_KEY, ProjectFlat, Project, ProjectPlan, LevelKind, Placement, ProjectLevel, Neighbour, stemOf, flatBounds, placeFlat, makeProject, removeFlat, placementOf, sheetOffset, MIN_COLUMNS, alignColumns, placeOfLevel, levelFloor, placeLevel, removeLevel, levelOf, syncUnit, newProject, planOf, Slot, slotLabel, slotsOf, setSlot, removeDrawing, parseFloors, drawingName, projectTower, parseProjects, readProjects, saveProjects. Imports: ../../core, ../../core, ./demo-tower, ./index |
| `src/data/building/sheltech-tower.ts` | 80 | **AST only; full manual review outstanding** | Unit/tower/project/reference data. Exports: FLOOR_M, FLATS, FLOORS, LEVELS, CORE, GROUND, ROOF. Imports: ../../core, ../units/sheltech-a.json, ../units/sheltech-b.json, ../units/sheltech-ground.json, ../units/sheltech-b1.json, ../units/sheltech-b2.json, ../units/sheltech-l1.json, ../units/sheltech-roof.json, ./demo-tower |
| `src/data/fixtures/founder-autotrace-type-a-2026-10-06.json` | 2580 | JSON structural inspection | Unit/tower/project/reference data; not a complete semantic value audit |
| `src/data/fixtures/founder-banani-unit-a-2026-10-09.json` | 1820 | JSON structural inspection | Unit/tower/project/reference data; not a complete semantic value audit |
| `src/data/fixtures/founder-sheltech-a-draft.json` | 2272 | JSON structural inspection | Unit/tower/project/reference data; not a complete semantic value audit |
| `src/data/fixtures/ground-sample.ts` | 42 | **AST only; full manual review outstanding** | Unit/tower/project/reference data. Exports: GROUND_SAMPLE. Imports: ../../core |
| `src/data/fixtures/overpass-banani.json` | 502 | JSON structural inspection | Unit/tower/project/reference data; not a complete semantic value audit |
| `src/data/units/banani-b1.json` | 1367 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/banani-b2.json` | 1245 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/banani-ground.json` | 2398 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/banani-roof.json` | 943 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/banani-typical.json` | 620 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/dmd-b1.json` | 2667 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/dmd-b2.json` | 2800 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/dmd-ground.json` | 1632 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/dmd-roof.json` | 1069 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/dmd-typical.json` | 702 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-a.json` | 1931 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-b.json` | 1879 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-b1.json` | 1135 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-b2.json` | 1214 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-ground.json` | 1907 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-l1.json` | 834 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/sheltech-roof.json` | 1018 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/type-a.json` | 2030 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/type-b.json` | 1854 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/data/units/type-c.json` | 2027 | JSON + actual core validators | isUnit/deriveRooms/validate pass; not verified against source plan |
| `src/furnish/finishes.test.ts` | 181 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/founder-sheltech-a-draft.json, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ../studio/model, ../three/details, ../three/materials, ./finishes |
| `src/furnish/finishes.ts` | 211 | AST + focused manual excerpts | Asset/material/placement rules. Exports: CatalogSlot, isLevel, FINISH_CATALOG, finishSlotsFor, roomKey, wallKey, slotFor, faceWallId. Imports: ../core |
| `src/furnish/greenery.test.ts` | 38 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../studio/furniture, ./kit, ./procedural.meta |
| `src/furnish/kit.data.ts` | 407 | **AST only; full manual review outstanding** | Asset/material/placement rules. Exports: KIT. Imports: ./kit |
| `src/furnish/kit.test.ts` | 46 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: node:fs, vitest, ../studio/library, ../studio/furniture, ./kit, ./procedural.meta |
| `src/furnish/kit.ts` | 281 | AST + focused manual excerpts | Asset/material/placement rules. Exports: KitCategory, ObjectKind, KitAsset, KIT, kitAsset, objectKind, isCeilingLight, heightRange, placementSize, placementLabel, ResizeLimits, rebuildsAtSize, resizeLimits. Imports: ./kit.data, ./procedural.meta |
| `src/furnish/levels.test.ts` | 153 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: fs, path, vitest, ../core, ../data/fixtures/ground-sample, ./kit, ./presets, ./procedural.meta |
| `src/furnish/presets.test.ts` | 797 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: three, vitest, ../core, ./kit, ./presets, ./procedural, ./procedural.meta |
| `src/furnish/presets.ts` | 1371 | AST + focused manual excerpts | Asset/material/placement rules. Exports: GAP, ENTRY, WARDROBE_CLEAR, PATH_W, rotationFacing, footprint, quadsOverlap, doorClearZones, windowZones, chairSpots, isPlanter, isCommonCore, isHelpRoom, LIT_KINDS, AC_KINDS, GLAZING_MIN_H, isGlazing, CURTAIN_OVER, curtainSides, hangCurtain, hangCurtains, curtainShift, curtainEnds, openingOnFace, furnish. Imports: ../core, ../core, ./kit, ./procedural.meta |
| `src/furnish/procedural.meta.ts` | 331 | **AST only; full manual review outstanding** | Asset/material/placement rules. Exports: ART_SETS, ART_PHOTO, ART, ART_W, ART_H, BED_STYLES, STAIR_W, STAIR_RISE, STAIR_D, stairId, PLANTER, PLANTER_KERB, PLANTER_TOP, PlanterEdge, planterId, parsePlanter, planterAsset, wardrobeDoors, tableSeats, Scan, SCANS, ScanId, Potted, POTTED, PLANTER_BOX_H, PLANTER_BOX_D, PLANTER_BOXES, BOX_PLANTS, TREES, TreeId, TRUNK_CLEAR, MAST_TREE, SHRUBS, PERGOLA_POST, CURTAINS, CURTAIN_D, TV_UNIT_TOP, WORKTOP, PROCEDURAL. Imports: ../core, ./kit |
| `src/furnish/procedural.ts` | 2454 | AST + focused manual excerpts | Asset/material/placement rules. Exports: PROCEDURAL, fixtureGlow, setLeafGlow, lite, buildProcedural. Imports: three, three/addons/geometries/RoundedBoxGeometry.js, three/addons/loaders/GLTFLoader.js, three/addons/objects/Reflector.js, three/addons/utils/BufferGeometryUtils.js, ../core, ../three/openings, ./textures, ./kit, ./procedural.meta |
| `src/furnish/textures.data.ts` | 131 | **AST only; full manual review outstanding** | Asset/material/placement rules. Exports: TEXTURES. Imports: ./textures |
| `src/furnish/textures.test.ts` | 26 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ./textures |
| `src/furnish/textures.ts` | 39 | **AST only; full manual review outstanding** | Asset/material/placement rules. Exports: TextureSet, TEXTURES, HDRI. Imports: none |
| `src/index.css` | 18 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `src/lib/events.test.ts` | 185 | AST + focused manual excerpts | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: node:fs, vitest, ./events |
| `src/lib/events.ts` | 198 | AST + focused manual excerpts | Application entry/style. Exports: EventKind, SelectionPayload, CommentPayload, BuyerEvent, buyer, setBuyerName, selectionPayload, flushOutbox, pending, sendEvent, StaffData, eventsForStaff, deltaOf, choiceOf, whoNames, describe, byLink, toCsv. Imports: ../core, ../furnish/finishes, ./supabase |
| `src/lib/supabase.test.ts` | 39 | AST + focused manual excerpts | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest |
| `src/lib/supabase.ts` | 42 | AST + focused manual excerpts | Application entry/style. Exports: configured, RpcError, rpc, fetchSharedUnit, publishUnit. Imports: none |
| `src/main.tsx` | 17 | AST + focused manual excerpts | Application entry/style. Exports: (entry/side effects). Imports: react, react-dom/client, ./index.css |
| `src/studio/FloorList.tsx` | 270 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: NewProject, FloorList. Imports: react, ../core, ../core, ../data/building/projects, ./model, ./pictures |
| `src/studio/IssueLayer.tsx` | 149 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: IssueLayer. Imports: ../core, ./issues |
| `src/studio/LibraryPanel.tsx` | 92 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: LibraryPanel. Imports: react, ./library, ./library.css |
| `src/studio/Panel.tsx` | 953 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: KindSelect, LevelFields, WALL_KEYS, formatArea, LenInput, Panel. Imports: react, ../core, ../core, ./localAI, ../furnish/kit, ./furniture, ./LibraryPanel, ./model, ./review, ./issues, ../trace/types |
| `src/studio/ProjectPanel.tsx` | 293 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: ProjectPanel. Imports: react, ../core, ../core, ../data/building, ../data/building/projects |
| `src/studio/SitePanel.tsx` | 366 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: RADIUS_M, parseLatLon, fetchSite, SitePanel, NorthArrow. Imports: react, ../core, ../core |
| `src/studio/StudioApp.tsx` | 2327 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: StudioApp. Imports: react, ../core, ../core, ./draw, ./furniture, ../furnish/kit, ./model, ./review, ../trace/types, ./autotrace.worker, ./fixes.worker, ./Panel, ./IssueLayer, ./issues, ./localAI, ./ProjectPanel, ./SitePanel, ./FloorList, ./pictures, ../data/building/projects, ../data/building, ./snap, ../viewer/arrange, ../lib/supabase, ./transform, ./studio.css |
| `src/studio/autotrace.worker.ts` | 64 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: TraceJob, TraceIn, Preview, TraceMsg. Imports: ../trace, ../trace/ai, ../trace/types |
| `src/studio/autotraceMock.ts` | 39 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: mockTraceResult, mockAutoTrace. Imports: ../core, ../core, ../data/units/sheltech-a.json, ../trace/types |
| `src/studio/curtains.test.ts` | 300 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../data/fixtures/founder-banani-unit-a-2026-10-09.json, ../furnish/kit, ../furnish/presets, ../furnish/procedural.meta, ../viewer/arrange, ./furniture, ./model |
| `src/studio/draw.ts` | 584 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: MIN_LABEL_PX, Hit, Hover, wallFaceDots, DrawArgs, draw. Imports: ../core, ../core, ./furniture, ./model, ./snap, ./transform |
| `src/studio/fixes.worker.ts` | 36 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: FixesIn, FixesOut. Imports: ../trace/types, ../core, ./issues, ./model |
| `src/studio/flats.test.ts` | 109 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ../data/fixtures/founder-autotrace-type-a-2026-10-06.json, ../data/fixtures/founder-sheltech-a-draft.json, ./model |
| `src/studio/founderAutotrace.test.ts` | 49 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/founder-autotrace-type-a-2026-10-06.json, ./model, ./review |
| `src/studio/founderBanani.test.ts` | 57 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/founder-banani-unit-a-2026-10-09.json, ./model |
| `src/studio/founderDraft.test.ts` | 94 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/founder-sheltech-a-draft.json, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ./model |
| `src/studio/furniture.ts` | 528 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: GRID_M, WALL_SNAP_M, layoutFor, refurnish, forgetPresets, deletePiece, pieceQuad, sideDots, pieceLabel, layerOf, surfaceOf, pieceAt, entryZone, snapToGrid, snapToWalls, whyNot, Move, movePiece, WallFace, hangOn, nearestFace, placePiece, LibraryItem, library, SIZE_STEP_M, resizeAxes, resizePiece. Imports: ../core, ../core, ../furnish/kit, ../furnish/presets, ../furnish/procedural.meta |
| `src/studio/issues.test.ts` | 451 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/founder-sheltech-a-draft.json, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ./model, ./review, ./issues |
| `src/studio/issues.ts` | 777 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: Severity, SMALL_SQM, GAP_M, OVERSHOOT_M, KEEP, LOCAL_M, around, Ghost, Fix, Mark, MarkFixes, issueKey, markIssues, closes, Leak, leaksAround, CLOSE_R_M, CLOSE_MAX_M, fixesOf, fixSig, exportedReview, rowAnswers. Imports: ../core, ../core, ../trace/types, ./model, ./review |
| `src/studio/levels.test.ts` | 340 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/fixtures/ground-sample, ../data/building/projects, ../three/materials, ../viewer/defaults, ./furniture, ./model, ./review, ./issues |
| `src/studio/library.css` | 17 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `src/studio/library.test.ts` | 53 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./furniture, ./library |
| `src/studio/library.ts` | 146 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: Entry, Group, RECENT_MAX, RECENT_KEY, pushRecent, entry, score, listing, firstMatch. Imports: ../core, ./furniture |
| `src/studio/localAI.test.ts` | 141 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ./model, ./review, ./issues, ./localAI |
| `src/studio/localAI.ts` | 243 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: LOCAL_AI_KEY, LocalAI, LOCAL_AI_DEFAULT, isLocalUrl, refusal, localAISettings, START_CMD, START_LINE, testLocalAI, Choice, AIAnswer, askLocalAI, askRow, rowQuestion, rowChoices, pictureFrame, rowPicture, UNTRUSTED, removesOpening, AiNote. Imports: ../core, ../trace/types, ./model, ./review |
| `src/studio/model.ts` | 1912 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: PARTITION_M, EXTERIOR_M, WALL_HEIGHT_M, Tool, WallType, WALL_TYPES, ZONE_LINE_M, KERB_M, wallTypeOf, PILLAR_M, stickCorner, View, PlanImage, Target, Timer, Chain, StudioState, Draft, Action, emptyUnit, initialState, MERGE_M, joinOverlaps, openSpotsNear, lengthMoves, endAlong, fullHeightIfOpenings, ahead, findOpening, Entity, findEntity, shared, selectionText, idsInBox, entityPoints, openingDefaults, MIN_OPENING_M, openingAt, arcPoints, reducer, ISSUE_COPY, StudioIssue, studioIssues, guessKind, printedSizeOf, parseLevel, formatLevel, dirDegOf, rampDirs, snapRampDir, rampArrow, wallLabelSides, formatTimer, slug, isUnit, normalizeUnit. Imports: ../core, ../core, ./snap, ../trace/text, ../furnish/presets, ./furniture, ./review |
| `src/studio/pictures.ts` | 28 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: putPicture, getPicture, deletePicture. Imports: ../core, ./model |
| `src/studio/review.ts` | 503 | AST + focused manual excerpts | Editor/reducer/review/local integration. Exports: AI_KEY, TRACKER_KEY, Review, Box, Answer, LOOKS_RIGHT, SHOW_ME, answerId, StudioAction, applyAnswer, ANSWERS_KEY, STRIPS_KEY, AnswerLog, logAnswer, studioReducer, SIZE_TOL_M, sheetAxis, drawnSize, parsePrintedSize, sizeCheck, openReview, insidePoint, isUnnamed, NEAR_M, RoomState, sameName, roomIndexAt, roomStates, roomCount, fewRooms, printedIndex, roomRow, roomRows. Imports: ../core, ../core, ../trace/types, ./model, ./furniture |
| `src/studio/roomRows.test.ts` | 194 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../trace/types, ./model, ./issues, ./review, ../trace/solve |
| `src/studio/snap.ts` | 269 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: WEAK, Snap, HARD, snapPoint, snapMove, OpeningSnap, snapOpeningOffset. Imports: ../core, ../core |
| `src/studio/spring.test.ts` | 49 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./model, ./review |
| `src/studio/studio.css` | 339 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `src/studio/studio.test.ts` | 1840 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/units/type-a.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ../data/units/type-b.json, ../data/units/type-c.json, ./model, ./review, ./autotraceMock, ../trace/ai, ./snap, ./transform, ../core, ../furnish/presets, ./furniture |
| `src/studio/touch.test.ts` | 98 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ./model, ./issues |
| `src/studio/transform.ts` | 46 | **AST only; full manual review outstanding** | Editor/reducer/review/local integration. Exports: Frame, frameOf, mToPx, pxToM, pxToScreen, screenToPx, mToScreen, screenToM, fitSheet. Imports: ../core, ./model |
| `src/three/PlotlineScene.ts` | 1699 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: PickKind, PickHit, SceneMode, ArrangeEvent, OpeningEvent, GpuFailure, pickedAt, evenBearings, clampSun, PlotlineScene. Imports: three, three/addons/controls/OrbitControls.js, three/addons/controls/PointerLockControls.js, three/addons/environments/RoomEnvironment.js, three/addons/loaders/HDRLoader.js, three/addons/utils/BufferGeometryUtils.js, ./xr, ./building, ../core, ../core, ../furnish/finishes, ../furnish/kit, ../furnish/procedural, ../furnish/textures, ./details, ./daylight, ./furniture, ./materials, ./openings, ./render, ./wind, ./context |
| `src/three/building.test.ts` | 422 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/building, ../data/building/demo-tower, ../data/building/demo-tower, ../data/building/projects, ../data/building, ../data/building/banani-tower, ../data/building/dmd-tower, ../data/building/sheltech-tower, ../data/fixtures/founder-sheltech-a-draft.json, ../studio/model |
| `src/three/building.ts` | 511 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: UNDER_LEVEL_M, litWindow, FlatRef, Building. Imports: three, three/addons/utils/BufferGeometryUtils.js, ../core, ../core, ../data/building, ../data/building/demo-tower, ../furnish/finishes, ../studio/furniture, ./context, ./details, ./furniture, ./render, ./materials, ./openings |
| `src/three/context.test.ts` | 104 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../data/units/type-a.json, ../core, ../core, ../furnish/kit, ../furnish/presets, ./context, ./testUnit |
| `src/three/context.ts` | 418 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: ContactShadow, contactShadows, buildContactShadows, Block, STOREY, BAY, neighbourBlocks, haze, setHaze, outdoorFill, siteCut, hazed, FACADES, Part, blockParts, buildStreet, buildSite. Imports: three, three/addons/utils/BufferGeometryUtils.js, ../core, ../core, ../furnish/kit, ../furnish/presets |
| `src/three/daylight.test.ts` | 147 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ./daylight, ../data/fixtures/ground-sample, ./details, ./testUnit, ../data/units/type-a.json |
| `src/three/daylight.ts` | 530 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: RANGE, SHORT_WALL_M, LO, HI, isCovered, openToSky, Region, Daylight, formFactor, bakeDaylight, factorAt, dayMap, dayMix, daylightTexture, daylit, mapDaylight, setDaylight. Imports: three, ../core, ../core, ./openings |
| `src/three/details.test.ts` | 706 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: three, vitest, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ../core, ../core, ./details, ../data/units/sheltech-roof.json, ../data/units/banani-roof.json, ../data/fixtures/founder-sheltech-a-draft.json, ../studio/model, ./testUnit, ../data/fixtures/ground-sample, ./daylight, ../furnish/presets, ../furnish/finishes, ../viewer/spawn, ./materials, ./openings |
| `src/three/details.ts` | 967 | **AST only; full manual review outstanding** | Renderer/geometry/resources. Exports: SKIRTING_H, SkirtingRun, skirtingRuns, buildSkirtings, raiseHeads, GAP_PREFIX, closeGaps, CasingPlan, casingPlan, PillarPart, pillarParts, floorSlotId, dressOpening, wallGeometry, KERB_M, WallLift, wallLift, liftedWall, liftWall, roomCeiling, storeyTop, carriesRoof, stepFaces, WATER_DROP_M, poolDepth, poolBasin, BAY_NUMBER, bayMarkings, bayLineGeometry, floorGeometry, STEPS_GRADE, isSteps, stepGeometry. Imports: three, three/addons/utils/BufferGeometryUtils.js, ../core, ../core, ./openings |
| `src/three/engine.test.ts` | 415 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, three, ../data/units/type-a.json, ../data/fixtures/founder-banani-unit-a-2026-10-09.json, ../core, ../core, ../furnish/finishes, ../furnish/kit, ../furnish/presets, ../furnish/procedural, ./furniture, ./materials, ./openings, ./PlotlineScene |
| `src/three/furniture.ts` | 121 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: buildFurniture. Imports: three, three/addons/loaders/GLTFLoader.js, ../core, ../furnish/kit, ../furnish/procedural |
| `src/three/materials.ts` | 180 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: setMaxAnisotropy, materialFor, EXTERIOR_PLASTER, EDGE_PLASTER, CONCRETE, PAINT, POOL_TILE, ZONE_FLOOR, DECK_PAINT, zoneFinishRef, resolveFinishRef, resolveFinish. Imports: three, ../core, ../furnish/finishes, ../furnish/textures, ./daylight |
| `src/three/openings.ts` | 426 | **AST only; full manual review outstanding** | Renderer/geometry/resources. Exports: meterUVs, LOW_WALL_M, TRIM_PAINT, GLASS, CLEAR_GLASS, GLAZING_GLASS, WATER, PANES, setGlassSky, CASING_W, CASING_P, OpeningOpts, buildOpening, DOUBLE_DOOR_M, GLAZING_MIN_H, isGlazing. Imports: three, three/addons/utils/BufferGeometryUtils.js, ../core, ../furnish/kit, ../furnish/presets, ./details, ./materials |
| `src/three/render.test.ts` | 73 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./render |
| `src/three/render.ts` | 695 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: Quality, needsFrame, slowFrames, SITE_REACH_M, lampCandela, NIGHT_EXPOSURE, SkyLight, skyLight, twilight, LightsMode, lightsOn, pickCasters, switchedOff, Look. Imports: three, three/addons/utils/BufferGeometryUtils.js, three/addons/postprocessing/EffectComposer.js, three/addons/postprocessing/GTAOPass.js, three/addons/postprocessing/OutputPass.js, three/addons/postprocessing/RenderPass.js, ../core, ../core, ../furnish/kit, ../furnish/procedural, ./context, ./daylight, ./details, ./materials, ./openings |
| `src/three/testUnit.ts` | 87 | **AST only; full manual review outstanding** | Renderer/geometry/resources. Exports: TEST_UNIT. Imports: ../core |
| `src/three/wind.ts` | 142 | **AST only; full manual review outstanding** | Renderer/geometry/resources. Exports: SEASON_TINT, WindFlow. Imports: three, ../core, ../core, three/addons/lines/LineMaterial.js, three/addons/lines/LineSegments2.js, three/addons/lines/LineSegmentsGeometry.js |
| `src/three/xr.test.ts` | 85 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, three, ./xr |
| `src/three/xr.ts` | 333 | AST + focused manual excerpts | Renderer/geometry/resources. Exports: SNAP_RAD, XRHooks, Verdict, rigForHead, turnAbout, snapTurn, teleportVerdict, XRControls. Imports: three, ../core |
| `src/trace/ai.ts` | 220 | AST + focused manual excerpts | Raster/OCR/solver or evaluation. Exports: strictSize, AI_PROMPT, MONTAGE_PROMPT, AI_KEY_STORAGE, parseAiAnswer, parseMontageAnswer, montageItems, tileCrop, buildMontage, geminiReader, aiReaderFromStorage, askAi. Imports: ./sizes, ./text, ./types |
| `src/trace/bands.test.ts` | 138 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./bands, ./raster, ./walls, ./types |
| `src/trace/bands.ts` | 159 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: BandOpts, bandWalls, coveredByBands. Imports: ./types |
| `src/trace/close.test.ts` | 321 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ./close, ./solve, ./types |
| `src/trace/close.ts` | 1085 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: CloseLabel, PieceKind, Piece, Closed, CloseOpts, CLOSE, dashedAlong, insertPiece, joinLeftovers, closeRooms. Imports: ../core, ../core, ./rooms, ./walls, ./types |
| `src/trace/eval.ts` | 347 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: EvalOpts, EvalReport, TruthXf, planXf, applyXf, inkCeiling, registerTruth, evalTrace, scoreUnit, truthLines, formatReports. Imports: ../core/types, ./walls, ./raster, ./types |
| `src/trace/eval/flats27.test.ts` | 87 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: node:crypto, node:fs, vitest, ../../core, ../../studio/model, ../../studio/review, ../evalio, ../raster, ../solve, ../text, ../types |
| `src/trace/eval/score30.test.ts` | 167 | AST + focused manual excerpts | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: node:crypto, node:fs, vitest, ../../core, ../../core, ../../studio/model, ../../studio/review, ../evalio, ../raster, ../solve, ../text, ../types, ./sheets30.json, ./score30 |
| `src/trace/eval/score30.ts` | 187 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: Expected, Sheet, State, RoomResult, SheetScore, nameRight, scoreUnit, rowOf, Row, formatTable. Imports: ../../core, ../../core, ../../studio/review, ../solve, ../text, ../types |
| `src/trace/eval/sheets30.json` | 907 | JSON structural inspection | Raster/OCR/solver or evaluation; not a complete semantic value audit |
| `src/trace/evalio.ts` | 208 | AST + focused manual excerpts | Raster/OCR/solver or evaluation. Exports: FIXTURES, SHOTS, loadPgm, loadPpm, writeOverlay, writeUnitOverlay, writePng. Imports: node:fs, node:zlib, ../core, ../core, ./walls, ./types |
| `src/trace/faces.test.ts` | 160 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./faces, ./types |
| `src/trace/faces.ts` | 551 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: FaceOpts, FaceLine, ThinFaces, FACES, withWalls, axisLines, glazingFrames, thinFaces. Imports: ./hints, ./rooms, ./types |
| `src/trace/hints.test.ts` | 219 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core/types, ./eval, ./evalio, ./hints, ./walls, ./hintsEval, ./types |
| `src/trace/hints.ts` | 576 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: Rgba, HintOpts, estimatePxPerM, findHints, components, Shape, shapeOf, HoleShape, holeShapes, fixtureHints, greenMask, greenHints, colourFills, propagateByColour. Imports: ./raster, ./walls, ../core, ./types |
| `src/trace/hintsEval.ts` | 86 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: GROUPS, HintScore, toMetres, toPx, scoreHints, truthRooms, formatHintScores. Imports: ../core, ../core, ./eval, ./types |
| `src/trace/index.ts` | 21 | AST + focused manual excerpts | Raster/OCR/solver or evaluation. Exports: AutoTraceOpts, AutoTraceResult, ReviewItem, autoTrace, prepare, pick, pickFloor, preview. Imports: ./solve, ./types |
| `src/trace/merge.test.ts` | 110 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./merge, ./rooms, ./tracks, ./types |
| `src/trace/merge.ts` | 634 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: MergeReview, RoomsOnTracks, closeCorners, roomsOnTracks. Imports: ./rooms, ./tracks, ./types, ./walls |
| `src/trace/raster.test.ts` | 194 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ./raster, ./types |
| `src/trace/raster.ts` | 814 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: otsu, threshold, lineInk, edt, thin, normalPolarity, PAGE, colourPage, outlinedWalls, FURNITURE, furnitureMask, DASH, dashMask, HATCH, hatchMask, lightWalls, sheetTurn, Turn, turnOf, turnRaster. Imports: ./types |
| `src/trace/rooms.test.ts` | 323 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core, ../core, ./eval, ./evalio, ./rooms, ./roomsEval, ./types |
| `src/trace/rooms.ts` | 1026 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: RectPx, Side, EdgeClass, Stretch, RoomEdge, RoomFit, Track, RgbImage, RoomsOpts, ScaleFit, darkMaxOf, calibrateScale, classifyProfile, arcCoverage, fitRooms, Unwalled, RoomWalls, deriveWallsFromRooms. Imports: ./text, ./types |
| `src/trace/roomsEval.ts` | 357 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: printedDims, oracleLabels, oracleText, TruthRoomPx, truthRoomsPx, centreRect, RoomScore, scoreRooms, TruthEdgeClass, TRUTH_CLASSES, OUR_CLASSES, expectedClass, EdgeReport, edgeReport, emptyEdgeReport, addEdgeReports, precision, recall, formatEdgeReport, STRETCH_RGB, roomsOverlay. Imports: ../core, ../core, ./eval, ./rooms, ./types |
| `src/trace/sheltechL2.test.ts` | 159 | AST + focused manual excerpts | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core, ../core, ../data/units/sheltech-a.json, ../studio/review, ./evalio, ./hints, ./solve, ./solveEval, ./walls, ./types |
| `src/trace/sizes.ts` | 461 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: Tpl, Font, H, renderFont, Decoded, decode, capBand, topMarks, band, learn, lcsMatches, confirmed, SizeRead, SIZE_RULE, tessConfirms, readSizes. Imports: ./text, ./types |
| `src/trace/solve.test.ts` | 849 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core, ../core, ./eval, ./evalio, ./hints, ./solve, ./walls, ./raster, ./roomsEval, ./solveEval, ./walls, ./types, ./text |
| `src/trace/solve.ts` | 3398 | AST + focused manual excerpts | Raster/OCR/solver or evaluation. Exports: KNOBS, SolveInputs, thicknessScale, namesBeside, thinLines, eraseText, paperOver, buildGraph, inkMasks, glassMask, findStairs, planterMask, outsideMask, mergeUnread, dropForeignStubs, saysLevel, nameLike, namePieces, tableRow, solveTraces, prepareTraces, Prepared, floorParts, pickTraces, closeMessage, titleAreas, solve, prepare, PreparedSolve, pick, pickFloor, preview, previewFlat. Imports: ../core, ../core, ../studio/model, ./close, ./faces, ./merge, ./raster, ./rooms, ./text, ./track, ./walls, ./types |
| `src/trace/solveEval.ts` | 305 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: SolveReport, draftWallSegs, withWallScore, truthPick, scoreSolve, diagnoseMisses, formatSolveReports. Imports: ../core, ../core, ./raster, ./eval, ./walls, ./types |
| `src/trace/text.test.ts` | 816 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core, ../core, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ./types, ./ai, ./evalio, ./textEval, ./sizes, ./text, ../studio/model |
| `src/trace/text.ts` | 1934 | AST + focused manual excerpts | Raster/OCR/solver or evaluation. Exports: parseSide, parseDims, parseArea, strictSize, snapRoomWords, normaliseName, trimName, classifyRoom, OcrWord, chunkWords, groupWords, splitStack, numberRows, findTables, nameKey, applyTables, inTable, ReaskReason, reaskReason, reaskCrop, reaskList, itemFromAi, localMax, CleanOpts, cleanForOcr, STRICT_DELTA, textHeights, scaleGray, resample, stretch, pad, rotateCW, cropGray, TextLine, findTextLines, numberMarks, ReadTextOptions, toPgm, toCanvas, ownGlyphs, lineImage, rotateCCW, boxBack, boxTo, nameStrip, uprightStrip, darkGround, nameOk, wholeArea, roomName, plusNumber, splitNames, readText, readInFaces, readTypes. Imports: ../core, ../core, ./sizes, ./types |
| `src/trace/textEval.ts` | 98 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: sameLabel, TextScore, scoreText. Imports: ../core, ../core, ./text, ./types |
| `src/trace/textPasses.test.ts` | 265 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: node:fs, vitest, ./types, ./evalio, ./text |
| `src/trace/track.test.ts` | 95 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core, ../core, ./eval, ./evalio, ./track, ./walls, ./types |
| `src/trace/track.ts` | 173 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: TrackOpts, trackThin. Imports: ./types |
| `src/trace/tracks.test.ts` | 328 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ./solve, ./tracks, ./walls, ./types |
| `src/trace/tracks.ts` | 1076 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: Interval, Track, Box, Pillar, Join, TrackTrace, Gap, TrackOpts, thicknessClasses, traceTracks, TrackLines, scaleTracks, classifyGap, PILLAR, findPillars, wallLeaves, trackWalls. Imports: ./raster, ./walls, ./types |
| `src/trace/types.ts` | 281 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: Px, Gray, WallSeg, OpeningGuess, WallTrace, Dims, TextKind, TextItem, TextTrace, RejectedStrip, SizeTable, TableRow, AiReader, AiAsk, RoomHint, ColourFill, HintTrace, ReviewItem, PrintedRoom, AutoTraceStats, AutoTraceResult, AutoTraceOpts. Imports: none |
| `src/trace/walls.test.ts` | 232 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, node:fs, ../core/types, ./eval, ./evalio, ./solve, ./walls, ./types |
| `src/trace/walls.ts` | 927 | **AST only; full manual review outstanding** | Raster/OCR/solver or evaluation. Exports: WallOpts, inkThreshold, wallHalfWidth, skeletonGraph, fitCircle, wallSkeleton, upsample, upMask, traceWalls, arcInk, sideContrast, tidy, thicknessOf, glazing, segPieces, circle3. Imports: ./bands, ./raster, ./tracks, ./types |
| `src/viewer/ChangeList.tsx` | 169 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: ChangeList. Imports: react, ../lib/events, ../lib/supabase, ./share, ./viewer.css |
| `src/viewer/FinishesPanel.tsx` | 161 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: Surface, chosen, optionsTotal, FinishesPanel. Imports: react, ../core, ../furnish/textures, ./share |
| `src/viewer/Hud.tsx` | 223 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: HandInfo, Hud. Imports: react, ../core, ../three/PlotlineScene |
| `src/viewer/Minimap.tsx` | 183 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: MAP_PX, compassPoint, MapFrame, mapOf, conePath, Minimap. Imports: react, three, ../core, ../core, ../three/PlotlineScene |
| `src/viewer/Notes.tsx` | 122 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: Draft, tagOf, PinLayer, NotesList. Imports: react, three, ../core, ../three/PlotlineScene, ./storage |
| `src/viewer/SunPill.tsx` | 242 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: period, hhmm, SunPill, WindChips, nearestSpoke, WindRose. Imports: react, three, ../core, ../core, ../three/PlotlineScene |
| `src/viewer/ViewerApp.tsx` | 1327 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: ViewerApp. Imports: react, three, ../core, ../core, ../data/building, ../furnish/finishes, ../furnish/kit, ../studio/furniture, ../lib/events, ../lib/supabase, ../studio/model, ../three/PlotlineScene, ../three/render, ../three/testUnit, ../three/xr, ./arrange, ./FinishesPanel, ./Hud, ./Minimap, ./Notes, ./spawn, ./SunPill, ./defaults, ./quality, ./share, ./storage, ../studio/LibraryPanel, ./viewer.css |
| `src/viewer/arrange.test.ts` | 511 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../studio/furniture, ../furnish/kit, ../studio/model, ./arrange, ../studio/model, ./share, ../data/units/type-a.json, ../data/units/sheltech-a.json, ../furnish/presets |
| `src/viewer/arrange.ts` | 233 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: STAFF_KEY, isStaff, isShareLink, layoutKey, readLayout, saveLayout, Steps, pushStep, undoStep, surfaceOf, DragTarget, baseOf, dragTo, Held, pickUp, holdAt, turnHeld, deleteHeld, dropHeld, DRAFT_KEY, PREVIEW_KEY, planOf, draftState, saveOpenings, wallDrag, makeDraft. Imports: ../core, ../studio/furniture, ../studio/model, ../studio/snap, ../three/PlotlineScene |
| `src/viewer/defaults.ts` | 20 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: withDefaults. Imports: ../core, ../furnish/finishes |
| `src/viewer/frame.ts` | 270 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: EYE, swings, RAY, frameShares, frameHits, project, boxInFrame, floorShare, WHOLE_FOOT, WHOLE_TOP, pieceInFrame. Imports: ../core, ../core, ../furnish/kit |
| `src/viewer/levels.test.ts` | 109 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/units/banani-b1.json, ../data/units/banani-b2.json, ../data/units/banani-ground.json, ../data/units/banani-roof.json, ../data/units/dmd-b1.json, ../data/units/dmd-roof.json, ../data/units/sheltech-l1.json, ../data/units/type-a.json, ./defaults, ./Minimap, ./spawn |
| `src/viewer/parity.test.ts` | 112 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/building, ../data/building/projects, ../data/fixtures/founder-sheltech-a-draft.json, ../data/units/type-a.json, ../furnish/kit, ../studio/furniture, ../studio/model, ./defaults, ./Minimap, ./share, ./spawn |
| `src/viewer/quality.test.ts` | 72 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../furnish/procedural, ../three/furniture, ../three/render, ./quality |
| `src/viewer/quality.ts` | 93 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: Quality, QUALITIES, NAME, Device, recommend, lower, By, chosen, KEYS, read, write, local, tab, probeDevice. Imports: ../three/render |
| `src/viewer/share.ts` | 90 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: encodeConfig, shareUrl, FinishKeys, finishKeys, decodeConfig, formatTaka, formatDelta. Imports: ../core, ../core, ../furnish/finishes |
| `src/viewer/spawn.ts` | 872 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: yawFor, listedRooms, isLevel, entrySpawn, VIEW_INSET, DOOR_CLEAR, GALLEY_DOOR_CLEAR, HANG_CLEAR, HANG_IN_VIEW, AC_NEAR, AC_IN_VIEW, FAN_CLEAR, FAN_IN_VIEW, TALL_IN_VIEW, DOOR_PITCH, BATH_PITCH, FLAT_MAX, NEAR_WALL_MAX, NEAR_WALL, SIDE_WALL, SIDE_WALL_MAX, VERANDA_WALL, VERANDA_WALL_MAX, HELP_PITCH, WET_TOP, WET_FOOT, wetBand, VERANDA_PITCH, WAY_W, CLOSET_PITCH, FLOOR_W, WHOLE_W, PHOTO_TURN, ROOM_PITCH, SMALL_WET, WET_PITCH, DOOR_LEAF_MAX, LEAF_GAIN, inSight, footprintDist, roomView. Imports: ../core, ../core, ../furnish/finishes, ../furnish/kit, ../furnish/presets, ./frame |
| `src/viewer/storage.ts` | 63 | AST + focused manual excerpts | Viewer/UI/sharing/state. Exports: PinAnchor, Pin, readPins, appendPin, removePin. Imports: ../core, ../furnish/kit, ../three/PlotlineScene |
| `src/viewer/viewer.css` | 244 | Style scan; selected rules reviewed | Layout/overflow/focus; browser check outstanding |
| `src/viewer/viewer.test.ts` | 772 | **AST only; full manual review outstanding** | Node regression test; declarations indexed. Exports: (entry/side effects). Imports: vitest, ../core, ../core, ../data/units/type-a.json, ../data/units/type-b.json, ../data/units/type-c.json, ../data/units/sheltech-a.json, ../data/units/sheltech-b.json, ./FinishesPanel, ./Minimap, ./share, ../furnish/finishes, ../furnish/kit, ../furnish/presets, ./spawn, ./SunPill, ./frame |
| `supabase/migrations/20261003120000_share_links.sql` | 64 | Manual SQL contract review | Schema/grants/functions read; PostgreSQL execution outstanding |
| `supabase/migrations/20261004120000_events.sql` | 82 | Manual SQL contract review | Schema/grants/functions read; PostgreSQL execution outstanding |
| `supabase/paste-into-sql-editor.sql` | 152 | Manual SQL contract review | Schema/grants/functions read; PostgreSQL execution outstanding |
| `tsconfig.app.json` | 19 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `tsconfig.json` | 4 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `tsconfig.node.json` | 12 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `vercel.json` | 3 | JSON structural inspection | Entry/build/config/style/script; not a complete semantic value audit |
| `vite.config.ts` | 16 | AST + focused manual excerpts | Entry/build/config/style/script. Exports: (entry/side effects). Imports: vitest/config, @vitejs/plugin-react |

## Appendix B. Explicit exclusions

The **304 binary media files** below were inventoried, not visually inspected against floor-plan/asset truth. Their glTF resource references and filesystem sizes were checked where applicable. The asset manifest records provenance; independent license certification was not performed. Four graphify-out files are generated local-tool data. `.git` internals/history were outside review.

| Excluded path | Reason |
|---|---|
| `Demo drawings/Btibd/img_1.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Btibd/img_2.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Btibd/img_3.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Btibd/img_4.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Btibd/img_5.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Basement 1.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Basement 2.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Ground level.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Level 2-6.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Level 7.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Level 8.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Level 9-13.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Roof level.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech Banani/Sheltech Banani.pdf` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Basement 1.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Basement 2.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Ground level.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Level 2.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Level 3-14.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech dmd/Roof level.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Basement 1.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Basement 2.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Ground floor.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 1.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 2.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 3.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 4.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 5.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Level 6.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `Demo drawings/Sheltech/Rooftop.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `graphify-out/.graphify_detect.json` | Generated local-tool metadata |
| `graphify-out/.graphify_python` | Generated local-tool metadata |
| `graphify-out/.graphify_root` | Generated local-tool metadata |
| `graphify-out/cache/stat-index.json` | Generated local-tool metadata |
| `public/assets/art/art_dawn_l.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/art/art_dawn_r.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/art/art_sea_l.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/art/art_sea_r.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/hdri/interior.hdr` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/hdri/sky.hdr` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/anthurium_botany_01/anthurium_botany_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/anthurium_botany_01/textures/anthurium_botany_01_alpha_1k.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/anthurium_botany_01/textures/anthurium_botany_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/anthurium_botany_01/textures/anthurium_botany_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/anthurium_botany_01/textures/anthurium_botany_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/armchair_01/ArmChair_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/armchair_01/textures/Armchair_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/armchair_01/textures/Armchair_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/armchair_01/textures/Armchair_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/calathea_orbifolia_01/calathea_orbifolia_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/calathea_orbifolia_01/textures/calathea_orbifolia_01_alpha_1k.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/calathea_orbifolia_01/textures/calathea_orbifolia_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/calathea_orbifolia_01/textures/calathea_orbifolia_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/calathea_orbifolia_01/textures/calathea_orbifolia_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/ceiling_fan.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/textures/ceiling_fan_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/textures/ceiling_fan_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/textures/ceiling_fan_emissive_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/textures/ceiling_fan_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceiling_fan/textures/ceiling_fan_spec_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceramic_vase_01/ceramic_vase_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceramic_vase_01/textures/ceramic_vase_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceramic_vase_01/textures/ceramic_vase_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ceramic_vase_01/textures/ceramic_vase_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/chandelier_01/Chandelier_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/chandelier_01/textures/Chandelier_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/chandelier_01/textures/Chandelier_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/chandelier_01/textures/Chandelier_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/classicnightstand_01/ClassicNightstand_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/classicnightstand_01/textures/ClassicNightstand_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/classicnightstand_01/textures/ClassicNightstand_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/classicnightstand_01/textures/ClassicNightstand_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/coffee_table_round_01/coffee_table_round_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/coffee_table_round_01/textures/coffee_table_round_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/coffee_table_round_01/textures/coffee_table_round_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/coffee_table_round_01/textures/coffee_table_round_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/covered_car/covered_car.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/covered_car/textures/covered_car_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/covered_car/textures/covered_car_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/covered_car/textures/covered_car_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/dining_chair_02/dining_chair_02.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/dining_chair_02/textures/dining_chair_02_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/dining_chair_02/textures/dining_chair_02_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/dining_chair_02/textures/dining_chair_02_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/drawer_cabinet/drawer_cabinet.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/drawer_cabinet/textures/drawer_cabinet_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/drawer_cabinet/textures/drawer_cabinet_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/drawer_cabinet/textures/drawer_cabinet_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/electric_stove/electric_stove.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/electric_stove/textures/electric_stove_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/electric_stove/textures/electric_stove_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/electric_stove/textures/electric_stove_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/fern_02/fern_02.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/fern_02/textures/fern_02_alpha_1k.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/fern_02/textures/fern_02_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/fern_02/textures/fern_02_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/fern_02/textures/fern_02_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/hanging_picture_frame_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_artwork_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_artwork_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_artwork_roughness_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/hanging_picture_frame_01/textures/hanging_picture_frame_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/metal_office_desk/metal_office_desk.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/metal_office_desk/textures/metal_office_desk_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/metal_office_desk/textures/metal_office_desk_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/metal_office_desk/textures/metal_office_desk_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/mid_century_lounge_chair/mid_century_lounge_chair.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/mid_century_lounge_chair/textures/mid_century_lounge_chair_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/mid_century_lounge_chair/textures/mid_century_lounge_chair_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/mid_century_lounge_chair/textures/mid_century_lounge_chair_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/modern_arm_chair_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_legs_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_legs_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_legs_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_pillow_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_pillow_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_arm_chair_01/textures/modern_arm_chair_01_pillow_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_ceiling_lamp_01/modern_ceiling_lamp_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_ceiling_lamp_01/textures/modern_ceiling_lamp_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_ceiling_lamp_01/textures/modern_ceiling_lamp_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_ceiling_lamp_01/textures/modern_ceiling_lamp_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_coffee_table_01/modern_coffee_table_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_coffee_table_01/textures/modern_coffee_table_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_coffee_table_01/textures/modern_coffee_table_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_coffee_table_01/textures/modern_coffee_table_01_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_wooden_cabinet/modern_wooden_cabinet.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_wooden_cabinet/textures/modern_wooden_cabinet_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_wooden_cabinet/textures/modern_wooden_cabinet_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modern_wooden_cabinet/textures/modern_wooden_cabinet_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/modular_street_seating.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_armrests_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_armrests_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_armrests_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_supports_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_supports_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_supports_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_timber_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_timber_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/modular_street_seating/textures/modular_street_seating_timber_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ottoman_01/Ottoman_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ottoman_01/textures/Ottoman_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ottoman_01/textures/Ottoman_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/ottoman_01/textures/Ottoman_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/outdoor_table_chair_set_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_chair_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_chair_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_chair_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_table_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_table_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/outdoor_table_chair_set_01/textures/outdoor_table_chair_set_01_table_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/pachira_aquatica_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_bark_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_bark_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_bark_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_leaves_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_leaves_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/pachira_aquatica_01/textures/pachira_aquatica_01_leaves_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/painted_wooden_chair_01/painted_wooden_chair_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/painted_wooden_chair_01/textures/painted_wooden_chair_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/painted_wooden_chair_01/textures/painted_wooden_chair_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/painted_wooden_chair_01/textures/painted_wooden_chair_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/potted_plant_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_leaves_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_leaves_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_leaves_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_pot_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_pot_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_01/textures/potted_plant_01_pot_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/potted_plant_02.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_leaves_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_leaves_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_leaves_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_pot_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_pot_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_02/textures/potted_plant_02_pot_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_04/potted_plant_04.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_04/textures/potted_plant_04_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_04/textures/potted_plant_04_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/potted_plant_04/textures/potted_plant_04_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/round_wooden_table_01/round_wooden_table_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/round_wooden_table_01/textures/round_wooden_table_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/round_wooden_table_01/textures/round_wooden_table_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/round_wooden_table_01/textures/round_wooden_table_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/shrub_leaves/island_tree_02_leaves_alpha_1k.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/shrub_leaves/island_tree_02_leaves_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/shrub_leaves/island_tree_02_leaves_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/shrub_leaves/island_tree_02_leaves_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/side_table_01/side_table_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/side_table_01/textures/side_table_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/side_table_01/textures/side_table_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/side_table_01/textures/side_table_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_01/Sofa_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_01/textures/Sofa_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_01/textures/Sofa_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_01/textures/Sofa_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_02/sofa_02.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_02/textures/sofa_02_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_02/textures/sofa_02_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_02/textures/sofa_02_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_03/sofa_03.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_03/textures/sofa_03_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_03/textures/sofa_03_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/sofa_03/textures/sofa_03_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/throw_pillows_01/textures/throw_pillows_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/throw_pillows_01/textures/throw_pillows_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/throw_pillows_01/textures/throw_pillows_01_rough_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/throw_pillows_01/throw_pillows_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_branches_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_branches_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_branches_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_leaves_alpha_1k.png` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_leaves_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_leaves_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/tree_shade/jacaranda_tree_leaves_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wall_clock/textures/wall_clock_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wall_clock/textures/wall_clock_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wall_clock/textures/wall_clock_glass_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wall_clock/textures/wall_clock_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wall_clock/wall_clock.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_display_shelves_01/textures/wooden_display_shelves_01_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_display_shelves_01/textures/wooden_display_shelves_01_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_display_shelves_01/textures/wooden_display_shelves_01_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_display_shelves_01/wooden_display_shelves_01.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_table_02/textures/wooden_table_02_arm_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_table_02/textures/wooden_table_02_diff_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_table_02/textures/wooden_table_02_nor_gl_1k.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/models/wooden_table_02/wooden_table_02.bin` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-2nd-floor.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-3rd-floor.webp` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-b1.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-b2.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-ground.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-l1.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-l2.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/plan-sheltech-roof.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/asphalt/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/asphalt/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/asphalt/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/asphalt/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/concrete/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/concrete/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/concrete/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/concrete/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/deck_boards/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/deck_boards/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/deck_boards/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/deck_boards/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_curtain/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_curtain/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_curtain/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_upholstery/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_upholstery/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/fabric_upholstery/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/marble_floor_white/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/marble_floor_white/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/metal_brushed/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/metal_brushed/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/metal_brushed/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/paving_pavers/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/paving_pavers/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/paving_pavers/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/paving_pavers/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/plaster_white/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/plaster_white/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/plaster_white/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/plaster_white/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rubber_gym/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rubber_gym/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rubber_gym/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rubber_gym/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rug_wool/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rug_wool/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/rug_wool/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/soil/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/soil/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/soil/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/soil/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_ceramic/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_ceramic/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_ceramic/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_ceramic/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_outdoor/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_outdoor/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_outdoor/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_outdoor/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_terracotta/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_terracotta/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_terracotta/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_floor_terracotta/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_wall_marble_grey/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_wall_white/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_wall_white/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/tile_wall_white/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/turf/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/turf/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/turf/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_oak/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_oak/ao.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_oak/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_oak/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_walnut/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_walnut/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_floor_walnut/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_veneer_light/albedo.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_veneer_light/normal.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |
| `public/assets/textures/wood_veneer_light/roughness.jpg` | Binary media; inventoried/size/reference checked, no detailed visual review |

No initial tracked path was silently omitted. Transient audit tools/logs live in /tmp; the deliverable is exactly six Markdown reports.
