# The 30-sheet scorer (session 26, step 0)

One command tells, for 30 real brochure sheets, how many PRINTED rooms Auto-trace closes and names right — the number the
founder counts in the Studio after: drop the sheet, S on a printed size, Auto-trace → Whole floor (or a click on the flat).
It runs in node, in minutes, so every change to the tracer can be measured. The Firefox harness (`E:/dev/tmp/s25/run.mjs`)
stays the proof at each checkpoint.

## Automatic uploads on the included drawings

With dependencies installed, run `npx playwright install firefox` once and then `npm run bench:uploads`. The command builds the application, starts a loopback preview and uploads each original image in a fresh Firefox context. It supplies no calibration or room hints. The harness serves installed OCR assets and the repository's English model for intercepted OCR requests.

The three inputs are BTI second floor (Type A), BTI third floor (Types B and C) and Sheltech Level 2 (Types A and B). Each reference Unit names its source image in `planImage.src`. Compare each flat separately because some flats share spaces. The reference labels are hand-authored. Their parenthetical location notes are retained in the report and excluded from name matching, so “AOD (bath-3)” is checked as “AOD”.

- `.trace/upload-benchmark/results.json` records elapsed upload-to-draft time, open review count, scale source and signed scale error in percent. For each reference it counts labels in correctly named closed rooms with the existing scorer's kind/number rules and matches room polygons one-to-one at 60% intersection over union. Per-label outcomes identify open, merged, unnamed and misnamed rooms. A passed run means all source files produced scorable exports. Actual accuracy is in the recorded counts.
- `.trace/upload-benchmark/dxf.json` records a synthetic two-room CAD control. Studio accepts a manually mapped layer on the first floor, then imports a second floor with an added furniture layer automatically. Assertions cover both room names, seven wall segments, a door and a window.

The three images cover five reference flats. Measuring the percentage of customer floors accepted without edits requires an actual operator decision on each finished drawing. Review-row counts alone cannot establish it.

### Baseline measured on 24 November 2026

All three uploads inferred scale from printed dimensions. Each row compares the exported whole floor with the named reference flat. Elapsed times in the JSON are specific to the test machine.

| Floor and reference flat | Closed and named at reference label | Room outline overlap ≥ 60% | Scale error |
| --- | ---: | ---: | ---: |
| BTI second, A | 20 / 27 | 16 / 27 | -1.66% |
| BTI third, B | 19 / 22 | 21 / 22 | -0.23% |
| BTI third, C | 20 / 26 | 20 / 26 | -0.23% |
| Sheltech Level 2, A | 16 / 21 | 17 / 21 | +0.84% |
| Sheltech Level 2, B | 12 / 20 | 15 / 20 | +0.84% |

## Run it

Current portable setup (2026-11-03):

```sh
npm ci
npx playwright install firefox
node scripts/trace-fixtures.mjs --rgb --sheets src/trace/eval/sheets30.json .trace/fixtures
npm run score30
```

Old Windows image references are resolved using their `Demo drawings/` suffix under this checkout (or `TRACE_REPO`).
The scorer now defaults to `.trace/{fixtures,out,text,tess}`; `SCORE30_*` overrides still work, with or without trailing slashes.
Fixture preparation writes `availability.json`. The scorer writes `coverage.json` and **fails if any requested sheet is
missing**, even if the available subset runs. All 30 expanded-benchmark source images are absent in this checkout as of
2026-11-03; this is not a benchmark pass. See [the current report](AUTOTRACE_REPORT_2026-11-03.md).

The images that are present can be exercised independently through the real Studio:

```sh
node scripts/trace-fixtures.mjs --rgb .trace/fixtures
npm run dev -- --host 127.0.0.1
# In another terminal (each case uses a fresh Firefox context):
node scripts/trace-browser.mjs scripts/trace-cases.json .trace/browser
TRACE_BROWSER_DIR=.trace/browser npx vitest run src/trace/acceptance.test.ts
```

