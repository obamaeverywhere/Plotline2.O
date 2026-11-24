import { TOUCH_M, deriveFlats, deriveRooms, flatTypeOf, formatFeetInches, newId, parseLength, pointInPolygon, printedSizeCheck, roomInnerPolygon, roomPolygon, sqmToSqft, validate } from '../core'
import type { Id, OpeningKind, Pt, Unit, Vertex, Wall } from '../core'
import { classifyRoom, normaliseName, parseArea, parseDims } from '../trace/text'
import { drawingChoices, entitiesForDrawing } from './drawings'
import { vectorSegments, type Segment } from './curves'
import type { BuildDxfOptions, DxfImportResult, DxfReviewItem, LayerRole, VectorEntity, VectorSheet } from './types'
import { sourceScale } from './units'

const PARTITION = 0.127, HEIGHT = 3.048
const MAX_WALL_SEGMENTS = 6000
type RawOpening = { center: Pt; width: number; kind: OpeningKind; sourceId: string; guessId?: string }
type RawWall = { a: Pt; b: Pt; thickness: number; layer: string; paired?: boolean; openings?: RawOpening[] }
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y
const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k })
const unitVec = (v: Pt): Pt => { const n = Math.hypot(v.x, v.y); return n ? { x: v.x / n, y: v.y / n } : { x: 0, y: 0 } }
const mid = (a: Pt, b: Pt): Pt => mul(add(a, b), 0.5)
const fromSource = (p: { x: number; y: number }, factor: number, origin: Pt): Pt => ({ x: (p.x - origin.x) * factor, y: (origin.y - p.y) * factor })

/** Extract the wall centreline/thickness from a pair of parallel wall faces; unmatched linework remains a single wall. */
export function extractWallRuns(segments: Segment[], scale: number): RawWall[] {
  const S = segments.map(s => ({ ...s, a: { x: s.a.x * scale, y: s.a.y * scale }, b: { x: s.b.x * scale, y: s.b.y * scale } }))
    .filter(s => dist(s.a, s.b) > 0.08)
  if (S.length > MAX_WALL_SEGMENTS) throw new Error('The selected wall layers contain too much linework (over 6,000 wall segments). Map fewer layers or split the drawing.')
  const pairs: { i: number; j: number; wall: RawWall; overlap: number }[] = []
  for (let i = 0; i < S.length; i++) {
    const A = S[i], u = unitVec(sub(A.b, A.a)), n = { x: -u.y, y: u.x }, la = dist(A.a, A.b), ma = mid(A.a, A.b)
    for (let j = i + 1; j < S.length; j++) {
      const B = S[j], v = unitVec(sub(B.b, B.a))
      if (Math.abs(cross(u, v)) > 0.035) continue
      const mb = mid(B.a, B.b), separation = Math.abs(dot(sub(mb, ma), n))
      if (separation < 0.06 || separation > 0.46) continue
      if (Math.abs(dot(sub(mb, ma), u)) > 1.0) continue
      const pa = [dot(sub(A.a, ma), u), dot(sub(A.b, ma), u)].sort((x, y) => x - y)
      const pb = [dot(sub(B.a, ma), u), dot(sub(B.b, ma), u)].sort((x, y) => x - y)
      const lo = Math.max(pa[0], pb[0]), hi = Math.min(pa[1], pb[1]), overlap = hi - lo
      if (overlap < Math.min(la, dist(B.a, B.b)) * 0.45 || overlap < 0.2) continue
      const signed = dot(sub(mb, ma), n)
      const centerN = signed / 2
      const origin = add(ma, mul(n, centerN))
      const a = add(origin, mul(u, lo)), b = add(origin, mul(u, hi))
      pairs.push({ i, j, overlap, wall: { a, b, thickness: separation, layer: A.layer, paired: true } })
    }
  }
  pairs.sort((a, b) => b.overlap - a.overlap)
  const used = new Set<number>(), walls: RawWall[] = []
  for (const p of pairs) if (!used.has(p.i) && !used.has(p.j)) { used.add(p.i); used.add(p.j); walls.push(p.wall) }
  for (let i = 0; i < S.length; i++) if (!used.has(i)) walls.push({ a: S[i].a, b: S[i].b, thickness: PARTITION, layer: S[i].layer })
  return walls
}

