# Your learning roadmap

Progress by demonstrated understanding, not by a fixed number of days. Each level depends on the previous level's relevant skills. You do not need to master graphics, OCR, SQL, and deployment before making a small UI improvement. Complete the core path first, then take the specialist branches needed for your work.

Exercise numbers refer to [12-PRACTICAL-EXERCISES.md](12-PRACTICAL-EXERCISES.md). Repository paths below are relative to the root. “Outcome” is something you should be able to explain or demonstrate without having an assistant produce the answer for you.

## Level 1: Fundamentals

Goal: understand how files, commands, language, browser, and history relate before editing the application.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| Ubuntu paths, terminal, processes, ports | You must start tools in the right directory and distinguish a running server from an edited file. | Basic programming. | `package.json`, `.gitignore`; guide 07. | Exercises 1–2: locate root, inspect tool versions/scripts, identify printed server URL. | Explain cwd, executable, foreground process, and why another port changes browser storage. |
| Git snapshots, working tree, index, branches | Small experiments remain reviewable and recoverable. | Files/directories and terminal. | `.gitignore`, commit history; guide 08. | Exercise 3: inspect status and plan an explicit-path commit. | Explain what your next commit includes and how a branch differs from a backup. |
| HTML, DOM, CSS, browser runtime | React ultimately creates browser elements, while canvas draws into a surface. | Variables/functions and basic markup. | `index.html`, `src/main.tsx`, `src/index.css`. | Exercise 4: trace root HTML to component. | Explain how `#root`, the module script, CSS, and rendered DOM connect. |
| Modules, objects, arrays, promises, JSON | These are the shared language of components, models, assets, and HTTP. | Basic programming syntax. | `src/core/units.ts`, `src/lib/supabase.ts`, `src/data/units/type-a.json`. | Exercises 5 and 10: follow conversion and asynchronous data. | Distinguish a JavaScript object from JSON text and a pending promise from its result. |

**Checkpoint:** explain what runs in the browser, what runs in Node during development, and what runs in hosted PostgreSQL. Do not move on with “Node is the whole backend” as your model.

## Level 2: Core Plotline technologies

Goal: make and verify a small frontend change while preserving the meaning of plan data.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| TypeScript types, unions, null handling, TSX | Shared data contracts help detect mistakes before runtime. | Level 1 language/module skills. | `src/core/types.ts`, `src/core/units.ts`, `tsconfig.app.json`. | Exercise 5: trace typed parsing and its tests. | Explain why `as Unit` is not runtime validation and handle `number \| null` deliberately. |
| React components, props, controlled state, callbacks | Most UI changes involve ownership and propagation of state. | DOM, functions, modules, basic TSX. | `src/viewer/Notes.tsx`, `Hud.tsx`, `ViewerApp.tsx`. | Exercises 6–7: trace a note and add a small counter on a branch. | Identify the owner of text, pins, and save behavior; change one without duplicating state. |
| Hooks, effects, refs, cleanup | Renderer/listener lifetimes must match component lifetimes. | React props/state and promises. | `src/main.tsx`, `ViewerApp.tsx`, `Notes.tsx`. | Exercise 9: inspect scene creation/disposal. | Distinguish rendered state from an imperative ref and explain an effect's dependencies/cleanup. |
| npm, Vite, TypeScript build pipeline | You need repeatable commands and must classify build failures. | Terminal, Node/browser distinction, TS. | `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`. | Exercises 2 and 16: install later, build, inspect output. | Explain dev server vs typecheck vs production bundle vs static preview. |

**Checkpoint:** explain a note input from keystroke to callback to local pin. Make a narrowly scoped change, review the diff, and verify it in the browser and build.

## Level 3: Application architecture

