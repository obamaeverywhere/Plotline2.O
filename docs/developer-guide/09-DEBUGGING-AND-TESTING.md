# Debugging and testing Plotline

Debugging means finding the first point where observed behavior differs from expected behavior. Tests preserve an expectation so the same mistake is less likely to return. Use both: a passing pure-function test cannot show whether a button receives clicks or a real headset renders correctly.

## A repeatable investigation

1. State the expected behavior in concrete terms: “Saving this note should close the popover and show a pin,” rather than “notes are broken.”
2. Record the route, origin, input unit/drawing, browser, and relevant configuration **without secrets**.
3. Reproduce the smallest failing interaction. Keep the Console and Network panel open.
4. Locate the handler by the visible label, callback prop, or function name using `rg`/VS Code search.
5. Inspect each boundary: input → event → state/action → model → storage/request → response → UI/scene.
6. Form one hypothesis, then use a breakpoint or focused test to distinguish it from alternatives.
7. Change only after you can explain the cause. Verify the original case and a nearby failure/boundary case.

Preserve drafts and outbox data. “Clear all site data” can destroy the evidence and the user's only local copy.

## Tools and where execution happens

**Firefox Developer Tools:** Inspector for click targets/CSS, Console for uncaught errors, Debugger for breakpoints, Network for HTTP requests, Storage for local persistence, and performance tools for slow frames. Vite development source maps expose the TS/TSX source. A disabled button will not run its click handler; an overlay can intercept pointer input even if the button looks normal.

**VS Code debugger:** open **Debug: JavaScript Debug Terminal**, run a focused Node-based Vitest command, and place a breakpoint in the test or pure function. Select the relevant execution process if child workers complicate attachment. Browser source runs in the browser, so a Node debugger alone will not pause a Viewer click. Use Firefox's debugger for that path; no shared browser launch config/extension is committed.

**Breakpoints:** pause on a handler, inspect locals and call stack, then step into the helper or step over uninteresting library internals. Enable pause-on-exceptions to find where a failure begins. Logpoints are useful when pausing would disrupt pointer timing; avoid logging entire RPC arguments or storage values containing credentials/personal data.

**Logs:** Vite/npm terminal logs concern development/build/tests. Browser console logs concern frontend/worker execution. Supabase API/database logs concern RPC/SQL failures. Vercel build/deployment logs concern the hosted frontend. There is no custom Plotline Node server log stream or installed monitoring SDK.

**API tools:** start with Network request/response inspection. Postman/Insomnia/curl are optional. Replaying `publish_unit` or `add_event` writes data; use an isolated development project and explicit test inputs. Read-only token lookup is the safer first investigation. Do not copy a real staff key into a shell command or screenshot.

## Six realistic debugging cases

### 1. A button does nothing

Example: Notes Save in [Notes.tsx](../../src/viewer/Notes.tsx).

- Inspect `disabled={!text.trim()}`: blank/whitespace input intentionally disables it.
- Confirm the textarea's `onChange` updates `text` and the correct element receives the click.
- Break on `onSave(text.trim())`, then on `ViewerApp.tsx`'s `savePin`.
- Inspect draft/hit/anchor preconditions and any exception before local persistence or state update.
- Check that `readPins` sees the appended row and React receives refreshed pins. On a shared route, inspect `add_event` separately; a local pin appearing does not prove remote delivery.

For Studio Share, follow the `share` callback: prompt cancellation, missing backend settings, request rejection, and clipboard failure have different outcomes. Current copy-error handling can still show a copied toast, so verify the actual link behavior.

### 2. A page does not load

Example: directly reloading `/u/type-a` or `/s/<test-token>`.

- Inspect the first document request: is HTML returned? On production, is the SPA rewrite applied?
- Check module requests, then the first uncaught error. A JavaScript request receiving HTML often means an incorrect fallback/path.
- Follow `main.tsx`'s pathname switch and Viewer `resolveUnit`. Unknown unit IDs and malformed percent encodings are separate cases.
- Distinguish missing shared JSON from a module-load failure. Suspense only handles pending lazy code.
- If controls load but canvas is blank, inspect WebGL capability, scene initialization, canvas dimensions, and model/texture requests. Test a built-in unit to separate backend dependency from rendering.