/** Join matching wall fragments across CAD door gaps; every inferred gap is retained as a review item. */
export function joinWallGaps(input: RawWall[], review: DxfReviewItem[]): RawWall[] {
  const walls: RawWall[] = input.map(w => ({ ...w, openings: [...(w.openings ?? [])] }))
  for (let i = 0; i < walls.length; i++) {
    // Extend this run to its nearest compatible neighbour first. Joining a farther
    // fragment can otherwise turn an intervening solid pier into part of a doorway.
    while (true) {
      const a = walls[i]
      const dir = unitVec(sub(a.b, a.a))
      const length = dist(a.a, a.b)
      let nearest: { index: number; lo: number; hi: number; gap: number; gapStart: number } | undefined
      for (let j = i + 1; j < walls.length; j++) {
        const b = walls[j]
        if (Math.abs(a.thickness - b.thickness) > 0.08 || Math.abs(cross(dir, unitVec(sub(b.b, b.a)))) > 0.02) continue
        if (Math.abs(cross(sub(mid(b.a, b.b), a.a), dir)) > 0.035) continue
        const p = dot(sub(b.a, a.a), dir), q = dot(sub(b.b, a.a), dir)
        const start = Math.min(p, q), end = Math.max(p, q)
        const gap = Math.max(start - length, -end)
        if (gap < 0 || gap > 1.6 || (nearest && gap >= nearest.gap)) continue
        nearest = { index: j, lo: Math.min(0, start), hi: Math.max(length, end), gap, gapStart: end <= 0 ? end : length }
        if (gap === 0) break
      }
      if (!nearest) break
      const { index, lo, hi, gap, gapStart } = nearest
      const b = walls[index]
      const openings = [...(a.openings ?? []), ...(b.openings ?? [])]
      if (gap >= 0.25) {
        const kind: OpeningKind = gap >= 1.25 ? 'slider' : 'door'
        const center = add(a.a, mul(dir, gapStart + gap / 2)), guessId = newId()
        openings.push({ center, width: gap, kind, sourceId: guessId, guessId })
        review.push({ id: guessId, at: center, kind: 'opening-guess', message: `A ${gap.toFixed(2)} m wall gap was interpreted as a ${kind}. Confirm its type and width.` })
      }
      walls[i] = { ...a, a: add(a.a, mul(dir, lo)), b: add(a.a, mul(dir, hi)), paired: a.paired || b.paired, openings }
      walls.splice(index, 1)
    }
  }
  return walls
}

function lineIntersection(A: RawWall, B: RawWall): [number, number, Pt] | null {
  const r = sub(A.b, A.a), s = sub(B.b, B.a), den = cross(r, s)
  if (Math.abs(den) < 1e-8) return null
  const qp = sub(B.a, A.a), t = cross(qp, s) / den, u = cross(qp, r) / den
  return [t, u, add(A.a, mul(r, t))]
}

/** Extend near-miss centerlines to the junction. Paired wall faces can stop half a wall thickness short. */
function meetWallFaces(walls: RawWall[]): RawWall[] {
  const lengths = walls.map(w => dist(w.a, w.b))
  const nearby = walls.map((): { a?: { at: Pt; distance: number }; b?: { at: Pt; distance: number } } => ({}))
  const record = (index: number, t: number, at: Pt, distance: number) => {
    if (!distance) return
    const end = t < 0 ? 'a' : 'b'
    const before = nearby[index][end]
    if (!before || distance < before.distance) nearby[index][end] = { at, distance }
  }
  for (let i = 0; i < walls.length; i++) for (let j = i + 1; j < walls.length; j++) {
    const a = walls[i], b = walls[j]
    if (!boxesMeet(a, b, a.paired || b.paired ? 0.25 : TOUCH_M * 2)) continue
    if (Math.abs(cross(unitVec(sub(a.b, a.a)), unitVec(sub(b.b, b.a)))) < 0.25) continue
    const hit = lineIntersection(a, b)
    if (!hit) continue
    const [t, u, at] = hit
    const beyondA = Math.max(0, -t, t - 1) * lengths[i]
    const beyondB = Math.max(0, -u, u - 1) * lengths[j]
    const reachA = b.paired ? b.thickness / 2 + 0.01 : TOUCH_M
    const reachB = a.paired ? a.thickness / 2 + 0.01 : TOUCH_M
    if (beyondA > reachA || beyondB > reachB) continue
    record(i, t, at, beyondA)
    record(j, u, at, beyondB)
  }
  return walls.map((wall, i) => ({ ...wall, a: nearby[i].a?.at ?? wall.a, b: nearby[i].b?.at ?? wall.b }))
}

