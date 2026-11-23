# Plotline technology stack

This guide describes the checked-out application, not a proposed rewrite. Plotline is a digital show-flat tool: staff trace floor plans in a 2D Studio, inspect furnished 3D buildings, and publish links through which buyers can explore, choose finishes, and comment. It is a client-heavy full-stack application: most work happens in the browser; hosted PostgreSQL functions provide the shared backend.

Evidence comes from `package.json`, `package-lock.json`, configuration, current `src/`, SQL migrations, scripts, assets, and repository documentation. The reference revision is `c76e4b74c77f3b3e78e8a02fe324d46d3394183d`. Installed versions could not be confirmed: `node_modules` was absent. “Locked” below means recorded in the lockfile, not successfully downloaded or executed. Existing audit reports document a separate, partial manual review; these guides do not certify correctness or production readiness.

## Reading order

Start with this inventory and [architecture](02-ARCHITECTURE.md). Use [tools](03-DEVELOPMENT-TOOLS.md) and [Ubuntu setup](07-UBUNTU-SETUP.md) to prepare your machine. Then study [frontend](04-FRONTEND-GUIDE.md), [backend](05-BACKEND-GUIDE.md), and [storage](06-DATABASE-GUIDE.md). Keep [Git](08-GIT-WORKFLOW.md), [debugging](09-DEBUGGING-AND-TESTING.md), and [deployment](10-DEPLOYMENT-GUIDE.md) nearby. Follow the [roadmap](11-LEARNING-ROADMAP.md) and [exercises](12-PRACTICAL-EXERCISES.md) in prerequisite order.

## Inventory and mental models

“Essential” means necessary for the current implementation or for developing its main path. “Feature-specific” means the rest of the product can still be useful without that feature. Alternatives are possibilities to understand, not recommendations to migrate.

