import DxfParser from 'dxf-parser'
import { vectorSegments } from './curves'
import { drawingBounds } from './drawings'
import type { DxfUnits, DxfPoint, DxfVertex, VectorEntity, VectorSheet } from './types'

export const MAX_DXF_BYTES = 15 * 1024 * 1024
export const MAX_DXF_ENTITIES = 50_000
const MAX_BLOCK_DEPTH = 12
const MAX_EXPANDED = 80_000
const MAX_VERTICES = 100_000
const MAX_COORD = 1e9

type Obj = Record<string, unknown>
type Matrix = [number, number, number, number, number, number]
const obj = (v: unknown): Obj => v && typeof v === 'object' ? v as Obj : {}
const num = (v: unknown, fallback = 0): number => typeof v === 'number' && Number.isFinite(v) ? v : fallback
const str = (v: unknown, fallback = ''): string => typeof v === 'string' ? v : fallback
const point = (v: unknown): DxfPoint => ({ x: num(obj(v).x, NaN), y: num(obj(v).y, NaN) })
const validPoint = (p: DxfPoint) => Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) <= MAX_COORD && Math.abs(p.y) <= MAX_COORD
const ident: Matrix = [1, 0, 0, 1, 0, 0]
const apply = (m: Matrix, p: DxfPoint): DxfPoint => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] })
const multiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
]
const translate = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y]
function insertMatrix(e: Obj, block: Obj, parent: Matrix, offsetX = 0, offsetY = 0): Matrix {
  const at = point(e.position)
  const base = block.position ? point(block.position) : { x: 0, y: 0 }
  const angle = num(e.rotation) * Math.PI / 180
  const sx = num(e.xScale, 1), sy = num(e.yScale, 1)
  const c = Math.cos(angle), s = Math.sin(angle)
  const local: Matrix = [c * sx, s * sx, -s * sy, c * sy, at.x + c * offsetX - s * offsetY, at.y + s * offsetX + c * offsetY]
  return multiply(parent, multiply(local, translate(-base.x, -base.y)))
}

function unitHint(v: unknown): DxfUnits {
  switch (num(v)) {
    case 1: return 'inches'
    case 2: return 'feet'
    case 3: return 'miles'
    case 4: return 'millimeters'
    case 5: return 'centimeters'
    case 6: return 'meters'
    case 7: return 'kilometers'
    default: return 'unitless'
  }
}