function boxesMeet(a: RawWall, b: RawWall, margin: number) {
  return Math.max(a.a.x, a.b.x) + margin >= Math.min(b.a.x, b.b.x)
    && Math.max(b.a.x, b.b.x) + margin >= Math.min(a.a.x, a.b.x)
    && Math.max(a.a.y, a.b.y) + margin >= Math.min(b.a.y, b.b.y)
    && Math.max(b.a.y, b.b.y) + margin >= Math.min(a.a.y, a.b.y)
}
function project(p: Pt, w: RawWall): { t: number; distance: number } {
  const v = sub(w.b, w.a), L2 = dot(v, v), t = L2 ? dot(sub(p, w.a), v) / L2 : 0
  return { t, distance: Math.abs(cross(sub(p, w.a), v)) / (Math.sqrt(L2) || 1) }
}
function keyPoint(p: Pt, tol = 0.01) { return `${Math.round(p.x / tol)},${Math.round(p.y / tol)}` }

function splitGraph(walls: RawWall[], review: DxfReviewItem[], replacedGuesses: Set<string>): { vertices: Vertex[]; walls: Wall[] } {
  const cuts = walls.map(() => [0, 1])
  let cutCount = 0
  const cut = (index: number, t: number) => {
    if (t <= 1e-7 || t >= 1 - 1e-7) return
    if (++cutCount > 24_000) throw new Error('The selected walls have too many intersections. Map fewer layers or split the drawing.')
    cuts[index].push(t)
  }
  for (let i = 0; i < walls.length; i++) for (let j = i + 1; j < walls.length; j++) {
    const A = walls[i], B = walls[j]
    if (!boxesMeet(A, B, TOUCH_M)) continue
    const hit = lineIntersection(A, B)
    if (hit && [hit[0], hit[1]].every(t => t >= -1e-7 && t <= 1 + 1e-7)) {
      cut(i, hit[0]); cut(j, hit[1])
      continue
    }
    for (const [p, target, targetIndex] of [[A.a, B, j], [A.b, B, j], [B.a, A, i], [B.b, A, i]] as const) {
      const q = project(p, target)
      if (q.distance <= TOUCH_M) cut(targetIndex, q.t)
    }
  }
  const vertices: Vertex[] = [], byKey = new Map<string, Id>(), edges = new Map<string, Wall>()
  const points = new Map<Id, Pt>(), placed = new Set<RawOpening>()
  const openingCandidates = new Map<Wall, { opening: RawOpening; start: number; end: number }[]>()
  const vertex = (p: Pt): Id => {
    const k = keyPoint(p)
    const prior = byKey.get(k)
    if (prior) return prior
    const id = newId(); byKey.set(k, id); points.set(id, p); vertices.push({ id, x: p.x, y: p.y }); return id
  }
  walls.forEach((w, wi) => {
    const ts = [...new Set(cuts[wi].map(t => Math.round(t * 1e8) / 1e8))].sort((a, b) => a - b)
    for (let k = 0; k + 1 < ts.length; k++) {
      const t0 = ts[k], t1 = ts[k + 1]
      const a = add(w.a, mul(sub(w.b, w.a), t0)), b = add(w.a, mul(sub(w.b, w.a), t1))
      if (dist(a, b) < 0.025) continue
      const va = vertex(a), vb = vertex(b)
      if (va === vb) continue
      const key = va < vb ? `${va}|${vb}` : `${vb}|${va}`
      let wall = edges.get(key)
      if (!wall) {
        wall = { id: newId(), a: va, b: vb, thicknessM: Math.max(0.05, w.thickness), heightM: HEIGHT, openings: [] }
        edges.set(key, wall)
      } else wall.thicknessM = Math.max(wall.thicknessM, w.thickness)
      if (!w.openings?.length) continue
      // Offsets are measured from the stored start, even when a duplicate was drawn backwards.
      const edge = { ...w, a: points.get(wall.a)!, b: points.get(wall.b)! }
      for (const opening of w.openings) {
        const span = openingSpan(opening, edge)
        if (!span.fits) continue
        placed.add(opening)
        const candidates = openingCandidates.get(wall) ?? []
        candidates.push({ opening, start: Math.max(0, span.start), end: Math.min(span.length, span.end) })
        openingCandidates.set(wall, candidates)
      }
    }
  })
  for (const [wall, candidates] of openingCandidates) {
    // An explicit CAD symbol takes precedence over a gap inferred from another copy of the wall.
    candidates.sort((a, b) => Number(!!a.opening.guessId) - Number(!!b.opening.guessId))
    for (const { opening, start, end } of candidates) {
      const prior = wall.openings.find(o => Math.min(end, o.offsetM + o.widthM) - Math.max(start, o.offsetM) > 1e-6)
      if (prior) {
        if (opening.guessId) replacedGuesses.add(opening.guessId)
        else if (prior.kind !== opening.kind || Math.abs(prior.offsetM - start) > 0.05 || Math.abs(prior.offsetM + prior.widthM - end) > 0.05)
          review.push({ id: newId(), at: opening.center, kind: 'opening-guess', message: 'Overlapping opening markers on duplicate walls. Verify the opening type and width.', entityId: opening.sourceId })
        continue
      }
      const window = opening.kind === 'window'
      wall.openings.push({ id: newId(), kind: opening.kind, offsetM: start, widthM: end - start, heightM: window ? 1.2 : 2.134, sillM: window ? 0.8 : 0 })
    }
  }
  for (const w of walls) for (const opening of w.openings ?? []) {
    if (!placed.has(opening)) review.push({ id: newId(), at: opening.center, kind: 'opening-guess', message: `A ${opening.kind} could not fit on one wall segment after joining the walls. Place it manually.`, entityId: opening.sourceId })
  }
  return { vertices, walls: [...edges.values()] }
}