| Technology/category | What it is, problem solved, and internal model | Plotline location and interaction | Need / removal impact | Alternatives / learning priority |
|---|---|---|---|---|
| JavaScript and browser platform | Executable language plus browser APIs. Modules import other modules; events trigger functions; promises represent later results. | Built output from TypeScript runs in the browser. Native `fetch`, storage, canvas, workers, and animation APIs do substantial work. | Essential; the application cannot run without JavaScript. | Other languages still generally compile to browser code; learn immediately. |
| TypeScript, TSX | JavaScript with checked types; TSX adds markup expressions. Types are erased before execution. | `src/**/*.ts`, `src/**/*.tsx`, strict [app config](../../tsconfig.app.json). Shared `Unit` types connect editor, geometry, renderer, and storage. | Essential to current source/build; removing it requires converting files and build settings. | Plain JavaScript with runtime validation; learn immediately. |
| HTML and CSS | HTML supplies the document; CSS rules style elements by selectors and layout constraints. | [index.html](../../index.html), [index.css](../../src/index.css), Studio and Viewer stylesheets. | Essential document and usability layer; unstyled geometry alone is not the product UI. | CSS Modules or a design system would require adoption; learn immediately. |
| React / React DOM | Components describe UI from state; React reconciles changed descriptions with DOM elements. React DOM mounts that UI into the page. | [main.tsx](../../src/main.tsx), `src/studio/`, `src/viewer/`; event callbacks update state and trigger new renders. | Essential UI framework; removal requires replacing the component architecture. | Vue, Svelte, or manual DOM; learn immediately. |
| React hooks and reducers | State lives in components; a reducer computes a next state from the current state and an action. No separate state package. | `StudioApp.tsx` → `review.ts` → `model.ts`; Viewer uses state, refs, effects, and memoization. | Essential current state mechanism. | Redux/Zustand are not installed; learn React's existing tools first. |
| Pathname routing | A small conditional selects the entry component. URL parsing chooses a unit/token. No router package. | `main.tsx`, `ViewerApp.tsx`, `viewer/share.ts`; host rewrite serves HTML for deep links. | Essential navigation; removing it loses Studio, changes, and unit/share entry points. | React Router if needs expand; learn current URL handling early. |
| Three.js / WebGL2 | A scene graph holds meshes, cameras, lights, and materials; the renderer sends drawing work to the GPU. | `src/three/`, `furnish/procedural.ts`; React owns controls and lifecycle while Three owns the scene. | Essential to 3D; much 2D editing/core logic remains useful without it. | Babylon.js or lower-level WebGL; important after React/geometry basics. |
| WebXR | Browser interface to headset poses, controllers, and immersive sessions. Three bridges it to rendering. | `src/three/xr.ts`, renderer integration. | Feature-specific; removing it loses VR, not desktop rendering. | Native engines or desktop-only views; learn when working on VR. |
| Canvas 2D, SVG | Canvas draws pixels imperatively; SVG represents scalable shapes as document elements. | Studio `draw.ts`, raster processing, Viewer `Minimap.tsx`. | Essential to plan editing/visualization; Three does not replace these surfaces. | Different drawing engines; important during editor work. |
| Web Workers / transferable buffers | Background JavaScript contexts exchange messages; transferring an ArrayBuffer moves its ownership instead of copying all bytes. | `autotrace.worker.ts`, `fixes.worker.ts`, Studio worker setup. | Essential to current background tracing/review design; removing requires a potentially blocking replacement. | Main-thread work or server jobs; learn after promises and typed arrays. |
| Tesseract.js / OCR | Optical character recognition converts image patterns into text using a worker/WASM-based engine and language data. | `src/trace/text.ts`; dynamic import during automatic tracing. | Feature-specific automatic text reading; manual tracing does not need OCR. | Other OCR services/engines; important for autotrace, later for general development. |
| localStorage / sessionStorage / IndexedDB | Browser storage by origin. localStorage synchronously saves strings across sessions; sessionStorage holds tab-session values; IndexedDB asynchronously stores larger structured values. | `viewer/storage.ts`, Studio draft/projects, `studio/pictures.ts`, event outbox; `viewer/quality.ts` uses sessionStorage for tab fallback state. | Essential current local persistence/state paths; removing loses drafts/preferences/queue or quality fallback behavior. | Server persistence or another IndexedDB wrapper; learn early, including storage failures and lifetime differences. |
| JSON | Text data format made of objects, arrays, and primitive values; parsing yields ordinary JavaScript values. | Unit fixtures, catalogs, share snapshots, RPC bodies, browser saves. | Essential interchange format; not itself a database or validator. | Other encodings; learn immediately. |
| Supabase + PostgreSQL + PostgREST | Hosted service runs relational storage and exposes database functions as HTTP RPC endpoints. SQL functions execute on the database server. | `src/lib/supabase.ts`, `src/lib/events.ts`, `supabase/migrations/`. | Essential for remote sharing/change lists; optional for local built-in exploration. | A custom API with PostgreSQL or another hosted backend; learn after HTTP. |
| SQL, JSONB, migrations | SQL defines/query tables and functions; JSONB stores parsed JSON inside PostgreSQL rows. Migrations are ordered schema changes. | Two SQL migrations: snapshots/links, then append-only buyer events. | Essential hosted schema; removing it breaks RPC-backed features. | Other schema tooling; no ORM installed. Learn SQL before changing functions. |
| Current authorization mechanisms | Public API key identifies the application; share tokens grant access to a snapshot; one staff key gates publishing/reporting in SQL. | RPC arguments, `private.config`, Viewer/Studio UI checks. | Required for current access design, but no user/session authentication implementation exists. | Supabase Auth plus scoped authorization is a future architecture choice; security boundary is essential knowledge now. |
| Node.js | JavaScript runtime outside the browser; executes build/test/tool programs. | Vite config, npm scripts, `.mjs` scripts, Vitest. | Essential development/build runtime; there is no deployed custom Node server here. | Other runtimes need compatibility work; learn the browser/runtime distinction immediately. |
| npm and lockfile | Package manager resolves dependencies and records a reproducible tree; scripts launch local tool executables. | `package.json`, `package-lock.json` v3. | Essential documented workflow; deleting the lock loses the exact recorded resolution. | Other package managers need deliberate migration; learn immediately. |
| Vite + React plugin | Dev server transforms modules on demand; build bundles assets for browsers. Plugin handles React transformation and development refresh. | `vite.config.ts`; npm `dev`, `build`, `preview`. | Essential current development/build pipeline. | Other bundlers/frameworks; important early. |
| Vitest | Executes test files and assertions, with mocking and test isolation. Current environment is Node. | `src/**/*.test.ts`, test config in `vite.config.ts`. | Essential current automated test tooling; does not run the product in a real browser by default. | Other test runners; important before changing behavior. |
| Playwright | Browser automation library that can drive installed browser binaries. | Declared dev dependency and `scripts/`; historical browser workflows in docs. | Optional for initial development; useful for browser verification. No committed general end-to-end suite/config was found. | Manual browser testing or another automation tool; learn when writing browser coverage. |
| IWER | Development WebXR emulation runtime. | DEV-only dynamic import for `?xr=emulate` in Viewer. | Optional; ordinary desktop use and real headset sessions do not require it. | Physical headset testing remains necessary; learn only for XR development. |
| Git / GitHub | Git records snapshots and branches locally; GitHub hosts the remote and review workflow. | `.gitignore`, repository remote, commit history. | Git essential for safe changes; GitHub needed for this remote collaboration flow, not local rendering. | Other Git hosts; learn immediately. |
| Vercel | Build/hosting platform serving compiled frontend files and route rewrites. | `vercel.json`, documented environment aliases in Vite config. | Current hosting integration; local Vite works without a Vercel account. Live project settings were not inspected. | Other static hosts need matching fallback behavior; learn before deployment. |
| PBR / glTF / HDRI assets | glTF describes 3D scenes, binary files hold geometry, textures drive surface properties, HDRI supplies environment light. | `public/assets/`, furniture/material registries. Mostly Poly Haven/ambientCG CC0 assets per source manifests. | Important to visual quality; removing referenced files breaks loads or changes appearance. | Procedural geometry and other licensed sources; important for rendering work. |
| Optional external HTTP services | Browser adapters request maps, geocoding, context geometry, wind data, or AI assistance. | `SitePanel.tsx`, `trace/ai.ts`, `studio/localAI.ts`; details below. | Feature-specific and network-dependent; not prerequisites for ordinary local editing. | Manual input, fixtures, or service replacements; learn when touching each adapter. |