Goal: follow plan editing and viewing across modules without creating conflicting sources of truth.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| Wall graph, stable IDs, units, coordinate transforms | The same geometry drives canvas, rooms, furniture, 3D, and anchors. | Types, arrays/maps, elementary coordinate geometry. | `src/core/types.ts`, `graph.ts`, `geometry.ts`, `studio/transform.ts`. | Exercise 8: inspect a plan action and room derivation. | Explain meters vs pixels, plan y vs world y, and why labels are not independent room polygons. |
| Reducer actions, undo/redo, derived state | Editing must remain consistent and undoable. | React state, pure functions, graph model. | `src/studio/StudioApp.tsx`, `model.ts`, `review.ts`. | Exercise 8: follow one metadata/opening action through history and reload. | Place an edit in the correct reducer path and identify what should be derived. |
| Manual routes, local preview, snapshot/configuration links | Similar-looking URLs can have different data sources. | Browser URL/history, React entry point, promises. | `src/main.tsx`, `ViewerApp.tsx`, `viewer/share.ts`, `studio/StudioApp.tsx`. | Exercise 10: compare `/u/`, `/u/preview`, `/s/`. | Predict whether a URL works in another browser and whether it includes a published unit. |
| Three scene graph, assets, materials, animation | Graphics bugs need a different investigation from React state bugs. | Coordinate model, effect/ref lifecycle. | `src/three/PlotlineScene.ts`, `render.ts`, `materials.ts`, `src/furnish/kit.ts`. | Exercise 9: trace one model and its requests. | Explain camera/mesh/material/renderer roles and locate a missing asset. |
| Workers, typed arrays, OCR pipeline — specialist branch | Automatic tracing must stay responsive and handle uncertainty/staleness. | Promises, message passing, geometry, image coordinates. | `src/studio/autotrace.worker.ts`, `fixes.worker.ts`, `src/trace/solve.ts`, `text.ts`, `ai.ts`. | Exercise 17: map messages and one tracing stage. | Explain transferred-buffer ownership, cancellation, optional OCR/AI, and human review. |
| WebXR — specialist branch | Desktop graphics and headset behavior are different integration targets. | Three lifecycle, browser/device permissions. | `src/three/xr.ts`, `src/viewer/ViewerApp.tsx`. | Optional extension to exercise 9: locate DEV emulation and real XR paths. | Explain what emulation can test and what needs a physical compatible device. |

**Checkpoint:** draw the local edit → reducer → rooms → canvas/scene → save flow, naming actual functions. Explain how a shared snapshot differs from the active draft.

## Level 4: Backend and data management

Goal: reason about persistence and authorization on both sides of the HTTP boundary.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| localStorage vs IndexedDB vs hosted storage | Data location determines visibility, durability, and failure modes. | JSON, origins, promises, application data model. | `src/viewer/storage.ts`, `src/studio/pictures.ts`, draft code in `StudioApp.tsx`. | Exercise 11: inventory local data without clearing it. | Diagnose an origin/ID mismatch and distinguish request success from transaction completion. |
| HTTP, fetch, statuses, RPC arguments | Network errors must be separated from UI and SQL errors. | Promises, JSON, basic async error handling. | `src/lib/supabase.ts`, `supabase.test.ts`. | Exercise 12: trace publish and mock response handling. | Explain why POST can perform a read and why `fetch` needs an `r.ok` check. |
| PostgreSQL tables, keys, joins, JSONB, transactions, migrations | Shared records need integrity and a known schema state. | HTTP workflow and nested Unit data. | `supabase/migrations/20261003120000_share_links.sql`, `20261004120000_events.sql`. | Exercise 13: diagram schema and inspect a dev database if available. | Explain snapshot/link/event relationships, atomic publishing, and why frontend deployment does not migrate SQL. |
| Authorization, RLS, grants, definer functions | Browser input/UI checks are untrusted; privileged functions are the real boundary. | SQL functions, request roles, schema model. | Both migrations, `src/lib/supabase.ts`, staff UI. | Exercise 13: build a role/operation matrix. | Distinguish public API key, share token, staff key, and a real user JWT; describe current scope limits. |
| Append-only events, idempotency, outbox, supersession | Retries and history must not silently duplicate or lose buyer actions. | SQL constraints, storage errors, async requests. | `src/lib/events.ts`, `events.test.ts`, events migration. | Exercise 14: simulate retry/storage/rate-limit cases in tests later. | Explain UUID retry deduplication and identify where current durability assumptions fail. |