### 3. An API request fails

Example: `publish_unit`.

- Inspect the exact `/rest/v1/rpc/publish_unit` URL, POST body argument names, status, and response body in Network.
- If no request exists and `RpcError(0)` appears, configuration failed before fetch.
- For 401/403, separate public-key/header compatibility, function grants, and the SQL staff-key check. Never “solve” it by exposing a privileged Supabase key.
- For function-not-found, compare the configured project and applied migration signature.
- For 5xx/SQL errors, correlate the request with Supabase logs. Keep keys/tokens out of shared bug reports.

Use [supabase.test.ts](../../src/lib/supabase.test.ts) to understand intended client handling. It uses fake fetch responses, so it cannot prove live key/header or SQL behavior.

### 4. Data does not appear

Example: a plan image disappears after switching drawings, or staff cannot see a buyer note.

- Identify the store first. Draft JSON, IndexedDB picture, local pin, outbox row, and PostgreSQL event are different records.
- Confirm origin/profile/port and unit/drawing ID before assuming deletion.
- Inspect `pictures.ts` and the caller; a request success callback may precede transaction completion. Look for transaction/storage errors.
- For shared notes, follow `sendEvent → write outbox → flushOutbox → drain → add_event`. Check whether storage was blocked/full, whether a 4xx caused a dropped row, or whether a retry is pending.
- For the report, inspect `events_for_staff`, `superseded`, `removed`, and `byLink`. Older rows may exist but be excluded from current totals. Grouping uses token/kind/ref, not buyer.

### 5. A build fails

- Read the first failing step in `npm run build`: `tsc -b` precedes `vite build`.
- “tsc not found” is an installation issue. A file/line type error is a source/configuration issue. A missing imported asset is a bundler/path issue.
- Compare Node against locked tool engines and confirm dev dependencies were installed.
- Ubuntu path casing can expose an import that appeared to work on a case-insensitive machine.
- Use `npm run typecheck` to isolate compiler failures. Do not bypass strictness with `any` or delete the lockfile simply to get a green command.

### 6. It works locally but fails in production

- Compare `npm run dev` with `npm run build` + `npm run preview`; test both reloads and direct deep links.
- Compare public build-time variables and environment scope. Redeploy after changing Vite variables.
- Check production requests for correct Supabase project, function availability, asset paths, and CORS behavior.
- Local drafts/previews/pictures belong to the local origin; a deployed `/u/preview` is not automatically populated.
- `import.meta.env.DEV` features, including IWER emulation, intentionally differ after a production build.
- Check HTTPS/secure-context requirements, actual GPU capability, font/model dependencies, and the hosting fallback. Vercel success is not evidence that Supabase migrations were applied.

## Existing automated tests

The checkout contains 65 `*.test.ts` files. A prior static inventory counted 860 direct test declarations; parameterized tests generate additional cases, and fixture/opt-in gates can change what runs. These counts describe source, not a successful test-run result. Configuration in [vite.config.ts](../../vite.config.ts) uses a **Node** environment and includes `src/**/*.test.ts`.

| Area | Examples | What the tests establish / limits |
|---|---|---|
| Lengths/geometry/graphs | `core/units.test.ts`, `geometry.test.ts`, `graph.test.ts`, `flats.test.ts` | Unit conversions, geometric rules, graph/room behavior; not browser rendering. |
| Real unit/level data | `core/type-a.test.ts`, project/level tests | Fixture invariants; fixture correctness still depends on source evidence. |
| Furniture/material metadata | `furnish/kit.test.ts`, `presets.test.ts`, `textures.test.ts`, `greenery.test.ts` | Catalog/placement/generalization rules, not complete visual acceptance. |
| Studio editing/review | `studio/studio.test.ts`, `touch.test.ts`, `spring.test.ts`, `issues.test.ts` | Reducer and helper behavior without a full pointer-driven browser workflow. |
| Viewer helpers | `viewer/arrange.test.ts`, `quality.test.ts`, `viewer.test.ts` | Layout/configuration/capability decisions; no guarantee of actual GPU output. |
| Three helpers | `three/openings.ts` through relevant render/engine/details tests | Geometry/math/data behavior in Node; not physical WebXR acceptance. |
| Automatic tracing | `trace/raster.test.ts`, `text.test.ts`, `solve.test.ts`, `trace/eval/` | Synthetic and fixture-based recognition/geometry/evaluation; some real-image tests need external fixture setup. |
| Remote client | `lib/supabase.test.ts`, `lib/events.test.ts` | Fake HTTP status/payload handling, queue/report helpers, some SQL-text assertions; not actual role enforcement or hosted SQL execution. |

