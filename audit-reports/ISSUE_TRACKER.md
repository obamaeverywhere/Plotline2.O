# Plotline issue tracker

Audit date: **2026-11-02 (Asia/Dhaka)**. Workspace commit: `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Only the six audit Markdown reports were added; application source, dependencies, environment and configuration were unchanged.

**54 distinct findings; all open.** No P0 was established. Confirmed means demonstrated through code or a local probe, not necessarily on the deployed service. Strongly supported requires integration/browser confirmation; Potential is conditional. Complete issue details below include evidence, root cause, impact, solution and regression criteria. No fixes were applied.

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

## Detailed tickets and acceptance criteria

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