function openingSpan(opening: RawOpening, wall: RawWall) {
  const length = dist(wall.a, wall.b)
  const { t, distance } = project(opening.center, wall)
  const start = length * t - opening.width / 2, end = start + opening.width
  return { start, end, distance, length, fits: start >= -0.01 && end <= length + 0.01 }
}

function textRows(entities: VectorEntity[], factor: number, origin: Pt, roles: Record<string, LayerRole>) {
  const labels: Unit['roomLabels'] = []
  const areaReadings: { at: Pt; sqm: number }[] = []
  for (const e of entities) {
    if (e.kind !== 'text' || !['text', 'dimensions'].includes(roles[e.layer] ?? 'ignore')) continue
    const name = normaliseName(e.text.replace(/\s+/g, ' ').trim())
    const at = fromSource(e.at, factor, origin)
    const kind = classifyRoom(name)
    const dims = parseDims(e.text)
    if (kind) {
      const printedSize = dims ? `${formatFeetInches(dims.aM)} × ${formatFeetInches(dims.bM)}` : undefined
      labels.push({ id: newId(), name, kind: kind.kind, x: at.x, y: at.y, ...(printedSize ? { printedSize } : {}) })
    } else {
      const sqm = parseArea(e.text)
      if (sqm) areaReadings.push({ at, sqm })
      if (/\b(?:type|unit|flat|apartment)\s*[-:]?\s*[a-z0-9]{1,2}\b/i.test(name)) labels.push({ id: newId(), name, kind: 'other', x: at.x, y: at.y })
    }
  }
  return { labels, areaReadings }
}

/** Recover one jamb-to-jamb span from a straight stroke or a narrow rectangular CAD frame. */
function polylineOpening(e: Extract<VectorEntity, { kind: 'polyline' }>, scale: number, origin: Pt): [Pt, Pt] | null {
  if (e.vertices.length < 2 || e.vertices.some((v, i) => (e.closed || i < e.vertices.length - 1) && v.bulge !== 0)) return null
  const points = e.vertices.map(p => fromSource(p, scale, origin))
  const first = points[0], last = points[points.length - 1]
  const tolerance = 0.002 // metres, independent of the file's drawing units
  const repeatedEnd = dist(first, last) <= tolerance
  if (!e.closed && !repeatedEnd) {
    const dir = unitVec(sub(last, first))
    let previous = 0
    for (const point of points) {
      const delta = sub(point, first), along = dot(delta, dir)
      if (Math.abs(cross(delta, dir)) > tolerance || along < previous - tolerance) return null
      previous = along
    }
    return [first, last]
  }

  if (repeatedEnd) points.pop()
  if (points.length !== 4) return null
  const [a, b, c, d] = points
  const ab = sub(b, a), ad = sub(d, a)
  // Opposite edges must match, and adjacent edges must meet at a right angle.
  if (dist(add(b, ad), c) > tolerance) return null
  const abLonger = dist(a, b) >= dist(a, d)
  const long = abLonger ? ab : ad, short = abLonger ? ad : ab
  const depth = Math.hypot(short.x, short.y)
  if (depth <= tolerance || depth > 0.46 || depth > Math.hypot(long.x, long.y) / 4) return null
  if (Math.abs(dot(unitVec(long), short)) > tolerance) return null
  return abLonger ? [mid(a, d), mid(b, c)] : [mid(a, b), mid(d, c)]
}