There is no committed comprehensive end-to-end Playwright suite, DOM-component test setup, live database-role integration suite, or CI workflow. A declared Playwright dependency does not imply those exist.

## Commands and a real test example

After dependencies are installed:

```bash
npm test
npm test -- src/core/units.test.ts
npm exec -- vitest src/core/units.test.ts
npm run typecheck
npm run build
```

The first two run once; the interactive Vitest invocation supports iterative work. Start narrow while debugging, then run the required wider checks before review. `score30` is an opt-in evaluation workflow, not an unconditional clean-machine smoke test:

```bash
npm run score30
```

Read `src/trace/eval/score30.test.ts`, `sheets30.json`, and fixture-loading code before using it. Several fixture/script defaults refer to `E:` paths. `scripts/trace-fixtures.mjs` even imports Playwright from a hard-coded Windows path; setting only an output-directory argument does not make it Ubuntu-compatible.

Actual assertion style in `core/units.test.ts`:

```ts
test.each([
  // Additional existing cases omitted here.
  [`4.4m`, 4.4],
  [`440cm`, 4.4],
  [`440 mm`, 0.44],
])('%s', (s, m) => {
  expect(parseLength(s)).toBeCloseTo(m, 9)
})
```

This tests an observable contract: user text becomes meters. A test that repeats the parser's internal regex would be less useful. For a bug fix, first choose an input/output that fails for the right reason, then fix the implementation and keep the test as a regression.

## High-value missing coverage

Prioritize behavior crossing a boundary, rather than tests that merely restate a setter:

1. **Real browser editing:** drawing → dimensions → undo/redo → reload → preview, with Firefox and representative source drawings.
2. **Sharing isolation:** local layouts should not contaminate a published snapshot; a buyer route should not gain staff behavior through URL/local state.
3. **Actual SQL roles:** anonymous direct table reads denied; staff checks enforced; invalid token/payload rejected; duplicate IDs remain idempotent; UPDATE/DELETE refused. Use an isolated database, not mocks alone.
4. **Outbox failures:** blocked/full storage, dropped response after successful insert, transient 429, offline/reconnect, and more than one tab.
5. **IndexedDB lifecycle:** transaction abort after request success, open failure/retry, and drawing switches with missing images.
6. **History/report correctness:** same ref from different buyers, timestamp ties, scoped selection removal, untrusted payloads, CSV formula-leading text.
7. **Deployment/browser behavior:** deep-link reloads, missing assets, unsupported graphics, stale builds, production configuration, accessibility/keyboard checks.
8. **Auto tracing:** portable representative-image fixtures, cancellation/stale responses, poor OCR, and valid graph output after human fixes. Physical-headset XR tests are a separate device workflow.

The existing [audit reports](../../audit-reports/) contain concrete findings for choosing regression cases. They are a partial manual audit; do not equate every listed concern with a reproduced failure on every machine.

## Verification limits for this documentation task

No packages were installed. In the inspected environment, dependency-based build/typecheck/test commands could not start (`tsc`/`vitest` missing); a dependency-advisory request encountered registry DNS failure. No runtime test pass, clean browser run, database migration, live API test, production deploy, or headset result is claimed. Source examination and documentation checks are distinct from application execution.

Next: [10 — Deployment](10-DEPLOYMENT-GUIDE.md).
