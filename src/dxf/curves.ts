import type { DxfPoint, VectorEntity } from './types'

export interface Segment { a: DxfPoint; b: DxfPoint; sourceId: string; layer: string }
const mix = (a: DxfPoint, b: DxfPoint, t: number): DxfPoint => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

function arcPoints(center: DxfPoint, radius: number, start: number, sweep: number, maxAngle = Math.PI / 18): DxfPoint[] {
  const n = Math.max(1, Math.ceil(Math.abs(sweep) / maxAngle))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = start + sweep * i / n
    return { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) }
  })
}

function bulgeArc(a: DxfPoint, b: DxfPoint, bulge: number): DxfPoint[] {
  if (Math.abs(bulge) < 1e-9) return [a, b]
  const dx = b.x - a.x, dy = b.y - a.y, chord = Math.hypot(dx, dy)
  if (!chord) return [a, b]
  const sweep = 4 * Math.atan(bulge)
  const radius = chord / 4 * (Math.abs(bulge) + 1 / Math.abs(bulge))
  const offset = chord / 4 * (1 / bulge - bulge)
  const center = { x: (a.x + b.x) / 2 - dy / chord * offset, y: (a.y + b.y) / 2 + dx / chord * offset }
  const points = arcPoints(center, radius, Math.atan2(a.y - center.y, a.x - center.x), sweep)
  points[0] = a
  points[points.length - 1] = b
  return points
}

/** Convert DXF curves to short straight centerline segments for Plotline's straight-wall graph. */
export function vectorSegments(e: VectorEntity, { maxSegments = Infinity }: { maxSegments?: number } = {}): Segment[] {
  const ensureCapacity = (count: number) => {
    if (count > maxSegments) throw new Error('The selected DXF linework expands into too many segments. Map fewer layers or split the drawing.')
  }
  const paths: DxfPoint[][] = []
  if (e.kind === 'line') paths.push([e.a, e.b])
  else if (e.kind === 'polyline') {
    const verts = e.vertices
    const edges = verts.length - 1 + (e.closed ? 1 : 0)
    const path: DxfPoint[] = []
    for (let i = 0; i < edges; i++) {
      const v = verts[i], next = verts[(i + 1) % verts.length]
      const seg = bulgeArc(v, next, v.bulge)
      ensureCapacity(Math.max(0, path.length - 1) + seg.length - 1)
      path.push(...(i ? seg.slice(1) : seg))
    }
    if (path.length) paths.push(path)
  } else if (e.kind === 'arc') {
    let sweep = ((e.endDeg - e.startDeg) % 360 + 360) % 360
    if (sweep === 0) sweep = 360
    paths.push(arcPoints(e.center, e.radius, e.startDeg * Math.PI / 180, sweep * Math.PI / 180))
  } else if (e.kind === 'circle') paths.push(arcPoints(e.center, e.radius, 0, Math.PI * 2))
  const segments = paths.flatMap(path => path.slice(1).map((b, i) => ({ a: path[i], b, sourceId: e.id, layer: e.layer })))
  ensureCapacity(segments.length)
  return segments
}

export const lerpPoint = mix

