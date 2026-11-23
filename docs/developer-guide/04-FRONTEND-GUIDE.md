# Frontend: follow one interaction at a time

The frontend includes React interface elements, a Canvas 2D plan editor, image-processing workers, and a Three.js scene. These pieces share a typed unit model, but they update differently: React renders UI from state, while the canvas/scene draw imperatively. Begin with [src/main.tsx](../../src/main.tsx), then choose one feature to follow.

## Components, TSX, and props

A component is a function that returns a description of interface elements. TSX lets a TypeScript function contain markup. The build turns that syntax into JavaScript; the browser does not directly execute TypeScript types.

The entry point uses actual lazy imports:

```tsx
const Studio = lazy(() => import('./studio/StudioApp'))
const Viewer = lazy(() => import('./viewer/ViewerApp'))
const Changes = lazy(() => import('./viewer/ChangeList'))
```

Inside the mounted Suspense boundary, `location.pathname` chooses one of these components. This divides entry code into modules that can load separately. Suspense's loading UI covers that pending module load; it is not a general network-error handler or React error boundary.

Props are arguments a parent passes to a child. [Notes.tsx](../../src/viewer/Notes.tsx)'s `PinLayer` takes the current scene, pins, draft, and callbacks:

```tsx
export function PinLayer({ scene, pins, draft, onSave, onCancel }: LayerProps) {
  const els = useRef(new Map<string, HTMLDivElement>())
  const [text, setText] = useState('')
```

The child owns temporary textarea text; the parent owns saved pins and the meaning of saving. This is an example of passing data down and sending intentions up through callbacks. When adding a field, decide which component owns its lasting value before adding another `useState`.

## State and controlled forms

State is data whose changes should produce a new UI render. `useState('')` returns the current string and a setter. In `PinLayer`, the actual controlled textarea and Save behavior are:

```tsx
<textarea
  autoFocus
  rows={3}
  placeholder="What would you like to change here?"
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

```tsx
<button className="btn primary" disabled={!text.trim()} onClick={() => onSave(text.trim())}>
  Save