## All direct npm dependencies

Versions below are repository declarations and lockfile resolutions, not a statement that these releases were independently authenticated against the npm registry. `^` permits compatible updates within npm's semver rules; `npm ci` uses the lock resolution. Development dependencies are still necessary for a production **build**, although not shipped wholesale as a runtime server.

| Package | Declared → locked | Kind | Actual use / main features | Removal effect |
|---|---|---|---|---|
| `react` | `^19.3.0` → `19.3.0` | Runtime, UI/state | `main.tsx`, Studio/Viewer components; hooks, lazy, Suspense | Component imports fail. |
| `react-dom` | `^19.3.0` → `19.3.0` | Runtime, UI | `createRoot` in `main.tsx` | Root cannot mount. |
| `three` | `^0.186.1` → `0.186.1` | Runtime, graphics | `three/PlotlineScene.ts`, loaders/rendering/materials/XR, procedural furniture | 3D imports/build fail. |
| `tesseract.js` | `^7.0.0` → `7.0.0` | Runtime, OCR | `trace/text.ts`: `createScheduler`, `createWorker`, English OCR | Automatic OCR fails; direct dynamic import still must resolve at build. |
| `@types/node` | `^26.6.2` → `26.6.2` | Development, type definitions | Node APIs used by tooling/config/tests | Node type checking can fail. Version 26 describes API types, not a Node 26 runtime requirement. |
| `@types/react` | `^19.3.0` → `19.3.0` | Development, types | React/JSX props/hooks checking across TSX | React types/JSX checks fail. |
| `@types/react-dom` | `^19.3.0` → `19.3.0` | Development, types | React DOM entry typing | Root API typing fails. |
| `@types/three` | `^0.186.0` → `0.186.0` | Development, types | Renderer and geometry TypeScript imports | Three API type checking fails. |
| `@vitejs/plugin-react` | `^6.1.1` → `6.1.1` | Development, build | `react()` in `vite.config.ts` | Config import fails; React dev transformation/refresh setup is lost. |
| `typescript` | `^7.0.2` → `7.0.2` | Development, quality/build | `tsc -b` in `typecheck` and `build` | Required checking step cannot execute. |
| `vite` | `^8.3.1` → `8.3.1` | Development, build | Development server and production asset bundling | `dev`, `build`, `preview` cannot execute. |
| `vitest` | `^5.0.1` → `5.0.1` | Development, tests/config | Test imports and `defineConfig` from `vitest/config` | Tests and current Vite config import fail. |
| `playwright` | `^1.63.0` → `1.63.0` | Development, browser automation | Imports in scripts; browser binaries installed separately | Those automation workflows fail; ordinary dev server unaffected. |
| `iwer` | `^2.5.0` → `2.5.0` | Development, XR emulation | Viewer `import('iwer')` under DEV emulation path | Emulation fails; source resolution also needs checking before removal. |

There are four runtime and ten development dependencies. No direct dependency above is simply assumed unused: some are imported only by configuration, test files, scripts, or dynamic paths. Do not delete an infrequently imported tool solely from a text-search count. The lockfile also records transitive packages; those support the direct packages and should normally be managed through npm, not individually edited.

### Small examples from actual source

```tsx
// src/main.tsx: component code is loaded when its branch is needed.
const Studio = lazy(() => import('./studio/StudioApp'))
```

```ts
// src/core/units.ts: a typed pure function, independent of React and Three.
export const FT = 0.3048
export const sqmToSqft = (sqm: number): number => sqm / (FT * FT)
```