function openingMarks(entities: VectorEntity[], scale: number, origin: Pt, roles: Record<string, LayerRole>, review: DxfReviewItem[]) {
  const marks: { center: Pt; width: number; kind: OpeningKind; sourceId: string; layer: string; dir: Pt }[] = []
  for (const e of entities) {
    const role = roles[e.layer]
    if (!['doors', 'windows'].includes(role ?? '')) continue
    if (e.kind !== 'line' && e.kind !== 'polyline') continue
    // Nonuniform block scaling can also turn an ARC or CIRCLE into a sampled polyline.
    if (e.kind === 'polyline' && e.sourceType !== 'POLYLINE' && e.sourceType !== 'LWPOLYLINE') continue
    const span = e.kind === 'line'
      ? [fromSource(e.a, scale, origin), fromSource(e.b, scale, origin)] as const
      : polylineOpening(e, scale, origin)
    if (!span) {
      if (e.kind === 'polyline' && e.vertices.length) review.push({
        id: newId(), at: fromSource(e.vertices[0], scale, origin), kind: 'opening-guess', entityId: e.id,
        message: `Could not determine an opening width from the polyline on layer “${e.layer}”. Check the symbol on the plan.`,
      })
      continue
    }
    const [a, b] = span
    const width = dist(a, b)
    if (width < 0.25 || width > 4) continue
    marks.push({ center: mid(a, b), width, kind: role === 'windows' ? 'window' : width >= 1.5 ? 'slider' : 'door', sourceId: e.id, layer: e.layer, dir: unitVec(sub(b, a)) })
  }
  return marks
}

