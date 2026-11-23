/// <reference types="node" />
/** Optional real-image diagnostics and measurements of drafts exported through the Firefox UI. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { expect, test } from 'vitest'
import { deriveFlats, deriveRooms, parseLength, pointInPolygon, roomPolygon, validate } from '../core'
import type { Unit } from '../core'
import { initialState } from '../studio/model'
import { sizeCheck, studioReducer } from '../studio/review'
import { registerTruth, truthLines } from './eval'
import { loadPgm, loadPpm, writeOverlay, writeUnitOverlay } from './evalio'
import { prepare, pickFloor, eraseText } from './solve'
import { furnitureMask, hatchMask, dashMask } from './raster'
import { inkThreshold, traceWalls } from './walls'
import { scoreSolve, withWallScore } from './solveEval'
import type { AutoTraceResult } from './types'

const env = process.env
const units = Object.values(import.meta.glob<Unit>('../data/units/*.json', { eager: true, import: 'default' }))
const out = env.TRACE_OUT ?? '.trace/diagnostics'

test.skipIf(!env.TRACE_MASKS)('inspect preprocessing', () => {
  mkdirSync(out, { recursive: true })
  const g = loadPgm('.trace/fixtures/Sheltech__Level_2.pgm')!
  const saved = JSON.parse(readFileSync('.trace/baseline-diagnostics/stages.json', 'utf8'))
  const plan = eraseText(g, saved.text), k = 95 / parseLength(`11'-6"`)!, t = inkThreshold(plan, {})
  const masks = { furniture: furnitureMask(plan,k,t), hatch: hatchMask(plan,k,t), dash: dashMask(plan,k,t) }
  const results = []
  for (const [key, plant] of [['raw',undefined], ['no-contrast',undefined], ['native',undefined], ...Object.entries(masks), ['all', plan.data.map((_,i) => masks.furniture?.[i] || masks.hatch?.[i] || masks.dash?.[i] || 0)]] as [string, Uint8Array | undefined | null][]) {
    const trace = traceWalls(plan, { halfPx: .127*k/2, tracker:'tracks', plant: plant ?? undefined, ...(key === 'no-contrast' ? {minContrast:0} : {}), ...(key === 'native' ? {upscale:1} : {}) })
    writeOverlay(join(out, `${key}.png`), g, trace)
    results.push({key,walls:trace.walls,openings:trace.openings})
  }
  writeFileSync(join(out,'mask-traces.json'),JSON.stringify(results,null,2))
}, 600000)

test.skipIf(!env.TRACE_DIAGNOSTIC)('inspect real sheet stages', async () => {
  mkdirSync(out, { recursive: true })
  const g = loadPgm('.trace/fixtures/Sheltech__Level_2.pgm')!
  const rgb = loadPpm('.trace/fixtures/Sheltech__Level_2.ppm')!
  const prep = await prepare(g, { pxPerM: 95 / parseLength(`11'-6"`)!, rgb, ocr: { cachePath: '.trace/tess' } })
  writeFileSync(join(out, 'stages.json'), JSON.stringify({ text: prep.traces.text, trace: prep.traces.trace, draft: prep.traces.draft.unit, fits: prep.traces.fits }, null, 2))
  writeOverlay(join(out, 'wall-stage.png'), g, prep.traces.trace)
  const result = pickFloor(prep)
  const imported = studioReducer(initialState(), { type: 'auto-trace', result })
  writeFileSync(join(out, 'result.json'), JSON.stringify({ ...result, unit: imported.unit }))
  writeUnitOverlay(join(out, 'imported.png'), g, imported.unit, result.review)
  expect(result.unit.walls.length).toBeGreaterThan(0)
}, 600000)

test.skipIf(!env.TRACE_BROWSER_DIR)('measure real UI exports', () => {
  const cases = JSON.parse(readFileSync('scripts/trace-cases.json', 'utf8')) as Record<string, { file: string }>
  const dir = env.TRACE_BROWSER_DIR!
  const rows = []
  const ownership = JSON.parse(readFileSync('scripts/trace-ownership.json','utf8')) as {file:string;selected:Record<string,string>;points:{name:string;at:[number,number];flat:string|null}[]}
  for (const [key, spec] of Object.entries(cases)) {
    const path = join(dir, `${key}.unit.json`)
    if (!existsSync(path)) continue
    const u = JSON.parse(readFileSync(path, 'utf8')) as Unit & { review?: { stats?: AutoTraceResult['stats']; items?: AutoTraceResult['review'] } }
    const rooms = deriveRooms(u), flats = deriveFlats(u, rooms)
    const issues = validate(u)
    const sizes = rooms.flatMap((r) => { const check = sizeCheck(u, r.id, rooms); return check ? [{ name: r.name, ...check }] : [] })
    const witnesses = ownership.file === spec.file ? ownership.points.map((p) => {
      const image=u.planImage!,at={x:(p.at[0]-image.originPx.x)/image.pxPerM,y:(p.at[1]-image.originPx.y)/image.pxPerM}
      const face=rooms.filter((r)=>pointInPolygon(at,roomPolygon(r,u))).sort((a,b)=>a.areaSqm-b.areaSqm)[0]
      const selected=ownership.selected[key],excluded=!!selected && p.flat!==null && p.flat!==selected
      const owner=face ? flats.find((f)=>f.roomIds.includes(face.id))?.name??null : null
      return {name:p.name,expected:excluded?'outside selected flat':p.flat,found:face ? owner : 'no closed face',closed:!!face,pass:p.flat===null ? (face ? owner===null : selected ? true : null) : excluded ? !face : face ? owner===p.flat : null}
    }) : []
    const report = { key, walls: u.walls.length, rooms: rooms.length, labelled: rooms.filter((r) => !/^Space \d+$/.test(r.name)).length, flats: flats.map((f) => ({ name: f.name, rooms: f.roomIds.length })), issues: issues.map((i) => i.code), review: u.review?.items?.length, sizes, ownership:witnesses, truth: [] as unknown[] }
    // Only compare the five existing hand-traced flats, at their documented 15 cm wall tolerance / IoU .6.
    const fixture = basename(spec.file).replace(/\.(png|jpe?g|webp)$/, '')
    const asset = fixture === 'img_3' ? 'plan-2nd-floor.webp' : fixture === 'img_2' ? 'plan-3rd-floor.webp' : spec.file.includes('/Sheltech/') && fixture === 'Level 2' ? 'plan-sheltech-l2.jpg' : ''
    for (const truth of units.filter((t) => /^(unit_type_[abc]_|unit_sheltech_[ab]_)/.test(t.id) && t.planImage?.src.endsWith(asset) && asset)) {
      const g = loadPgm(`.trace/fixtures/assets__${asset.replace(/\.(webp|jpg)$/, '')}.pgm`)!
      const res = { unit: u, review: u.review?.items ?? [], stats: u.review?.stats ?? { pxPerM: u.planImage!.pxPerM, ms: 0, scaleFrom: 'given' } } as AutoTraceResult
      const score = withWallScore(scoreSolve(res, truth), res, truth, registerTruth(g, truth))
      report.truth.push(score)
      writeUnitOverlay(join(dir, `${key}-${truth.id}-overlay.png`), g, u, [], truthLines(truth))
    }
    rows.push(report)
  }
  writeFileSync(join(dir, 'measurements.json'), JSON.stringify(rows, null, 2))
  console.log(JSON.stringify(rows.map(({ key, rooms, labelled, truth }) => ({ key, rooms, labelled, truth }))))
  expect(rows.length).toBeGreaterThan(0)
}, 600000)