**Checkpoint:** trace Studio Share from click to SQL inserts to buyer render. Explain what server-side validation exists and what is missing without using a secret key as a workaround.

## Level 5: Debugging and testing

Goal: find a cause, demonstrate it, and preserve the expected behavior.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| Breakpoints, call stacks, Network/Storage inspection | Evidence distinguishes similar symptoms. | Relevant feature workflow and runtime boundaries. | `Notes.tsx`, `ViewerApp.tsx`, `supabase.ts`, `pictures.ts`. | Exercises 6, 11, 12 and guide 09's six cases. | State the first failing boundary and support it with an observation. |
| Vitest assertions, fixtures, mocks, regression design | A fix should preserve an externally meaningful contract. | Pure functions, TS, npm commands. | `src/core/units.test.ts`, `src/lib/supabase.test.ts`, `src/lib/events.test.ts`. | Exercises 5 and 15: add a useful test in your future branch. | Write an input/expected-result test and explain what mocked behavior it cannot validate. |
| Browser and database integration coverage | Logic tests cannot verify real rendering or role grants. | React/HTTP/SQL workflows, Vitest basics. | `scripts/`, `vite.config.ts`, migrations. | Exercises 13–16: propose isolated role/browser checks. | Separate unit, browser, live-database, image-evaluation, and physical-headset evidence. |
| Performance/failure investigation | Large assets, per-frame work, workers, and persistence can fail differently. | Browser profiling, Three/worker/storage basics for your area. | `three/render.ts`, `viewer/quality.ts`, `trace/solve.ts`, `studio/pictures.ts`. | Exercises 9, 14, 17: inspect requests and failure paths. | Propose one measurable hypothesis without treating repository size as initial payload size. |

**Checkpoint:** reproduce one narrowly scoped issue, write or outline a failing regression at the right layer, and explain the remaining verification limits after a fix.

## Level 6: Deployment and maintenance

Goal: prepare a reviewable release candidate and understand the independent data system.

| Topic: what to learn | Why it matters | Prerequisites | Plotline files | Practice | Expected outcome |
|---|---|---|---|---|---|
| Production assets, SPA fallback, HTTPS, environment scopes | Local success can hide route/configuration/device failures. | Vite, URL routing, public-variable model, browser debugging. | `vite.config.ts`, `vercel.json`, `src/main.tsx`. | Exercise 16: inspect preview output and deep-link reloads. | Explain what is served, what is compiled in, and why a variable edit needs a rebuild. |
| Separate frontend and SQL releases | A frontend rollback does not restore a database. | Migrations, SQL roles, hosted workflow. | Both migrations, guide 10. | Exercise 18: prepare a release/recovery plan without deploying. | Identify schema compatibility, test data scope, and unresolved recovery decisions. |
| Dependency/asset maintenance and operational evidence | Versions, service limits, and diagnostic needs change. | Lockfile, tests, Git review, provenance, privacy basics. | `package*.json`, `public/assets/`, `Docs/SOURCES.md`, audit reports. | Exercise 18: produce a release note with actual checks and blockers. | Review an update deliberately, keep credentials out of logs, and avoid claiming unperformed verification. |

**Checkpoint:** prepare a candidate with recorded checks, a tested preview workflow, known backend/schema state, and explicit unresolved risks. Actual publication is a separate deliberate action.

## Your first five priorities

1. JavaScript/TypeScript modules, objects, promises, and the browser-versus-Node distinction.
2. React components, props, state, hooks, and event ownership.
3. Git branches/diffs plus the npm/Vite/typecheck/test development loop.
4. The `Unit` wall graph, coordinate conventions, and reducer/undo workflow.
5. Browser debugging, HTTP/JSON, storage boundaries, and current Supabase authorization.

Start with `src/main.tsx`, not the 3,000-line tracing solver. Earn complexity by tracing a working small example first. Return to this roadmap whenever a task requires a specialist branch.

Next: [12 — Practical exercises](12-PRACTICAL-EXERCISES.md).