export function buildDxfUnit(sheet: VectorSheet, options: BuildDxfOptions): DxfImportResult {
  const choice = drawingChoices(sheet).find(d => d.id === options.drawingId)
  if (!choice) throw new Error('Select a valid model-space or paper-space drawing.')
  const entities = entitiesForDrawing(sheet, options.drawingId)
  const roles = options.roles
  if (!Number.isFinite(options.metresPerSourceUnit) || options.metresPerSourceUnit <= 0 || options.metresPerSourceUnit > 10000) throw new Error('Scale must be a finite positive number of metres per DXF unit.')
  const factor = options.metresPerSourceUnit
  let minX = Infinity, maxY = -Infinity
  for (const e of entities) {
    const points = e.kind === 'line' ? [e.a, e.b] : e.kind === 'polyline' ? e.vertices : e.kind === 'arc' || e.kind === 'circle' ? [e.center] : 'at' in e && e.at ? [e.at] : []
    for (const p of points) { minX = Math.min(minX, p.x); maxY = Math.max(maxY, p.y) }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxY)) throw new Error('The selected drawing has no usable 2D geometry.')
  const origin = { x: minX, y: maxY }
  const review: DxfReviewItem[] = []
  const wallSegments: Segment[] = []
  for (const entity of entities) {
    if (roles[entity.layer] !== 'walls') continue
    const segments = vectorSegments(entity, { maxSegments: MAX_WALL_SEGMENTS - wallSegments.length })
    for (const s of segments) wallSegments.push({ ...s, a: { x: s.a.x - origin.x, y: origin.y - s.a.y }, b: { x: s.b.x - origin.x, y: origin.y - s.b.y } })
  }
  const gapReview: DxfReviewItem[] = []
  const runs = meetWallFaces(joinWallGaps(extractWallRuns(wallSegments, factor), gapReview))
  if (!runs.length) throw new Error('No wall linework was selected. Adjust the layer mapping and try again.')
  const marks = openingMarks(entities, factor, origin, roles, review)
  const replacedGuesses = new Set<string>()
  for (const mark of marks) {
    const candidates = runs.map(w => ({ w, span: openingSpan(mark, w) })).filter(({ w, span }) => span.fits
      && span.distance < Math.max(0.25, w.thickness * 2) && Math.abs(cross(unitVec(sub(w.b, w.a)), mark.dir)) < 0.25)
    candidates.sort((a, b) => a.span.distance - b.span.distance)
    const target = candidates[0]?.w
    if (!target) { review.push({ id: newId(), at: mark.center, kind: 'opening-guess', message: `Could not attach ${mark.kind} marker on layer “${mark.layer}” to a wall. Check this opening manually.`, entityId: mark.sourceId }); continue }
    const span = candidates[0].span
    const overlapping = (target.openings ?? []).filter(opening => {
      const other = openingSpan(opening, target)
      return Math.min(span.end, other.end) - Math.max(span.start, other.start) > 1e-6
    })
    const existing = overlapping.find(o => !o.guessId)
    if (existing) {
      const other = openingSpan(existing, target)
      const same = existing.kind === mark.kind && Math.abs(span.start - other.start) <= 0.05 && Math.abs(span.end - other.end) <= 0.05
      if (!same) review.push({ id: newId(), at: mark.center, kind: 'opening-guess', message: `Overlapping ${mark.kind} marker on layer “${mark.layer}”. Verify the opening type and width.`, entityId: mark.sourceId })
      continue
    }
    for (const opening of overlapping) if (opening.guessId) replacedGuesses.add(opening.guessId)
    target.openings = [...(target.openings ?? []).filter(o => !overlapping.includes(o)), { center: mark.center, width: mark.width, kind: mark.kind, sourceId: mark.sourceId }]
    if (candidates.length > 1 && Math.abs(candidates[1].span.distance - span.distance) < 0.08) review.push({ id: newId(), at: mark.center, kind: 'opening-guess', message: `This ${mark.kind} marker is close to two walls; verify its placement.`, entityId: mark.sourceId })
  }
  const graph = splitGraph(runs, review, replacedGuesses)
  review.push(...gapReview.filter(item => !replacedGuesses.has(item.id)))
  const { labels, areaReadings } = textRows(entities, factor, origin, roles)
  const roomLabels = labels
  const areaSqft = Math.round(options.areaSqft ?? (areaReadings[0] ? sqmToSqft(areaReadings[0].sqm) : 0))
  const unit: Unit = { id: newId(), projectName: options.projectName ?? '', name: options.unitName ?? sheet.fileName.replace(/\.dxf$/i, ''), northDeg: 0, vertices: graph.vertices, walls: graph.walls, roomLabels, furniture: [], finishSlots: [], areaSqft }
  const rooms = deriveRooms(unit)
  const flats = deriveFlats(unit, rooms)
  const sizeTol = 2 * 0.0254
  for (const label of unit.roomLabels) {
    const room = rooms.find(r => r.id === label.id)
    if (room && label.printedSize) {
      const bits = label.printedSize.split('×').map(parseLength)
      if (bits.length === 2 && bits[0] && bits[1]) {
        const check = printedSizeCheck(roomInnerPolygon(room, unit), 0, bits[0], bits[1], sizeTol)
        if (check.off) review.push({ id: newId(), at: { x: label.x, y: label.y }, kind: 'size-mismatch', message: `${label.name}: vector outline is ${formatFeetInches(check.drawn.w)} × ${formatFeetInches(check.drawn.h)}; printed size is ${formatFeetInches(bits[0])} × ${formatFeetInches(bits[1])}. Check drawing scale/layers.`, entityId: label.id })
      }
    }
  }
  for (const room of rooms) {
    if (/^Space \d+$/.test(room.name) && room.areaSqm > 0.5) review.push({ id: newId(), at: room.centroid, kind: 'unlabelled', message: `Unlabelled closed face (${room.areaSqm.toFixed(1)} m²). Add a room name if this is a room.`, entityId: room.id })
  }
  if (!rooms.length) {
    const w = unit.walls[0]
    const v = unit.vertices.find(x => x.id === w?.a)
    review.push({ id: newId(), at: v ?? { x: 0, y: 0 }, kind: 'unclosed', message: 'No closed rooms were derived from this wall graph. Check the wall layers and missing junctions.' })
  }
  for (const v of validate(unit)) if (v.code === 'walls-intersect' || v.code === 'dangling-vertex') {
    const w = unit.walls.find(x => v.ids.includes(x.id))
    const p = unit.vertices.find(x => x.id === w?.a || v.ids.includes(x.id))
    if (p) review.push({ id: newId(), at: p, kind: 'unclosed', entityId: w?.id, message: v.message })
  }
  const guesses = new Set(entities.map(e => e.layer))
  for (const layer of guesses) if (!roles[layer] || roles[layer] === 'ignore') {
    const e = entities.find(x => x.layer === layer)
    const at = e && ('at' in e && e.at ? fromSource(e.at, factor, origin) : e.kind === 'line' ? fromSource(mid(e.a, e.b), factor, origin) : { x: 0, y: 0 })
    review.push({ id: newId(), at: at ?? { x: 0, y: 0 }, kind: 'other', scope: 'drawing', message: `Layer “${layer}” was ignored. Confirm it contains no walls, openings, or room labels.` })
  }
  for (const warning of sheet.warnings) review.push({ id: newId(), at: { x: 0, y: 0 }, kind: 'other', scope: 'drawing', message: warning })
  const hint = sourceScale(sheet.unitsHint)
  const sized = new Set(unit.roomLabels.filter(label => label.printedSize).map(label => label.id))
  if (hint === null) review.push({ id: newId(), at: { x: 0, y: 0 }, kind: 'scale', scope: 'drawing', message: 'This DXF has no recognized $INSUNITS value. The scale was entered manually; compare printed room sizes before relying on dimensions.' })
  else if (!rooms.some(room => sized.has(room.id))) {
    const source = hint === factor ? `The scale matches the DXF unit hint (${sheet.unitsHint}).` : `The chosen scale is ${factor} m per DXF unit. The file declares ${hint} m per DXF unit.`
    review.push({ id: newId(), at: { x: 0, y: 0 }, kind: 'scale', scope: 'drawing', message: `${source} No printed room dimensions were available to cross-check it.` })
  }
  if (flats.length === 0 && rooms.some(r => r.kind === 'bed')) review.push({ id: newId(), at: rooms.find(r => r.kind === 'bed')!.centroid, kind: 'other', message: 'Rooms were found but no apartment group was detected. Review doors, passages, and the shared core.' })
  for (const e of entities) if (e.kind === 'unsupported') review.push({ id: newId(), at: 'at' in e && e.at ? fromSource(e.at, factor, origin) : { x: 0, y: 0 }, kind: 'other', message: `Unsupported DXF ${e.label} on layer “${e.layer}” was not used for the Unit.`, entityId: e.id })
  return { unit, review, stats: { walls: unit.walls.length, rooms: rooms.length, openings: unit.walls.reduce((n, w) => n + w.openings.length, 0), sourceUnits: sheet.unitsHint, metresPerSourceUnit: factor }, sourceName: sheet.fileName, flatChoices: flats.map(f => f.name) }
}

