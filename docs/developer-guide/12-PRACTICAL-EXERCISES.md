# Practical exercises: from reading to independent changes

These are exercises for you to perform later. No application source, environment variables, packages, or remote data were changed to prepare them. Exercises that edit code belong on your own branch. Exercises that publish or append events require an isolated development backend and leave persistent data; do not use a live customer project.

Use [Ubuntu setup](07-UBUNTU-SETUP.md) for prerequisites and [Git workflow](08-GIT-WORKFLOW.md) before edits. Read-only exercises can be completed even before installing project dependencies. Keep your notes outside credentials and buyer data.

## 1. Build your own repository map

**Objective:** identify the real application layers without guessing frameworks.

**Prerequisites:** basic files/directories and terminal navigation.

**Files:** `package.json`, `src/main.tsx`, `src/core/`, `src/studio/`, `src/viewer/`, `src/three/`, `supabase/migrations/`, `CLAUDE.md`.

**Instructions:**

1. Open each named location. Write one sentence describing its responsibility.
2. List runtime versus development dependencies from the manifest.
3. Find evidence for routing, state management, HTTP access, database logic, and hosting.
4. Put `plotline_1.2/`, `Demo drawings/`, `Docs/`, and `public/assets/` on your map with their different roles.

**Expected result:** a small map of current browser, tooling, and hosted-database layers.

**Verify completion:** explain why “there must be an Express server” and “the archived prototype's Three version is current” would be unsupported claims. Compare your map with guide 02 after writing it independently.

## 2. Explain the local command loop

**Objective:** understand what each npm command actually starts.

**Prerequisites:** exercise 1; compatible Node/npm and installed dependencies for execution, otherwise inspection only.

