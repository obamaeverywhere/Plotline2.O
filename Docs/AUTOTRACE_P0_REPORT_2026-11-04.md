# P0 tracing: room closure and shared-space ownership — 2026-11-04

This patch addresses missing boundaries and shared spaces being assigned to apartments through general tracing,
geometry and text-association rules. Production code contains no drawing-specific coordinates or expected room
polygons. It builds on the [previous window/ownership checkpoint](AUTOTRACE_OWNERSHIP_REPORT_2026-11-03.md).

## What changed

**Opening evidence is checked at the final scale and native resolution, after room fitting.** Small-plan enlargement
now scales the local door-arc contrast window too. A faint swing needs agreement between contrast cuts, a straight
leaf, a clear interior and an isolated ring. The weakest accepted readings retain low confidence and a review item.
Plant masks exclude foliage from these probes. The contrast calculation uses an equivalent counting test instead
of sorting a pixel window for every probe; a median-reference regression checks threshold ties and several radii.

**Windows can sit inside a frame rather than on the wall centre.** The colour probe allows a small frame margin and
requires a continuous line at one offset. Scattered colour, distant colour and broad filled-floor colours do not get
that treatment. The room closer also receives the positive glazing mask, so a faint coloured pane against a dark
floor can close a room while the existing size checks remain in force.

**Double-action doors have their own structural context.** A half-circle swing around a wall tip can represent doors
on its two sides. The detector requires a structural wall tip, another jamb, matching arc evidence and clear floor.
Closed circles, concentric rings, incomplete quarters, solid walls across the gap, missing jambs and zone lines are
negative tests. The detector works in the wall's local coordinates; rotated examples are tested.

**An explicitly open kitchen's work area is distinct from the shared room's outer boundary.** Positive exterior
glazing can enclose living/dining and an open kitchen together. A work-zone fit can no longer erase that exterior
boundary or apply its small printed dimensions to the entire room. Closed bedroom/bathroom fits and actual cuts
through fitted rooms retain their rejection checks. The living label names the shared space when an open-kitchen
label also lies inside it. The secondary zone can still appear in review as sharing that room.

**Text belongs to the actual face.** Whole-face and rejected-strip OCR crops mask pixels outside the room polygon,
including concave cut-outs. Mixed-case shaft labels are readable; recovered core words need agreeing views. The
joined LI glyph read as U expands only to an exact room word. Late labels refresh ownership masks without re-erasing
the image or retracing walls, preserving the existing geometry and scale.

**Shared-space evidence wins at assignment time.** A closed core label is bounded by its face; the proximity/flood
fallback remains for unclosed cores. Matching adjacent, dimensioned person-capacity enclosures without residential
names provide a reviewed fallback for unreadable lift labels. Core evidence overrides an earlier apartment flood
claim. Whole-floor exports retain core faces even when another core face separates them from an apartment. Shared
boundary walls can remain in a selected-flat export while their spaces remain unassigned to the apartment.

## Measurements

All **37 Firefox workflows on 29 available source images** completed on the same final source fingerprint, with
no page errors. Wall-width editing changed one wall from 6 to 8 inches, Undo restored it, and Walk/Dollhouse both
rendered a canvas without the fallback view.

| Calibrated Banani L2–6 measurement | Before | After |
|---|---:|---:|
| Derived closed rooms | 17 | 22 |
| Named rooms | 12 | 17 |
| Validation issues | 26 | 12 |
| Correct apartment witnesses in whole-floor export | 7/12 | 12/12 |
| Closed, unassigned shared-core witnesses in whole-floor export | 0/3 | 3/3 |

The newly closed spaces include formal living, dry kitchen, the north master bedroom and Unit B's shared
living/open-kitchen space. The two previously claimed lifts and the stair/lift lobby remain outside apartments.
Across five calibrated whole-floor/flat-pick workflows, **60/60 apartment and 15/15 shared-core checks pass**.
Each apartment produces identical geometry from its living-room and bedroom clicks. A selected-flat export may
omit a core face; the whole-floor checks additionally require a closed core face at each marked location.

