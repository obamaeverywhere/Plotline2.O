# Plotline security audit

Audit date: **2026-11-02 (Asia/Dhaka)**. Workspace commit: `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Only the six audit Markdown reports were added; application source, dependencies, environment and configuration were unchanged.

This is a repository-wide structural audit with focused manual review and isolated runtime probes. **It is not a completed line-by-line semantic review of every algorithm or a successful browser/production validation.** The per-file ledger identifies structural-only files and outstanding work. No production database was connected, no package was installed/upgraded and no deployment or live exploit was performed.

## Assessment and controls to retain

No P0 finding or actual committed privileged credential was established. Event schemas and staff scope are serious production gaps. The migrations do enable RLS, revoke normal table access, use unpredictable UUID capabilities, parameterized SQL, explicit definer search_path and client-generated event IDs for retry idempotency. Keep these controls.

One browser-stored staff key grants global publication/history authority. That is unsuitable for untrusted organizations and lacks per-person revocation. A compromised staff browser/origin would inherit that scope, but no active React XSS was demonstrated. ?staff=1 only exposes local editors; it does not bypass the server key check.

## Findings and evidence

| ID | Severity | Problem | File | Confidence | Impact | Fix Complexity |
|---|---|---|---|---|---|---|
| P1-001 | High | Unvalidated buyer event payloads can break the staff list | [supabase/migrations/20261004120000_events.sql:21](../supabase/migrations/20261004120000_events.sql#L21) | Confirmed | High | Medium |
| P1-005 | High | Backend cannot isolate developer organizations | [supabase/migrations/20261003120000_share_links.sql:12](../supabase/migrations/20261003120000_share_links.sql#L12) | Confirmed | High | High |
| P1-006 | High | Public event writes have no application rate limit or quota | [supabase/migrations/20261004120000_events.sql:39](../supabase/migrations/20261004120000_events.sql#L39) | Confirmed | High | Medium |
| P1-007 | High | Share capabilities have no expiry or supported revocation | [supabase/migrations/20261003120000_share_links.sql:19](../supabase/migrations/20261003120000_share_links.sql#L19) | Confirmed | High | Medium |
| P2-001 | Medium | CSV export preserves buyer-controlled spreadsheet formulas | [src/lib/events.ts:182](../src/lib/events.ts#L182) | Confirmed | Medium | Low |
| P2-002 | Medium | Unknown finish options can supply arbitrary prices | [src/lib/events.ts:148](../src/lib/events.ts#L148) | Confirmed | Medium | Medium |
| P2-009 | Medium | Shared buyer links can expose local staff controls | [src/viewer/ViewerApp.tsx:69](../src/viewer/ViewerApp.tsx#L69) | Confirmed | Medium | Low |
| P2-025 | Medium | Database tests assert SQL text instead of actual role behavior | [src/lib/events.test.ts:159](../src/lib/events.test.ts#L159) | Confirmed | Medium | Medium |
| P2-028 | Medium | Secret-key guard omits the documented VITE variable path | [vite.config.ts:4](../vite.config.ts#L4) | Confirmed | Medium | Low |
| P2-029 | Medium | Local AI URL checks accept public DNS names as private IPs | [src/studio/localAI.ts:26](../src/studio/localAI.ts#L26) | Confirmed | Medium | Low |
| P2-030 | Medium | Local AI startup guidance allows every browser origin | [src/studio/localAI.ts:50](../src/studio/localAI.ts#L50) | Potential | Medium | Low |
| P3-005 | Low | Archived prototype inserts unescaped data into innerHTML | [plotline_1.2/js/ui/UIController.js:4](../plotline_1.2/js/ui/UIController.js#L4) | Confirmed | Low | Low |

### P1-001 — Unvalidated buyer event payloads can break the staff list

**Severity:** P1 · **Confidence:** Confirmed · **Category:** Security · **Fix complexity:** Medium.

**Affected code:** [supabase/migrations/20261004120000_events.sql:21](../supabase/migrations/20261004120000_events.sql#L21), [supabase/migrations/20261004120000_events.sql:42](../supabase/migrations/20261004120000_events.sql#L42), [src/lib/events.ts:161](../src/lib/events.ts#L161), [src/viewer/ChangeList.tsx:145](../src/viewer/ChangeList.tsx#L145).

**Evidence and root cause:** SQL checks payload length, not JSON type or fields. JSON null is not SQL NULL and is not excluded. A local describe() probe with null threw TypeError; object-valued text becomes an invalid React child. add_event stores payload verbatim. No live insertion was attempted.

**Expected impact:** A valid link holder can poison the globally aggregated staff history. Append-only rows cannot simply be updated away.

**Recommended solution:** Validate kind-specific payload schemas and references in the RPC; validate returned data and quarantine malformed historical rows in the UI.

**Verification/regression:** In disposable SQL, reject JSON null/arrays/object text; render valid history beside a malformed legacy event without losing the list.

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

### P2-009 — Shared buyer links can expose local staff controls

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Authorization UX · **Fix complexity:** Low.

**Affected code:** [src/viewer/ViewerApp.tsx:69](../src/viewer/ViewerApp.tsx#L69), [src/viewer/ViewerApp.tsx:73](../src/viewer/ViewerApp.tsx#L73), [src/viewer/ViewerApp.tsx:1174](../src/viewer/ViewerApp.tsx#L1174), [src/viewer/arrange.ts:20](../src/viewer/arrange.ts#L20).

**Evidence and root cause:** SHARED hides load-screen links, but Hud receives STAFF directly for Arrange/Edit plan. Remembered staff or ?staff=1 works independently of a buyer token/config link. Only opening edits additionally check !TOKEN.

**Expected impact:** The buyer-only UI contract fails and snapshots can be changed locally. This does not grant server publish/global-read authority.

**Recommended solution:** Exclude shared routes in the effective editor predicate and guard handlers/shortcuts as well as buttons.

**Verification/regression:** Open /s/token and ?c links with remembered staff and staff=1; editing must remain unavailable.

### P2-025 — Database tests assert SQL text instead of actual role behavior

**Severity:** P2 · **Confidence:** Confirmed · **Category:** Testing · **Fix complexity:** Medium.

**Affected code:** [src/lib/events.test.ts:159](../src/lib/events.test.ts#L159), [scripts/verify-share.mjs:1](../scripts/verify-share.mjs#L1), [supabase/migrations/20261004120000_events.sql:55](../supabase/migrations/20261004120000_events.sql#L55).

**Evidence and root cause:** Committed SQL tests use regex/string checks. Actual SQL execution is referenced only in an external E: temporary script. verify-share reads .env.local and a keyed run permanently inserts records.

**Expected impact:** Grants/RLS/definer/constraint/migration behavior can regress while text assertions pass. Production verification was deliberately not run.

**Recommended solution:** Commit disposable SQL integration tests for every role/RPC, malformed data, append-only/idempotency and migration reruns; prevent production targets.

**Verification/regression:** Run migrations twice and two-tenant denial/valid-operation tests against a disposable database.

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

### P3-005 — Archived prototype inserts unescaped data into innerHTML

**Severity:** P3 · **Confidence:** Confirmed · **Category:** Legacy security · **Fix complexity:** Low.

**Affected code:** [plotline_1.2/js/ui/UIController.js:4](../plotline_1.2/js/ui/UIController.js#L4), [plotline_1.2/js/ui/UIController.js:6](../plotline_1.2/js/ui/UIController.js#L6), [plotline_1.2/js/renderer/ThreeRenderer.js:59](../plotline_1.2/js/renderer/ThreeRenderer.js#L59).

**Evidence and root cause:** Project/client/type/status and room names enter raw HTML templates. The archive is reference-only and not a production Vite entry; no equivalent active React sink was demonstrated.

**Expected impact:** If served with untrusted data the archive can execute markup in its origin. No active production XSS was established.

**Recommended solution:** Keep archive out of deployable roots or use textContent/DOM construction before reusing it.

**Verification/regression:** On an isolated origin, verify benign markup names render literally after correction.


## Confirmed versus conditional impact

- Locally demonstrated: malformed event consumers throw, CSV preserves formula-leading text, unknown option prices are accepted, local-only hostname validation accepts public DNS forms, and Unit validation admits crash-inducing shapes.
- Confirmed implementation gaps: no tenant ownership, staff sessions, event budgets or capability lifecycle; the key guard omits the VITE path; raw HTML sinks exist in the archive.
- Conditional impacts: key leakage requires deployment misconfiguration; spreadsheet execution requires an interpreting spreadsheet; archive XSS requires serving that archive with untrusted data; Ollama exposure depends on actual browser/server settings. None was presented as a successfully executed exploit.

## Defensive security checklist

| Area | Finding / limitation |
|---|---|
| Authentication/authorization | Shared-key RPC authorization exists; org isolation/sessions absent (P1-005). Token lookup is scoped but lacks lifecycle (P1-007). |
| Direct table access | RLS/revokes present in migration source; actual deployed grants were not queried. |
| Injection | No dynamic SQL interpolation found. Active React uses text JSX; no active HTML injection sink established. CSV unsafe; archive HTML unsafe if served. |
| Payload integrity | Unit/project/event validation incomplete; selections/prices not authoritative on server. |
| Abuse/availability | No application event budget; history unbounded; decoded input workloads unbounded. Hosted limits not verified. |
| CSRF | No ambient-cookie privileged session implemented; credentials are explicit RPC arguments/headers. Conventional cookie-session CSRF not demonstrated. Local AI origin access is separate. |
| CORS | Hosted Supabase behavior not inspected; local startup instruction sets wildcard origin. |
| Uploads | Browser-local PNG/JPEG/WebP/JSON import, no server upload endpoint. No uploaded executable/server traversal claim. |
| Secrets | Selected private-key/cloud-token/JWT patterns over current text found no matches. Git history/hosted env/account settings not inspected. Publishable keys are intentionally public. |
| Logging | Raw RPC error text may reach console/toasts, but no actual credential leak demonstrated. New diagnostics must redact keys/tokens/buyer content. |
| Dependencies | NOT VERIFIED: registry DNS failed; no installed tree or current advisory result. No guessed CVEs/upgrades. |
| Transport/headers | Cloud URLs use HTTPS; local Ollama defaults HTTP loopback. Deployed TLS/CSP/referrer/framing headers remain unverified. |
| Retention/recovery | Append-only intent implemented; archive/restore and revocation policy incomplete. No real buyer records were read. |

## OWASP alignment and references

Findings align with access control, injection, insecure design/input integrity, security configuration, resource consumption and monitoring risk families. This is not an OWASP compliance certification or proof of an anonymous global database bypass.

CSV handling follows [OWASP's CSV Injection reference](https://github.com/OWASP/www-community/blob/master/pages/attacks/CSV_Injection.md). Origin restriction is supported by the purpose of [CORS access controls](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), though actual local-network browser permissions were not tested. Read-only map fallback use was checked against the [official OSM editing API policy](https://operations.osmfoundation.org/policies/api/).

## Release security evidence required

In a disposable database with synthetic identities, run migrations twice and verify role grants, direct-table denial, cross-org denial, token scope/revocation/expiry, event schema, option authority, quotas and idempotent retry. Test malformed historical rows in staff UI and synthetic secret-shaped config in both build naming paths. Do not use production data or capability URLs in artifacts. The existing live verification script must not substitute for an isolated repeatable suite.