**Files:** `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.

**Instructions:**

1. Copy the six npm script names into your notes and write the executable behind each.
2. Explain the order in `tsc -b && vite build` and the meaning of `noEmit`.
3. After setup, run the focused units test and dev server. Note the actual printed URL; stop with `Ctrl+C`.
4. Compare package declarations, lock resolutions, and `npm ls --depth=0` output if installation succeeded.

**Expected result:** a repeatable local loop and an accurate installed-versus-locked distinction.

**Verify completion:** identify whether “vitest not found,” a type error, and a 403 RPC response occur before testing, during checking, or in the browser/backend workflow.

## 3. Practice a reviewable Git change

**Objective:** understand branches, diffs, and staging without accidentally including unrelated work.

**Prerequisites:** exercises 1–2 and guide 08; preserve current uncommitted work first.

**Files:** `.gitignore`, one small future change of your choice.

**Instructions:**

1. Inspect `git status`, active branch, recent history, and remote URL.
2. Identify existing untracked files such as audit reports; do not assume they belong to your task.
3. Create a learning branch when the starting state is understood.
4. For a later small change, stage explicit paths, inspect `git diff --cached`, and write a descriptive commit message. Push only if you intend to publish that branch.

**Expected result:** a narrowly scoped commit or a written staging plan if you are only reading.

**Verify completion:** explain why `git add .` might include more than intended, why a local commit does not change GitHub, and why Git does not back up browser drafts.

## 4. Trace startup and routes

**Objective:** connect HTML, React mounting, lazy modules, and manual URL routing.

**Prerequisites:** exercise 1, basic HTML/functions; running app optional.

**Files:** `index.html`, `src/main.tsx`, `src/viewer/ViewerApp.tsx`, `vercel.json`.

**Instructions:**

1. Locate the root element and module script in HTML.
2. Follow `createRoot` and the Suspense wrapper.
3. Predict which component `/studio`, `/changes`, `/u/type-a`, and `/s/<token>` select.
4. Find Viewer unit/token resolution. If running locally, visit `/studio` and `/u/type-a`, then reload directly.

**Expected result:** a route table with the selected entry and its data source.

**Verify completion:** explain why a production deep-link 404 can occur before React runs, and why `history.replaceState` alone is not a router subscription.

## 5. Read a pure function and its tests

**Objective:** understand unit conversion, nullable output, and contract-based tests.

**Prerequisites:** JavaScript strings/numbers, basic TypeScript; installed dependencies to run tests.

**Files:** `src/core/units.ts`, `src/core/units.test.ts`, `src/core/index.ts`.

**Instructions:**

1. Predict the results for `4.4m`, `440cm`, `14.4`, and `abc` before reading every branch.
2. Explain why bare `14.4` is feet and the internal result is meters.
3. Follow regex matching and curly-quote normalization.
4. Run `npm test -- src/core/units.test.ts` if setup is complete; inspect `toBeCloseTo` and invalid-input cases.

**Expected result:** a correct input/output table, including null for invalid input.

**Verify completion:** calculate one feet/inches value manually using `FT = 0.3048` and explain why a dimension pair is rejected by this single-length parser.

## 6. Follow the Notes form end to end

**Objective:** connect props, controlled input, state, callbacks, and persistence.

**Prerequisites:** exercise 4, React basics; dev app for browser observation.

**Files:** `src/viewer/Notes.tsx`, `src/viewer/ViewerApp.tsx`, `src/viewer/storage.ts`, `src/lib/events.ts`.

**Instructions:**

1. Find `PinLayer`, `text`, the textarea's `value`/`onChange`, and Save's disabled condition.
2. Follow `onSave` to `savePin`, then `appendPin` and `readPins`.
3. On a built-in unit, open a note draft using documented controls and inspect the callback in Firefox's debugger.
4. Explain the additional event path on a shared link without sending to a production backend.

**Expected result:** a named sequence from typing to local pin, plus the conditional remote branch.

**Verify completion:** show where temporary text and saved pins each live; explain why a local pin appearing does not prove `add_event` succeeded.

## 7. Make a small frontend change on a branch

**Objective:** develop a small UI improvement with deliberate state ownership.

**Prerequisites:** exercises 2–3 and 6; dependencies installed; independent learning branch.

**Files:** `src/viewer/Notes.tsx`, relevant `src/viewer/viewer.css` rules; `Docs/MANUAL.md`/`Docs/KEYS.md` if user-facing behavior changes.

**Instructions:**

1. Add a visible note-length counter derived from existing `text.length`; avoid a second counter state.
2. Choose a modest accessible style and check wrapping with a long note.
3. Keep existing blank-text refusal and Save/Cancel semantics.
4. Run typecheck/build and inspect the browser interaction. Review and stage only intended files; update product references as applicable.

**Expected result:** a small change you can explain line by line, without touching the graph or backend schema.

**Verify completion:** counter matches typing/deletion, resets with a new draft, and Save still receives trimmed text. Explain which checks are visual and which are compiler checks.

## 8. Trace an edit through the reducer and geometry

**Objective:** understand how one authoritative plan supports undo and derived rooms.

**Prerequisites:** React state, TypeScript discriminated actions, coordinate basics; a disposable draft or exported existing work.

**Files:** `src/studio/StudioApp.tsx`, `src/studio/review.ts`, `src/studio/model.ts`, `src/core/graph.ts`, `src/studio/transform.ts`.

**Instructions:**

1. Find `useReducer` and one `set-meta` dispatch, then its reducer case.
2. Follow a wall/opening action separately and identify how unit/history change.
3. Locate `deriveRooms` use and explain why rooms are recomputed rather than independently edited polygons.
4. In a disposable draft, make one edit, undo/redo it, reload, and inspect preview behavior. Preserve valuable existing drafts first.

**Expected result:** an action-to-state-to-derived-output diagram naming current functions.

**Verify completion:** explain how direct mutation in a panel could break React updates/history, and distinguish plan meters, image pixels, and canvas coordinates.

## 9. Inspect one 3D object and its lifecycle

**Objective:** understand where React hands control to Three and how assets reach the GPU scene.

**Prerequisites:** effects/refs, coordinates, browser Network tools.

**Files:** `src/viewer/ViewerApp.tsx`, `src/three/PlotlineScene.ts`, `src/three/materials.ts`, `src/furnish/kit.ts`, `src/furnish/kit.data.ts`, `public/assets/`.

**Instructions:**

1. Locate scene creation, configuration synchronization, and disposal in the Viewer.
2. Pick one catalog model and trace its descriptor to the public glTF/binary/texture requests.
3. Use Network timing and transferred sizes to distinguish fetched files from total repository assets.
4. Find one material or procedural fallback and explain what changes visually if its texture is missing.

**Expected result:** a short model-load chain and lifecycle explanation.

**Verify completion:** name camera/mesh/material/renderer roles, identify effect cleanup, and explain why ~98 MB in the repository is not a measured first load. Optional XR extension: compare DEV IWER import with the real session path without claiming headset verification.

## 10. Compare three kinds of links

**Objective:** avoid confusing a local preview, built-in unit URL, and published snapshot/configuration URL.

**Prerequisites:** exercises 4 and 8; read-only source inspection is enough.

**Files:** `src/studio/StudioApp.tsx`, `src/viewer/ViewerApp.tsx`, `src/viewer/share.ts`, `src/lib/supabase.ts`.

**Instructions:**

1. Follow Studio Preview to `plotline.preview` and `/u/preview`.
2. Follow `/u/:id` to built-in/project resolution.
3. Follow Studio Share to `publishUnit` and `/s/:token`.
4. Find Viewer URL configuration encoding and explain what it can include without publishing a draft.

**Expected result:** a comparison table: data source, network requirement, local-origin dependency, and whether another browser can resolve it.

**Verify completion:** predict why a copied `/u/preview` may fail on another computer and why changing the draft does not update an old published snapshot.

## 11. Investigate storage without deleting data

**Objective:** learn where missing local work could be found and what durability means.

**Prerequisites:** origin/profile concepts, JSON, promises; existing work backed up before any experiment.

**Files:** `src/studio/pictures.ts`, draft/project code in `StudioApp.tsx`, `src/viewer/storage.ts`.

**Instructions:**

1. List local storage key names from source, without printing actual credential-bearing values.
2. Inspect the current origin in Firefox Storage tools and locate a non-sensitive sample draft/picture key.
3. Follow IndexedDB open, upgrade, transaction, and request callbacks.
4. Write a hypothesis for a picture missing after switching drawing IDs or ports. Do not clear storage to test it.

**Expected result:** a storage/location/lifetime map and one evidence-based diagnostic plan.

**Verify completion:** explain why `request.onsuccess` can precede transaction commit and why localStorage and IndexedDB are both separate from Supabase.

## 12. Trace a real RPC and read its mock tests

**Objective:** understand request construction and what a mocked response proves.

**Prerequisites:** HTTP/JSON, async errors, exercise 10.

**Files:** `src/lib/supabase.ts`, `src/lib/supabase.test.ts`, `src/studio/StudioApp.tsx`, share migration.

**Instructions:**

1. Write the `publish_unit` endpoint suffix and JSON argument names using placeholders only.
2. Follow `RpcError`, `r.ok`, JSON parsing, and the `400 → null` shared-token mapping.
3. Inspect `vi.stubEnv`, `mockFetch`, and assertions in `supabase.test.ts`; run that focused test later if dependencies are ready.
4. Read the actual headers and the official key compatibility note in guide 05. Explain what a live development-project request would still need to establish.

**Expected result:** a click-to-SQL workflow with no invented controller/server layer.

**Verify completion:** distinguish status 0, malformed-token 400, wrong staff key, and network rejection. Explain why a fake 200 response does not prove the deployed key/grants are correct.

## 13. Model the database and its access rules

**Objective:** reason about joins, constraints, privileged functions, and roles.

**Prerequisites:** exercise 12, basic SQL; isolated Supabase development project only if executing SQL.

**Files:** both `supabase/migrations/*.sql`, `supabase/paste-into-sql-editor.sql`, `src/lib/events.ts`.

**Instructions:**

1. Draw tables/foreign keys and identify snapshot JSON versus database row ID.
2. Explain `publish_unit`'s two inserts and `unit_by_token`'s join.
3. Make a matrix for anonymous table read, token lookup, publish, append event, and staff report: which key/token/check governs each?
4. Identify payload constraints, absent full schema/rate limiting, append-only trigger, and no expiry/revocation workflow.
5. Optionally apply reviewed migrations to a disposable development project and verify the matrix as the actual public API role. Handle staff-key output privately; keep production untouched.

**Expected result:** a correct schema/access diagram and an explicit list of unimplemented guarantees.

**Verify completion:** explain why an admin SQL-editor query is insufficient to test anonymous permissions, and why `SECURITY DEFINER` makes function bodies a critical boundary.

## 14. Analyze retries, history, and failure cases

**Objective:** understand an outbox and identify durability gaps from source.

**Prerequisites:** browser storage, promises, RPC, SQL uniqueness; test branch if adding simulations.

**Files:** `src/lib/events.ts`, `src/lib/events.test.ts`, events migration.

**Instructions:**

1. Trace `sendEvent → write → flushOutbox → drain → add_event`.
2. Explain when the UUID is created and how conflict handling deduplicates a resend.
3. Follow network/5xx, 400, and 429 branches; then inspect blocked/full-storage behavior. Use fake storage/fetch in tests rather than manipulating a real buyer outbox.
4. Work through two different buyers sending the same token/kind/ref and inspect SQL supersession.

**Expected result:** a table of intended versus current behavior, plus a proposed regression case for a data-loss scenario.

**Verify completion:** state whether each row is kept, dropped, inserted, or never sent, and explain why a browser ID is not an authenticated buyer identity.

## 15. Add a meaningful regression test

**Objective:** learn to encode observable behavior without mirroring implementation.

**Prerequisites:** exercise 5, Vitest basics, installed dependencies, a new/preserved branch.

**Files:** `src/core/units.test.ts`, `src/core/units.ts` for a simple contract test; alternatively `src/lib/events.test.ts` for exercise 14's advanced case.

**Instructions:**

1. Choose an uncovered input contract. For a simple candidate, test `parseLength('1000mm')` returning 1 meter after confirming that exact case is not already covered.
2. Add the case in the existing test style and run the focused file.
3. Explain whether this merely adds boundary evidence to already working behavior or reproduces a bug; do not call a passing new case a demonstrated fix.
4. For an actual outbox bug, first express the expected send/retention outcome with controlled storage/fetch and observe the failure. Keep any implementation fix a separate, understood step in your future branch.

**Expected result:** a small test with a clear contract and honest interpretation of its result.

**Verify completion:** identify input, expected output/side effect, failure meaning, and what is mocked. Run typecheck and appropriate wider checks before proposing a behavioral fix.

## 16. Inspect a production build without publishing

**Objective:** find differences between development and built output.

**Prerequisites:** successful local setup, exercises 2/4/9; public configuration understood.

**Files:** `package.json`, `vite.config.ts`, `vercel.json`, generated `dist/` after your build.

**Instructions:**

1. Run typecheck, relevant tests, and `npm run build`; record actual results, including blockers.
2. Inspect output HTML/chunks/assets and run `npm run preview`.
3. Reload direct routes and inspect asset status/content type/timing.
4. Locate the DEV-only XR emulation condition in source and explain its production consequence. Compare environment configuration without copying key values into notes.

**Expected result:** a build/preview evidence record, not a production deployment.

**Verify completion:** explain what `dist/` contains, why Node is needed to build but no custom Node server is shipped, and which route/env checks still belong on the actual hosting platform.

## 17. Map the autotrace worker pipeline

**Objective:** understand automatic plan reconstruction and optional AI boundaries.

**Prerequisites:** graph/coordinates, typed arrays, promises, workers; no AI key required for reading.

**Files:** `src/studio/StudioApp.tsx`, `autotrace.worker.ts`, `fixes.worker.ts`, `src/trace/index.ts`, `solve.ts`, `text.ts`, `ai.ts`, `src/studio/localAI.ts`.

**Instructions:**

1. List worker input/output message kinds and identify transferred buffers.
2. Trace preparation, hover/pick/floor result, acceptance, and reducer integration.
3. Select one stage—text parsing or raster processing—and read a corresponding existing test before the entire solver.
4. Mark where Tesseract, optional Gemini fallback, and optional local review AI enter. Identify which inputs leave the device.
5. Locate cancellation/stale-result checks and explain the outcome if the drawing changes while a request runs.

**Expected result:** a staged diagram that preserves the graph and human review as authorities.

**Verify completion:** explain why workers cannot read the page DOM/localStorage, why transferred-buffer ownership matters, and why successful OCR does not guarantee correct walls/rooms. Note Windows fixture-path blockers rather than claiming benchmark execution.

## 18. Prepare a release and maintenance proposal

**Objective:** combine architecture, testing, configuration, and recovery knowledge without deploying.

**Prerequisites:** levels 1–5 of the roadmap and guide 10; actual checks only when your environment supports them.

**Files:** `vercel.json`, `vite.config.ts`, `package*.json`, migrations, `Docs/SOURCES.md`, existing `audit-reports/`.

**Instructions:**

1. Write the proposed build/runtime/output settings and distinguish verified settings from decisions needing confirmation.
2. Specify separate development/preview/production public configuration and database targets without recording values.
3. List actual local checks, browser workflows, SQL-role tests, and device checks; mark unperformed ones clearly.
4. Triage a small set of existing audit findings affecting sharing/data retention/access. Explain whether new verification is needed.
5. Describe frontend rollback, schema compatibility, backup/restore ownership, dependency updates, asset provenance, and available log locations.

**Expected result:** a concrete release-review document with evidence, unresolved risks, and explicit next decisions.

**Verify completion:** another developer can tell what would ship, what backend schema it needs, what was actually tested, and what a frontend rollback would fail to restore. Do not deploy or alter production as part of this exercise.

## When you are ready to choose your own task

Select one user-visible problem, trace its current implementation, state the desired behavior, and choose the smallest correct layer to change. Write down the verification before editing. A good next task leaves you able to explain both the change and its limits in your own words.

Return to [the roadmap](11-LEARNING-ROADMAP.md) for prerequisites or [the stack inventory](01-TECHNOLOGY-STACK.md) for the full guide navigation.