/** Remove common MTEXT layout/formatting codes while keeping paragraph breaks, escaped characters and Unicode escapes. */
export function plainMtext(raw: string): string {
  return raw
    .replace(/\\P/gi, '\n').replace(/\\~/g, ' ')
    .replace(/\\U\+([0-9A-F]{4,8})/gi, (_m, h: string) => {
      const n = Number.parseInt(h, 16)
      return n <= 0x10ffff ? String.fromCodePoint(n) : ''
    })
    .replace(/\\S([^;]*);/g, (_m, s: string) => s.replace(/[\^#]/g, '/'))
    .replace(/\\[ACFHQTW][^;]*;/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\\([\\{}])/g, '$1')
    .trim()
}

function convertEntity(raw: Obj, m: Matrix, id: string, layer: string, paperSpace: boolean): VectorEntity | null {
  const type = str(raw.type).toUpperCase()
  const base = { id, layer, paperSpace, sourceType: type }
  const p = (v: unknown) => apply(m, point(v))
  const determinant = m[0] * m[3] - m[1] * m[2]
  const sx = Math.hypot(m[0], m[1]), sy = Math.hypot(m[2], m[3])
  const similarity = sx > 0 && sy > 0 && Math.abs(sx - sy) <= 1e-9 * Math.max(sx, sy)
    && Math.abs(m[0] * m[2] + m[1] * m[3]) <= 1e-9 * sx * sy
  const angle = (radians: number) => {
    const x = Math.cos(radians), y = Math.sin(radians)
    return Math.atan2(m[1] * x + m[3] * y, m[0] * x + m[2] * y) * 180 / Math.PI
  }
  const transformCurve = (entity: VectorEntity, closed: boolean): VectorEntity | null => {
    const segments = vectorSegments(entity, { maxSegments: MAX_VERTICES })
    if (!segments.length) return null
    const points = segments.map(s => s.a)
    if (!closed) points.push(segments[segments.length - 1].b)
    return { ...base, kind: 'polyline', vertices: points.map(v => ({ ...apply(m, v), bulge: 0 })), closed }
  }
  if (type === 'LINE') {
    const vs = Array.isArray(raw.vertices) ? raw.vertices : []
    return vs.length >= 2 ? { ...base, kind: 'line', a: p(vs[0]), b: p(vs[1]) } : null
  }
  if (type === 'LWPOLYLINE' || type === 'POLYLINE') {
    const vs = Array.isArray(raw.vertices) ? raw.vertices : []
    if (vs.length < 2) return null
    const vertices: DxfVertex[] = vs.map(v => ({ ...point(v), bulge: num(obj(v).bulge) }))
    const closed = !!raw.shape
    if (!similarity && vertices.some(v => v.bulge)) return transformCurve({ ...base, kind: 'polyline', vertices, closed }, closed)
    return { ...base, kind: 'polyline', vertices: vertices.map(v => ({ ...apply(m, v), bulge: determinant < 0 ? -v.bulge : v.bulge })), closed }
  }
  if (type === 'ARC' || type === 'CIRCLE') {
    const center = point(raw.center), radius = Math.abs(num(raw.radius))
    if (!radius || radius > MAX_COORD) return null
    if (type === 'CIRCLE') return similarity
      ? { ...base, kind: 'circle', center: apply(m, center), radius: radius * sx }
      : transformCurve({ ...base, kind: 'circle', center, radius }, true)
    // dxf-parser converts ARC group 50 and 51 from degrees to radians.
    const start = num(raw.startAngle), end = num(raw.endAngle)
    if (!similarity) return transformCurve({ ...base, kind: 'arc', center, radius, startDeg: start * 180 / Math.PI, endDeg: end * 180 / Math.PI }, false)
    const startDeg = angle(determinant < 0 ? end : start), endDeg = angle(determinant < 0 ? start : end)
    return { ...base, kind: 'arc', center: apply(m, center), radius: radius * sx, startDeg, endDeg }
  }
  if (type === 'TEXT' || type === 'MTEXT' || type === 'ATTDEF') {
    const at = p(raw.position ?? raw.startPoint)
    const text = plainMtext(str(raw.text))
    const rotationDeg = angle(num(raw.rotation) * Math.PI / 180)
    const height = Math.abs(num(raw.height, num(raw.textHeight, 1))) * Math.sqrt(Math.abs(determinant))
    return text ? { ...base, kind: 'text', text, at, rotationDeg, height } : null
  }
  if (type === 'INSERT') {
    const at = p(raw.position)
    return { ...base, kind: 'insert', name: str(raw.name), at, scaleX: num(raw.xScale, 1), scaleY: num(raw.yScale, 1), rotationDeg: num(raw.rotation), columns: Math.max(1, Math.min(100, num(raw.columnCount, 1))), rows: Math.max(1, Math.min(100, num(raw.rowCount, 1))), columnSpacing: num(raw.columnSpacing), rowSpacing: num(raw.rowSpacing) }
  }
  const at = raw.startPoint ?? raw.position ?? raw.center
  return { ...base, kind: 'unsupported', label: type || 'UNKNOWN', ...(at ? { at: p(at) } : {}) }
}

/** Parse ASCII DXF and flatten nested INSERT references into transformed source-space primitives. */
export function parseDxfText(text: string, fileName = 'drawing.dxf'): VectorSheet {
  if (text.startsWith('AutoCAD Binary DXF')) throw new Error('Binary DXF is not supported yet. Export this drawing as ASCII DXF and retry.')
  if (!text.trim() || text.includes('\0')) throw new Error('The file is empty or is not an ASCII DXF.')
  if (text.length > MAX_DXF_BYTES) throw new Error(`DXF exceeds the ${MAX_DXF_BYTES / 1024 / 1024} MB limit.`)
  let parsed
  try { parsed = new DxfParser().parseSync(text) } catch (e) { throw new Error(`Could not parse ASCII DXF: ${e instanceof Error ? e.message : String(e)}`) }
  if (!parsed || !Array.isArray(parsed.entities)) throw new Error('This file has no supported DXF entities.')
  if (parsed.entities.length > MAX_DXF_ENTITIES) throw new Error(`DXF has more than ${MAX_DXF_ENTITIES.toLocaleString()} entities; simplify or split the drawing and retry.`)
  const warnings: string[] = []
  const out: VectorEntity[] = []
  let serial = 0
  let totalVertices = 0
  const blocks = parsed.blocks as unknown as Record<string, Obj>
  const add = (e: Obj, m: Matrix, parent?: { layer: string; paperSpace: boolean }, blockStack = new Set<string>()) => {
    if (++serial > MAX_EXPANDED) throw new Error(`Expanded DXF exceeds ${MAX_EXPANDED.toLocaleString()} entities.`)
    const id = `e-${serial}`
    const type = str(e.type).toUpperCase()
    const ownLayer = str(e.layer, '0')
    const layer = ownLayer === '0' ? parent?.layer ?? ownLayer : ownLayer
    const paperSpace = parent?.paperSpace ?? !!e.inPaperSpace
    let inputVertices = 0
    if (type === 'LWPOLYLINE' || type === 'POLYLINE') {
      inputVertices = Array.isArray(e.vertices) ? e.vertices.length : 0
      totalVertices += inputVertices
      if (totalVertices > MAX_VERTICES) throw new Error(`DXF exceeds ${MAX_VERTICES.toLocaleString()} polyline vertices.`)
    }
    if (type === 'INSERT') {
      const name = str(e.name)
      const block = blocks?.[name]
      if (!block || !Array.isArray(block.entities) || blockStack.size >= MAX_BLOCK_DEPTH || blockStack.has(name)) {
        const at = apply(m, point(e.position))
        out.push({ id, layer, paperSpace, sourceType: type, kind: 'unsupported', label: `INSERT ${name || '(unnamed block)'}`, ...(validPoint(at) ? { at } : {}) })
        warnings.push(`Block insert “${name || '(unnamed)'}” could not be expanded (missing, recursive, or too deep).`)
        return
      }
      if (!block.entities.length) return
      const stack = new Set(blockStack).add(name)
      const colCount = Math.max(1, Math.floor(num(e.columnCount, 1)))
      const rowCount = Math.max(1, Math.floor(num(e.rowCount, 1)))
      for (let row = 0; row < rowCount; row++) for (let col = 0; col < colCount; col++) {
        const next = insertMatrix(e, block, m, col * num(e.columnSpacing), row * num(e.rowSpacing))
        for (const child of block.entities as unknown[]) add(obj(child), next, { layer, paperSpace }, stack)
      }
      return
    }
    const item = convertEntity(e, m, id, layer, paperSpace)
    if (!item) return
    if (item.kind === 'polyline') {
      totalVertices += Math.max(0, item.vertices.length - inputVertices)
      if (totalVertices > MAX_VERTICES) throw new Error(`DXF exceeds ${MAX_VERTICES.toLocaleString()} polyline vertices.`)
    }
    const pts = item.kind === 'line' ? [item.a, item.b] : item.kind === 'polyline' ? item.vertices : item.kind === 'text' || item.kind === 'insert' ? [item.at] : item.kind === 'arc' || item.kind === 'circle' ? [item.center] : item.at ? [item.at] : []
    if (pts.some((p) => !validPoint(p))) { warnings.push(`Skipped ${item.sourceType} with non-finite or out-of-range coordinates.`); return }
    if (item.kind === 'arc' || item.kind === 'circle') if (!Number.isFinite(item.radius) || item.radius > MAX_COORD) { warnings.push(`Skipped ${item.sourceType} with an invalid radius.`); return }
    out.push(item)
  }
  for (const entity of parsed.entities as unknown[]) add(obj(entity), ident)
  const layers = [...new Set([...Object.keys(parsed.tables?.layer?.layers ?? {}), ...out.map(e => e.layer)])].sort((a, b) => a.localeCompare(b))
  const bounds = drawingBounds(out)
  const header = parsed.header as Record<string, unknown>
  const spaces = [...new Set(out.map(e => e.paperSpace ? 'paper' as const : 'model' as const))]
  if (!out.length) throw new Error('No supported 2D geometry or text was found in this DXF.')
  return { fileName, unitsHint: unitHint(header?.$INSUNITS), entities: out, layers, bounds, warnings, spaces }
}

export function parseDxfBytes(buffer: ArrayBuffer, fileName = 'drawing.dxf'): VectorSheet {
  if (buffer.byteLength > MAX_DXF_BYTES) throw new Error(`DXF exceeds the ${MAX_DXF_BYTES / 1024 / 1024} MB limit.`)
  const bytes = new Uint8Array(buffer)
  const sig = new TextDecoder().decode(bytes.subarray(0, 22))
  if (sig.startsWith('AutoCAD Binary DXF')) throw new Error('Binary DXF is not supported yet. Export this drawing as ASCII DXF and retry.')
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  return parseDxfText(text, fileName)
}