/** Keep the selected flat's graph and local review items, along with drawing-wide notices. */
export function selectDxfFlat(result: DxfImportResult, flatName: string): DxfImportResult {
  const input = result.unit
  const rooms = deriveRooms(input), flat = deriveFlats(input, rooms).find(f => f.name === flatName)
  if (!flat) throw new Error(`Could not find ${flatName} in the derived floor.`)
  const keepRooms = new Set(flat.roomIds), selectedRooms = rooms.filter(r => keepRooms.has(r.id))
  const wallIds = new Set(selectedRooms.flatMap(r => r.wallIds))
  const walls = input.walls.filter(w => wallIds.has(w.id))
  const vertexIds = new Set(walls.flatMap(w => [w.a, w.b]))
  const roomLabels = input.roomLabels.filter(l => keepRooms.has(l.id) || flatTypeOf(l) === flatName)
  const unit = { ...input, id: newId(), name: `${input.name} · ${flatName}`, areaSqft: flat.printedSqft ?? Math.round(sqmToSqft(flat.areaSqm)), vertices: input.vertices.filter(v => vertexIds.has(v.id)), walls, roomLabels }
  const outlines = selectedRooms.map(r => roomPolygon(r, input))
  const review = result.review.filter(row => row.scope === 'drawing' || row.kind === 'scale'
    || (row.entityId && (keepRooms.has(row.entityId) || wallIds.has(row.entityId) || vertexIds.has(row.entityId)))
    || outlines.some(polygon => pointInPolygon(row.at, polygon)))
  return {
    ...result, unit, review, flatChoices: [flatName],
    stats: { ...result.stats, walls: walls.length, rooms: deriveRooms(unit).length, openings: walls.reduce((n, w) => n + w.openings.length, 0) },
  }
}

