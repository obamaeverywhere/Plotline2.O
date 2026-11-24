import type { DxfPoint, LayerGuess, LayerRole, VectorEntity } from './types'

export const layerRoles: LayerRole[] = ['walls', 'doors', 'windows', 'text', 'dimensions', 'furniture', 'ignore']
const kindsOf = (layer: LayerGuess) => Object.keys(layer.counts).filter(kind => layer.counts[kind] > 0).sort()

/** Exact layer conventions, including entity kinds. Counts may differ between floors. */
export function profileKey(layers: LayerGuess[]): string | null {
  if (!layers.some(l => /\p{L}/u.test(l.layer))) return null
  const ordered = [...layers].sort((a, b) => a.layer.localeCompare(b.layer))
  return JSON.stringify(ordered.map(l => [l.layer, kindsOf(l)]))
}

/** Reuse an exact profile first. Across profiles, a layer must have consistent geometry and one confirmed role. */
export function learnedLayers(layers: LayerGuess[], profiles: unknown) {
  const confirmed: Record<string, LayerRole> = Object.create(null)
  const needsReview = new Set<string>()
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) return { confirmed, needsReview }
  const exact = profileKey(layers)
  const current = new Map(layers.map(l => [l.layer, JSON.stringify(kindsOf(l))]))
  const seen = new Map<string, Set<LayerRole>>()
  for (const [key, roles] of Object.entries(profiles)) {
    if (!roles || typeof roles !== 'object') continue
    let entries: unknown
    try { entries = JSON.parse(key) } catch { continue }
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (!Array.isArray(entry)) continue
      const [name, kinds] = entry
      if (!current.has(name) || !Array.isArray(kinds) || !Object.hasOwn(roles, name)) continue
      const role = roles[name]
      if (!layerRoles.includes(role)) continue
      if (key === exact) { confirmed[name] = role; continue }
      if (!/\p{L}/u.test(name)) continue
      const candidates = seen.get(name) ?? new Set<LayerRole>()
      seen.set(name, candidates)
      if (current.get(name) === JSON.stringify(kinds)) candidates.add(role)
    }
  }
  for (const [name, candidates] of seen) {
    if (Object.hasOwn(confirmed, name)) continue
    if (candidates.size === 1) confirmed[name] = [...candidates][0]
    else needsReview.add(name)
  }
  return { confirmed, needsReview }
}

export function layerNeedsReview(layer: LayerGuess, confirmed: Record<string, LayerRole>) {
  const mapped = Object.hasOwn(confirmed, layer.layer)
  if (!mapped && layer.confidence < 0.7) return true
  const role = mapped ? confirmed[layer.layer] : layer.role
  if (role === 'text') return !layer.counts.text
  if (role === 'walls') return !(layer.counts.line || layer.counts.polyline || layer.counts.arc || layer.counts.circle)
  return false
}

export function canMapAutomatically(layers: LayerGuess[], confirmed: Record<string, LayerRole>) {
  const hasWalls = layers.some(l => (Object.hasOwn(confirmed, l.layer) ? confirmed[l.layer] : l.role) === 'walls')
  return hasWalls && !layers.some(l => layerNeedsReview(l, confirmed))
}

/** A measurable straight CAD edge, in source units, for a drawing with no declared scale. */
export function scaleReference(entities: VectorEntity[], roles: Record<string, LayerRole>) {
  let longest: { a: DxfPoint; b: DxfPoint; length: number } | undefined
  function consider(a: DxfPoint, b: DxfPoint) {
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    if (length > (longest?.length ?? 0)) longest = { a, b, length }
  }
  for (const e of entities) {
    if (roles[e.layer] !== 'walls') continue
    if (e.kind === 'line') consider(e.a, e.b)
    if (e.kind === 'polyline') {
      const n = e.vertices.length
      for (let i = 0; i < n - (e.closed ? 0 : 1); i++) {
        if (!e.vertices[i].bulge) consider(e.vertices[i], e.vertices[(i + 1) % n])
      }
    }
  }
  return longest
}