</button>
```

Each input event sets state; React renders the updated value. The button refuses blank text in the interface. The parent's `savePin` in [ViewerApp.tsx](../../src/viewer/ViewerApp.tsx) creates an ID, derives an anchor/point, appends locally, optionally sends a shared comment event, refreshes pins, and closes the draft.

To add a note-character counter safely, derive it from `text.length` rather than storing a separate count. If introducing a limit, agree on the server payload rules too: a disabled button alone cannot constrain a hand-crafted HTTP request.

## Hooks and what they own

| Hook | Plotline example | Runtime meaning / safe modification rule |
|---|---|---|
| `useState` | Viewer configuration, open panels; note text. | Setter schedules UI update. Copy objects/arrays instead of mutating existing state. |
| `useReducer` | Studio state initialized with `studioReducer` and `init`. | Dispatch actions; reducer computes next state/history. Route plan changes through this path so undo remains coherent. |
| `useMemo` | Derived rooms/flats and Viewer unit/configuration work. | Recomputes when dependencies change. A cache, not a second source of truth or a guaranteed once-only execution mechanism. |
| `useRef` | Canvas element, `PlotlineScene`, current Studio state, marker elements. | Mutable holder survives renders without triggering one. Use for imperative objects and current callback data, not visible state that needs rendering. |
| `useEffect` | Create/dispose scene, worker/listener coordination, drawing, pin animation. | Synchronize with external systems after rendering. Return cleanup for listeners, animation frames, workers, and GPU resources. |

In Notes, `useEffect(() => setText(''), [draft])` resets input when a different draft opens. Another effect projects pin world points through the camera and writes marker CSS transforms each animation frame, cancelling the frame loop on cleanup. Moving those per-frame values into React state would change the performance model.

The root enables StrictMode. Development checks can expose missing cleanup and impure rendering. Do not “fix” such a symptom by assuming production duplicates every side effect or by removing cleanup requirements.

## Studio editing and reducer boundaries

[StudioApp.tsx](../../src/studio/StudioApp.tsx) coordinates the editor. [review.ts](../../src/studio/review.ts) wraps ordinary editing with autotrace/review actions. [model.ts](../../src/studio/model.ts) defines editor state, actions, and the underlying reducer.

For a metadata edit, look for actions such as `{ type: 'set-meta', patch: ... }`. For wall/opening edits, follow their action cases into graph operations. The reducer returns updated state and records appropriate undo information. Components should not mutate `state.unit.walls` in place or separately maintain their own authoritative wall arrays.

`deriveRooms` and `deriveFlats` calculate structure from the unit. Validation and issue helpers compute guidance for the user. Free-standing walls are supported; an open chain is not automatically proof of a mistake. Follow domain-specific validation rather than making every shape rectangular or every wall close a room.

The drawing effect obtains the canvas context, accounts for device-pixel ratio, and calls [draw.ts](../../src/studio/draw.ts). [transform.ts](../../src/studio/transform.ts) converts between screen and plan coordinates; snapping helpers align editing to intended geometry. Typed measurements go through [core/units.ts](../../src/core/units.ts)'s `parseLength` and become meters. Keep image pixels, canvas display pixels, and plan meters separate when debugging a misplaced wall.

The draft save path is debounced (400 ms in the current app), with lifecycle handlers for additional saves. Plan images may live in IndexedDB, while the active draft includes its own data. Browser persistence is not a remote backup. Test undo, reload, preview, and drawing switches after any editing-state change.

## Conditional rendering and lists

`Notes.tsx` uses `draft && (...)` to show a popover only while a draft exists, and `pins.map(...)` to render markers. `key={p.id}` gives React a stable identity for each pin. Use the real stable ID when adding a list; an array index can identify the wrong item after reordering or removal.

Viewer panels similarly switch according to state and role-like UI flags. [Hud.tsx](../../src/viewer/Hud.tsx) receives callbacks from the Viewer; [FinishesPanel.tsx](../../src/viewer/FinishesPanel.tsx) renders catalog choices, selected styling, and totals. Changing finish state causes UI/configuration updates and scene synchronization. For shared links it can also enqueue an event.

Staff-oriented buttons being hidden on a buyer link is presentation logic. It is not authentication. No React auth provider, Supabase session listener, or implemented user-login flow was found. Backend function checks must independently protect privileged operations.

## Routing and API requests

`main.tsx` handles entry selection. Viewer parses `/u/...`, `/s/...`, query parameters, and configuration. This is manual URL routing, not React Router. Before adding a route, decide both the entry selection and the Viewer/Studio resolution behavior, plus the hosting fallback. Malformed encodings and unknown IDs are cases to test.

Viewer's shared loading effect calls `fetchSharedUnit(TOKEN)`, accepts/validates returned data, then sets fetched state. The helper uses `fetch` through [lib/supabase.ts](../../src/lib/supabase.ts). A promise resolves asynchronously; rendering has already happened at least once before the response arrives. Account for loading, absent results, and errors separately.

Current handling includes a `400 → null` mapping for malformed share tokens and console warnings for some fetch failures. Not every failure produces a detailed visible message. Do not mistake an empty/fallback screen for a successful empty server response. [Backend](05-BACKEND-GUIDE.md) traces publishing end to end.

## Three.js and browser graphics

The Viewer scene effect creates `PlotlineScene`, provides the unit and callbacks, and disposes the instance during cleanup. A separate synchronization path applies configuration changes. Three assembles walls, openings, floors, furniture, materials, lighting, surrounding context, and controls from the shared data.

Read [three/PlotlineScene.ts](../../src/three/PlotlineScene.ts) for lifecycle orchestration; then `openings.ts`, `materials.ts`, `render.ts`, or `xr.ts` for a specific concern. Read [furnish/kit.ts](../../src/furnish/kit.ts) and [presets.ts](../../src/furnish/presets.ts) for catalog/placement rules. Avoid adding project-name-specific branches to rendering; geometry and element kinds should control reusable behavior.

PBR materials combine texture maps for properties such as base color, roughness, and normal detail. glTF models may request a JSON descriptor, binary geometry, and multiple texture files. Inspect the full request chain when an item is missing. Dispose resources correctly when replacing scene content; garbage collection alone does not guarantee timely GPU cleanup.

## Workers and autotrace

Studio creates workers with a bundler-aware URL pattern:

```ts
new Worker(new URL('./autotrace.worker.ts', import.meta.url), { type: 'module' })
```

Image buffers travel through messages; result messages include progress, ready/preview/done/error states. Workers cannot read the page's DOM or its localStorage. Required options such as an optional AI key must be supplied explicitly. Transferred buffers are no longer usable by the sending context in the same way; do not read from a detached buffer after transfer.

`trace/index.ts` defers the solver import. `trace/solve.ts` combines raster processing, OCR, dimensions, walls, and rooms. `trace/text.ts` dynamically loads Tesseract and manages OCR workers. The optional Gemini adapter in [trace/ai.ts](../../src/trace/ai.ts) reads ambiguous cropped labels; the optional local AI adapter supports review choices. Neither replaces the graph/reducer as the plan authority. Stale jobs/results and cancellation require care; review workers use sequence/current-state checks to avoid applying outdated results.

## Styling and responsive behavior

There is plain CSS: shared variables/base elements in [index.css](../../src/index.css), Viewer styles in [viewer.css](../../src/viewer/viewer.css), and Studio/library styles in [studio.css](../../src/studio/studio.css) and [library.css](../../src/studio/library.css). Selectors, flex layouts, position rules, and explicit component classes establish layout. There is no Tailwind generation step or CSS-in-JS runtime.

For a styling change, inspect the computed CSS on the actual element, find the matching class in source, and change the narrowest relevant rule. Check panel overlap, text wrapping, viewport height, canvas resolution, and keyboard accessibility at multiple sizes. Device-pixel ratio controls rendering resolution; CSS width controls layout size. Do not assume a responsive panel proves the whole product is optimized for low-end phones: current product direction targets PC browsers and VR.

## A safe first frontend change

On a new branch, choose a small label/counter change in Notes or Hud rather than a graph-schema rewrite. Find the owning component and CSS selector; follow its props; modify only the relevant behavior; run type checking, focused tests when behavior changes, and a browser check. Update [Docs/MANUAL.md](../../Docs/MANUAL.md) and [Docs/KEYS.md](../../Docs/KEYS.md) when user-visible buttons, keys, or pages change, as required by repository guidance. Exercises describe changes for you to perform later; no application change was made to produce these guides.

Next: [05 — Backend guide](05-BACKEND-GUIDE.md).