```ts
// src/studio/pictures.ts: native IndexedDB, not an npm database client.
export const getPicture = (id: Id) =>
  run<PlanImage | undefined>('readonly', (s) => s.get(id))
```

```ts
// src/lib/supabase.ts: native fetch, not supabase-js or Axios.
export const publishUnit = (unit: object, staffKey: string): Promise<string> =>
  rpc<string>('publish_unit', { p_unit: unit, p_key: staffKey })
```

Types such as `Promise<string>` help the compiler; they do not prove a remote response is actually a string. Runtime validation remains a separate responsibility.

Other direct-package APIs can be recognized in these actual excerpts:

```ts
// src/three/PlotlineScene.ts: a vector represents a direction/point in 3D.
const UP = new THREE.Vector3(0, 1, 0)
```

```ts
// src/trace/text.ts: T is the dynamically imported tesseract.js module.
const scheduler = T.createScheduler()
```

```ts
// vite.config.ts: tooling imports, not code for the deployed browser.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
```

```ts
// src/core/units.test.ts: assertions and parameterized tests.
import { describe, expect, test } from 'vitest'
```

The Viewer DEV emulation path imports `XRDevice` and `metaQuest3` from `iwer`, then constructs `new XRDevice(metaQuest3, { stereoEnabled: true })`. The fixture script imports Playwright and calls `pw.firefox.launch({ headless: true })`; its import path is currently Windows-specific. React DOM's actual root call is `createRoot(document.getElementById('root')!)`. TypeScript is executed through `tsc -b`; `@types/*` packages supply declarations rather than callable runtime functions, so there is no application API call to show for those packages.

## External integrations and assets

| Integration | What Plotline actually does | Boundary to understand |
|---|---|---|
| Google Gemini | `src/trace/ai.ts` sends cropped text montages to a `gemini-2.5-flash` endpoint with a user-provided key; parses returned text and dimensions. | Optional OCR fallback. Browser-supplied key is visible to that user; this is not a hidden backend credential store. Model availability, quotas, and suitability were not live-tested. |
| Ollama-compatible local AI | `src/studio/localAI.ts` calls `/api/tags` and `/api/chat`, defaulting to localhost port 11434 and `qwen2.5vl:7b`. | Optional local process/model. Windows startup messages in source are not Ubuntu commands. Hardware, model installation, and CORS need separate setup. |
| OpenStreetMap tiles / Nominatim / Overpass | `src/studio/SitePanel.tsx` retrieves map tiles, addresses, and nearby building geometry; includes a fallback to the OSM API. | Public-service network and usage-policy limits matter. A source fallback is not evidence that bulk usage is permitted. |
| Open-Meteo archive | Site workflow obtains historical wind data and summarizes it; `core/site.ts` processes site/environment information. | Approximate visualization, not a computational fluid dynamics or structural certification tool. |
| Google Fonts | Root HTML requests Inter. | Font delivery can fail independently of the app; browser fallback fonts still matter. |
| Poly Haven / ambientCG | Checked-in public model, texture, and environment files, catalogued in repository sources. | Most assets are served from Plotline itself; not every render requires a remote asset-service API call. Preserve provenance and license information. |

`public/assets/` is roughly 98 MB across 313 files in this checkout. That is repository asset size, **not** a measured initial page download. Network waterfalls and generated chunks are needed to measure actual loading. Existing optimization targets in planning docs do not establish that every compression or streaming technique is implemented.

## Applicable categories with no dedicated framework

Networking uses `fetch`; data management uses plain TypeScript/JSON and native storage; authorization uses SQL checks and tokens. There is no Axios, ORM, Redux/Zustand, React Router, Tailwind, or component-library dependency. There is no Express application or separate API-server entry point. No implemented Supabase Auth login/session lifecycle was found.

Code quality currently relies on TypeScript and tests. No committed ESLint/Prettier configuration or corresponding npm scripts were found. No Docker configuration, GitHub Actions workflow, dedicated monitoring SDK, or conventional browser-test configuration was found. These are possible future decisions, not tools you must install to understand the present app.

Current product direction in [CLAUDE.md](../../CLAUDE.md) takes precedence over conflicting old plans: English, PC browsers and VR, reusable geometry rules, staff editing, and buyer selections/comments. [plotline_1.2](../../plotline_1.2/) is an archived prototype using older technology; never treat its CDN Three version as the current dependency. `Demo drawings/` contains source drawings, and `graphify-out/` is tooling output rather than an application layer.

Next: [02 — Architecture](02-ARCHITECTURE.md).
