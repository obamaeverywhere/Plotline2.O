# Maheer Tajwar’s Plotline contributions

**Team handoff · 24 November 2026**

I work on how a floor drawing becomes an editable plan in Studio, and how that plan loads and looks in the browser. **For the other two contributors: please leave the files listed below to me while working on other tasks.** If your change needs one of these files, message me with the path and the change you need before editing it. This applies to the named files only. It is a team agreement recorded in this document.

## What I changed

- **Automatic floor uploads.** I connected the Studio upload button and drag-and-drop to whole-floor raster tracing and DXF import. Studio remembers confirmed DXF layer roles even when later floors add furniture or omit layers. I also added calibration from one known wall and undo/redo for an uploaded picture and its draft together.
- **CAD input.** I added **Import DXF** alongside the existing image input. Staff can open an ASCII DXF, choose the drawing and layers, confirm scale, and import a whole floor or one inferred flat. The importer converts CAD geometry into Plotline’s editable walls, vertices, openings and labels. Studio derives closed rooms from those walls and lets staff review uncertain geometry, undo the import and export the result.
- **Doors, windows and labels.** I improved how the importer joins wall fragments around a doorway and reads straight or rectangular CAD opening symbols. Merging a reversed copy of a wall now preserves the window’s position. Matching markers produce one opening, and conflicting ones appear in review. I also fixed CAD text decoding that could corrupt room names such as “BED”.
- **Image Auto-trace.** I added contrast recovery for faint strokes on pale scans, preserved edge pixels when straightening a rotated plan, and corrected the hover highlight so it follows the selected area on the original drawing. Scale estimation checks agreement across rooms so a repeated dimension in one room cannot determine the scale by itself.
- **Room-label OCR.** I fixed missing labels in L-shaped rooms by locating recovered text at its printed position. Adjacent rooms can each keep the same name. I also preserved sparse lettering during contrast adjustment, rotated sideways strips before rereading them, and kept room numbers during spelling correction. A printed dimension such as `440 × 320 cm` now applies centimetres to both sides.
- **Browser workload and visual quality.** I moved image preparation into the trace worker where supported, kept the source resolution for tracing, and bounded OCR concurrency. In the viewer, I improved initial furniture and finish loading and reduced repeated work for the minimap and overlays.
- **Upload accuracy benchmark.** I connected the production Studio uploader to five hand-traced flat references across three floor images. The benchmark measures closed and named rooms, room outline overlap, scale error and elapsed browser time. A synthetic DXF checks the geometry after a layer mapping is reused.
- **Documentation and verification.** I wrote the project onboarding context, documented the import and review controls, and added regression coverage. The wall tracer passed its smoke check across 37 raster fixtures. In Firefox, the sample DXF produced seven walls, two closed rooms and two openings. Export, undo and redo passed.

## Files to coordinate with me before editing

Each path is relative to the repository root. In shared files such as `StudioApp.tsx`, the last column identifies the part I changed.

| Area | Files | My changes |
| --- | --- | --- |
| DXF geometry and text | `src/dxf/parse.ts`, `src/dxf/curves.ts`, `src/dxf/types.ts` | Read CAD entities, block transforms, curves and text into the vector drawing model. |
| DXF setup | `src/dxf/drawings.ts`, `src/dxf/layers.ts`, `src/dxf/units.ts`, `src/dxf/upload.ts` | Select the drawing, suggest layer roles and convert source units to metres. |
| DXF plan generation | `src/dxf/buildUnit.ts`, `src/dxf/studioState.ts` | Build the editable floor, attach openings, flag uncertainties and keep the review with the Studio drawing. |
| DXF interface | `src/studio/DxfImport.tsx`, `src/studio/dxf-import.css`, `src/studio/dxf.worker.ts` | File selection, layer preview, scale, background import and review controls. |
| Studio integration | `src/studio/StudioApp.tsx`, `src/studio/Panel.tsx` | Connect the importer, review panel and image-trace worker to the existing editor. |
| DXF dependencies and checks | `package.json`, `package-lock.json`, `src/dxf/dxf.test.ts`, `src/dxf/upload.test.ts`, `scripts/dxf-browser.mjs` | DXF parser dependency, geometry regressions and browser import/export checks. |
| Raster input and walls | `src/trace/rasterInput.ts`, `src/trace/raster.ts`, `src/trace/walls.ts` | Full-resolution image conversion, faint-wall contrast and edge sampling during deskew. |
| Raster scale, rooms and text | `src/trace/scale.ts`, `src/trace/rooms.ts`, `src/trace/text.ts` | Check scale agreement across rooms, reuse image buffers when fitting room edges, and limit OCR workers. |
| Trace worker and preview | `src/studio/autotrace.worker.ts`, `src/trace/solve.ts`, `src/studio/draw.ts` | Prepare images off the main thread and carry the selected region’s rotation through to the canvas. |
| Upload benchmark | `src/trace/eval/uploads.test.ts`, `src/data/fixtures/two-room-floor.dxf`, `Docs/AUTOTRACE_SCORER.md`, `package.json` | Exercise the production upload button and compare the resulting floor drafts with reference geometry. |
| Raster regression tests | `src/trace/contrast.test.ts`, `src/trace/raster.test.ts`, `src/trace/solve.test.ts`, `src/trace/scale.test.ts`, `scripts/raster-upload-browser.mjs` | Cover faded walls, border pixels, rotated selection, scale evidence and whole-floor calibration through Studio. |
| OCR regression tests and sample | `src/trace/text.test.ts`, `src/trace/textPasses.test.ts`, `src/data/fixtures/metric-room.pgm` | Check name and unit parsing, then exercise the OCR reader on sideways text, an L-shaped room and a grayscale image of a kitchen with metric dimensions. |
| 3D loading and lighting | `src/three/PlotlineScene.ts`, `src/three/materials.ts`, `src/three/render.ts`, `src/three/lightsMode.ts` | Initial scene readiness, furniture and finish loading, and lighting-mode integration. |
| Viewer and overlays | `src/viewer/ViewerApp.tsx`, `src/viewer/Minimap.tsx`, `src/viewer/Notes.tsx`, `src/viewer/SunPill.tsx` | Viewer startup, camera projection and overlay updates. |
| Contributor and operator guides | `Context_Plotline.md`, `Docs/MANUAL.md`, `Docs/KEYS.md` | Project onboarding, DXF workflow and controls, and guidance for pale scans. |