The original eight glazing lines retain **736/736 covered samples** at the unchanged 3 px / 5° tolerance in both
calibrated and automatic modes. Sample-region precision is now 98.9% in both, versus 100% calibrated and 99.1%
automatic before: there are eight additional predicted samples outside the annotated lines. This is a small
coverage/overrun tradeoff, not a claim of perfect window detection.

Five existing hand-traced references, measured against whole-floor exports:

| Reference flat | Matched rooms before → after | Wall recall before → after | Wall precision before → after |
|---|---:|---:|---:|
| Sheltech A | 17/21 → 17/21 | 72.4% → 72.4% | 64.3% → 64.3% |
| Sheltech B | 15/20 → 15/20 | 71.2% → 71.2% | 73.8% → 73.8% |
| BTI B | 21/22 → 21/22 | 94.9% → 94.9% | 84.2% → 84.2% |
| BTI C | 20/26 → 20/26 | 91.9% → 91.9% | 81.5% → 81.5% |
| BTI A | 16/27 → 16/27 | 61.0% → 64.7% | 67.6% → 68.5% |

**Regressions and unresolved coverage remain.** Sheltech Level 3 loses one derived face and three names; Banani
Level 7 loses two faces and one name, and Level 8 loses two names despite gaining a face. Sheltech Levels 5/6
retain their room/name counts but gain two validation issues each. BTI ground loses one unnamed face, and Banani
ground loses three. These sheets lack complete independent ground truth; the reductions are recorded, not
classified as improvements. Automatic scale/OCR and geometry still need further work. The full per-case table
retains all these results. Runtime comparisons are observational because the runs used different machine loads.

The living/open-kitchen witnesses describe two locations in one open-plan space. Witness checks are spot checks,
not complete room/flat polygon ground truth. The east lift witness was moved from the partition vicinity to the
centre of the source enclosure. New witnesses cover the master bedroom, formal living, dry kitchen, living/open
kitchen and stair/lift lobby. They are evaluation inputs and never enter Auto-trace.

## Validation

- Full automated suite: **1,304 passed, 27 skipped, 1 todo**. Production build, including TypeScript, passed.
- Firefox uses the real Studio: image upload, scale tool where specified, Auto-trace, whole-floor or flat selection,
  then Export. Expected annotations and existing unit files are used only to measure completed exports.
- The browser harness records the source fingerprint, rejects source changes during a workflow, and resumes only
  matching-version results. The published after results must pass the current-source and shared-ownership gates.
- Wall editing, Undo, Walk and Dollhouse are checked through the UI on the recovered floor. Preview is a smoke
  check, not a geometric accuracy measurement. The captured test log and provenance contain the final results.
- The previous checkpoint's 37 UI exports form the baseline. The existing five hand-traced reference flats keep
  their 15 cm wall and 0.6 room-IoU evaluation tolerances. Room counts alone are not accuracy.

Uncertain openings, unreadable names, size mismatches and unresolved gaps still need review. The available corpus
does not establish perfect tracing for unseen designs. The separate expanded 30-sheet benchmark still lacks its
source images; its coverage gate remains unmet.

## Evidence and reproduction

The [evidence directory](tracing-evidence/2026-11-04-p0/) contains all 37 comparison rows, measurement JSON,
before/after Studio screenshots, source-coordinate overlays, witness locations, boundary results, edit/Undo/3D
evidence, test/build logs and source hashes. Full UI exports remain in ignored `.trace/p0/{before,after}`.

Serve the current checkout locally, then run:

```sh
TRACE_URL=http://127.0.0.1:5173 node scripts/trace-browser.mjs scripts/trace-cases.json <output-directory>
TRACE_BROWSER_DIR=<output-directory> npx vitest run src/trace/acceptance.test.ts
node scripts/check-trace-results.mjs <output-directory> --require-shared --require-source
node scripts/trace-compare.mjs <before-directory> <output-directory> <report-directory>
```

Set `TRACE_RESUME=1` to reuse completed workflows with the same source fingerprint. The app server must serve that
checkout. `TRACE_EDIT` and `TRACE_PREVIEW` accept a case key for the optional normal edit/Undo and 3D checks.

See the [complete comparison table](tracing-evidence/2026-11-04-p0/table.md) and
[machine-readable measurements](tracing-evidence/2026-11-04-p0/comparison.json).