`trace-cases.json` contains 37 workflows across all 29 available source sheets, including calibration and flat-selection cases.
`TRACE_URL` selects the server; an optional final `key,key` argument selects cases. `TRACE_RESUME=1` reuses successful cases only when their production source fingerprint matches. `TRACE_EDIT=<key>` checks a wall-width edit and Undo (use a case with a suitable `editAt` pixel position), and
`TRACE_PREVIEW=<key>` enters the actual walk and dollhouse views. Image upload, scale and tracing happen through UI
controls; exported JSON is used only afterward for measurement. `scripts/trace-compare.mjs beforeDir afterDir reportDir`
compares two measured runs. Counts and screenshots are not independent ground truth for every room or wall.

The [2026-11-04 P0 checkpoint](AUTOTRACE_P0_REPORT_2026-11-04.md) adds source-version and shared-core gates:

```sh
node scripts/check-trace-results.mjs .trace/browser --require-shared --require-source
```

The source fingerprint covers production files under `src`; the server must serve that checkout. The browser
harness rejects changes during a workflow. The shared-core gate checks annotated locations, with closed faces
required in whole-floor exports; it does not establish full ownership-polygon accuracy.

Historical Windows setup (the folders and external harness below may not exist on a new machine):

```
node scripts/trace-fixtures.mjs --rgb --sheets src/trace/eval/sheets30.json   # once: the sheet pictures → E:/dev/tmp/s26/fixtures (Firefox, ~10 s)
npm run score30                                                                # all 30; the table at the end
SCORE30_SHEETS=bti-amabilia-typea,cpdl-skymark-unitd npm run score30           # a few sheets (PowerShell: $env:SCORE30_SHEETS='…'; npm run score30)
SCORE30_FRESH=1 npm run score30                                                # read the text again (the cache is normally enough)
```

Per sheet it does exactly what the Studio does: the picture decoded as `StudioApp.tsx rastersOf` (white under transparent
pixels, the same luma), the S tool's scale (`pxPerM` = the distance between `scale.a` and `scale.b` ÷ the printed length),
`prepare` → `pickFloor` (Whole floor) or one `pick` per `flats[].at` when the sheet says `"floor": false`, and the result
imported as the Studio imports it (`studioReducer` 'auto-trace': walls joined, a printed name standing in an unnamed room
names it). Then it scores that unit.

**Speed.** The text reading (tesseract) is cached per sheet in `E:/dev/tmp/s26/text/<key>-<hash>.json`; the hash covers
`src/trace/text.ts`, `src/trace/sizes.ts`, the tesseract.js version and the page it reads — change any of them and that
sheet is read again. Tesseract's data comes from `E:/dev/tmp/wave19/reader/tess/` (nothing is downloaded). Everything after
the reading (walls, rooms, the face re-reads, names) runs every time. Folders: `SCORE30_FIXTURES`, `SCORE30_TEXT`,
`SCORE30_OUT`, `SCORE30_TESS`.

## What comes out

`E:/dev/tmp/s26/out/`: `score30.txt` (the table + headline), `score30.json` (the rows), and per sheet `<key>.json` (every
printed room with its state and the traced room's name / area there, the false rooms, the pillars in rooms, the traced
counts) and `<key>.png` — the draft on the sheet (rooms tinted by kind, walls red, openings blue / cyan / magenta, review
marks yellow / orange) with every printed room as a dot: **green = closed and named right, red = anything else**.

## The columns

| column | meaning |
|---|---|
| printed | rooms printed on the sheet (the flats' rooms; the core is counted apart) |
| closed+named right | the room around the printed point is closed and carries a right name: the tracer's own kind of both names (`text.ts classifyRoom`) is the same, and the number when the print carries one ("Suite 2" on SUITE-2 / BED-2 is right, "Bed 1" or "Bed" on BED-2 is wrong; a core room also shares a word: Lobby is no Stair) |
| wrong name | closed, carries another name |
| unnamed | closed, "Space N" |
| merged | its room holds another printed room too — right only for the one whose name it carries |
| open | no closed room there, or only one bigger than `KNOBS.maxRoomSqm` (90 m²) |
| core right/printed | the same for lobby / lift / stair / corridor |
| false rooms | closed rooms of 1 … 90 m² holding no printed room (furniture, fills, slivers) |
| pillars in rooms | pillars touching no wall that bounds a closed room — a chair, sofa or counter taken for a column. (The tracer keeps only pillars some draft wall runs into, so "touches no wall at all" never happens: the walls a chair touches are its own table / sofa lines, which close no room.) A proxy: on Assure Hermitage it flags 8 of the 12 furniture "pillars" and 1 of the 6 real columns (one whose room is still open) |
| names read | printed rooms whose name Auto-trace read (`stats.printed`: the right name within 3 m) |
| s | seconds for the sheet (the text reading only when not cached) |

Headline: **"N of M printed rooms closed and named right = P %"** (flat rooms), then the same with the core, then names read.

## The 30 sheets and adding one

`src/trace/eval/sheets30.json`: per sheet `file, w, h, scale {a, b, len, what}, flats, floor?, style` (the first fields as in
the session-25 batch files `E:/dev/tmp/s25/batch{A..I}.json`) and `expected` — every printed room once:
`{ name, size?, at: [x, y], core?: true, flat? }` — the sheet's own words, the size as printed, a point well inside the room
in IMAGE px, `core` for lobby / lift / stair / corridor, `flat` on multi-flat sheets (the flat-click name on `floor: false`
sheets). Not rooms: ducts / risers / shafts, voids, AC outdoor units, D.W, FHC / FHB, SDB, W/M, fridge, TV, notes,
dimension strings, title text, the key plan. Planters / GREEN with a printed name are rooms.

To add a sheet: put its entry in `sheets30.json` (take the scale from a printed size: two image-px points on the room's wall
faces and the printed length), run the fixture script, and place every room's point by looking at grid crops of the sheet
(session 26 used `E:/dev/tmp/s26/work/crop.mjs <key> x y w h k out.png [points.json]`: a crop with an image-px grid and
the points drawn on it; `seeds.mjs <key>` lists the names the reader found with their centres).

## Proof in Firefox

`PLAYWRIGHT_BROWSERS_PATH=E:/dev/tools/ms-playwright ROOT=<checkout> PORT=5440 OUT=E:/dev/plotline-shots/s26/<tag> node E:/dev/tmp/s26/run.mjs src/trace/eval/sheets30.json <key>,<key> <tag>`
— the real Studio, one sheet at a time, 10-minute cap; count on the `-names.png` / quarter shots and the page text.
`E:/dev/tmp/s26/run.mjs` is the session-25 harness plus one step: it clicks Export after the trace and saves the unit the
founder now has as `<OUT>/<key>-floor.unit.json`. `SCORE30_BROWSER=<OUT> SCORE30_SHEETS=<key> SCORE30_PXPERM=<its pxPerM>
npm run score30` then scores that unit beside the node one and lists every room whose state differs (the browser's scale
comes from mouse clicks, so it is a few tenths of a percent off the exact one — `SCORE30_PXPERM` gives node the same).

## Starting number (2026-10-15, commit 1067c0d — before step 1)

| sheet                      | printed | closed+named right | wrong name | unnamed | merged | open | core right/printed | false rooms | pillars in rooms | names read |   s |
|----------------------------|--------:|-------------------:|-----------:|--------:|-------:|-----:|-------------------:|------------:|-----------------:|-----------:|----:|
| bti-amabilia-typea         |      16 |                  3 |          1 |       0 |      2 |   10 |                1/3 |           2 |                0 |          3 |  10 |
| bti-magnifico-unita        |      27 |                  1 |          1 |       1 |      0 |   24 |                0/5 |           5 |                0 |          2 |  15 |
| bti-cosmopolis-t4typea     |       9 |                  8 |          1 |       0 |      0 |    0 |                0/0 |           0 |                2 |          8 |  16 |
| bti-silvi-5th7th           |      29 |                 15 |          2 |       1 |      2 |    9 |                1/4 |           6 |                1 |         20 |   9 |
| bti-peak-typef-1397        |      11 |                  3 |          2 |       1 |      0 |    5 |                1/2 |           2 |                3 |          9 |   5 |
| bti-fernhill-2nd3rd        |      16 |                  7 |          0 |       0 |      0 |    9 |                0/3 |           1 |                2 |          8 |  15 |
| bti-lamontana-t1typeb      |      18 |                  3 |          0 |       4 |      6 |    5 |                1/5 |           3 |                3 |          6 |  11 |
| bti-lamontana-t1typea      |      14 |                  3 |          0 |       3 |      2 |    6 |                0/5 |           1 |                2 |          5 |  12 |
| rangs-torukabbo-typea      |      13 |                  8 |          0 |       0 |      1 |    4 |                0/0 |           2 |                0 |         13 |   3 |
| rangs-sanctuary-12th-roof  |      17 |                 13 |          0 |       0 |      0 |    4 |                1/4 |           4 |                0 |         14 |   6 |
| rangs-whitelake-ab-fl3     |      24 |                 12 |          0 |       0 |      0 |   12 |               1/10 |           7 |                0 |         24 |   7 |
| rangs-ixora-ef             |      22 |                  6 |          0 |       0 |      0 |   16 |                0/0 |           7 |                8 |         20 |   6 |
| sheltech-kanakchapa-l4-a   |      14 |                  6 |          0 |       1 |      1 |    6 |                0/0 |           1 |                7 |         10 |  44 |
| sheltech-waterlily-typical |      35 |                 19 |          2 |       0 |      1 |   13 |                0/4 |          12 |                2 |         28 |  10 |
| sheltech-siddiques-typea   |      14 |                  4 |          2 |       1 |      0 |    7 |                2/3 |           2 |                3 |          9 |   3 |
| assure-gladiolus-2nd6th    |      15 |                  0 |          0 |       0 |      0 |   15 |                0/3 |           0 |                0 |          0 |   9 |
| assure-phera-1st           |      16 |                  6 |          1 |       0 |      1 |    8 |                0/3 |           1 |                9 |         10 |  13 |
| assure-hermitage-typical   |      20 |                  4 |          1 |       0 |      0 |   15 |                0/5 |           2 |                9 |         11 |  16 |
| cpdl-skymark-unitd         |      15 |                  9 |          1 |       0 |      0 |    5 |                0/0 |           1 |                0 |         11 |   7 |
| cpdl-joljhiri-unita        |      14 |                 12 |          0 |       0 |      1 |    1 |                0/0 |           0 |                3 |         13 |  11 |
| cpdl-lareina-amber         |      19 |                  2 |          1 |       1 |      0 |   15 |                0/0 |           0 |                0 |          2 |   5 |
| finlay-chayaneer-typeb     |      16 |                  9 |          2 |       0 |      4 |    1 |                0/3 |           6 |                6 |         12 |  17 |
| finlay-nirvana-typical     |      31 |                 28 |          0 |       0 |      0 |    3 |                0/4 |          11 |                1 |         31 |   8 |
| finlay-palmspring-typea    |      12 |                  0 |          0 |       0 |      0 |   12 |                0/1 |           1 |                2 |          0 |  10 |
| ena-azmaryvilla-typea      |      14 |                  0 |          0 |       0 |      0 |   14 |                0/0 |           0 |                0 |          0 |   4 |
| ena-jahanlodge-typea       |       9 |                  1 |          0 |       0 |      0 |    8 |                0/0 |           0 |                0 |          0 |   3 |
| accept-aftabnagar-typical  |      12 |                  0 |          0 |       0 |      0 |   12 |                0/3 |           0 |                0 |          1 |   7 |
| eh-pearl-2145              |      18 |                 14 |          0 |       0 |      0 |    4 |                2/3 |           2 |                0 |         14 |  33 |
| eh-sapphire-unita          |      15 |                  5 |          2 |       0 |      0 |    8 |                0/5 |           3 |                4 |          6 |  26 |
| mir-mrmemento-typeb        |      17 |                  3 |          0 |       0 |      0 |   14 |                0/4 |           0 |                0 |          2 |  16 |
| TOTAL                      |     522 |                204 |         19 |      13 |     21 |  265 |              10/82 |          82 |               67 |        292 | 356 |
204 of 522 printed rooms closed and named right = 39.1 %
with the core: 214 of 604 = 35.4 %
names read: 292 of 522 = 55.9 %

Run time: 5.9 min with the text cached, 9.4 min reading every sheet.
