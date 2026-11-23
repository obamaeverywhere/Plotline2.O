import type { LayerGuess, LayerRole, VectorEntity, VectorSheet } from './types'

const RULES: [LayerRole, RegExp][] = [
  ['doors', /door|swing|opening|gate/i],
  ['windows', /window|glaz|glass|curtain.?wall|vent/i],
  ['walls', /wall|partition|masonry|brick|concrete|struct/i],
  ['text', /text|label|room.?name|annotation|note|space.?name/i],
  ['dimensions', /dim|dimension|measure|grid|axis|level|title|border/i],
  ['furniture', /furn|fixture|sanitary|equipment|casework/i],
]
const EMPTY: Record<string, number> = { line: 0, polyline: 0, arc: 0, circle: 0, text: 0, insert: 0, unsupported: 0 }

function guess(name: string, counts: Record<string, number>): { role: LayerRole; confidence: number } {
  for (const [role, re] of RULES) if (re.test(name)) return { role, confidence: 0.88 }
  if (counts.text && !counts.line && !counts.polyline) return { role: 'text', confidence: 0.7 }
  if (counts.line + counts.polyline > 4 && !counts.text) return { role: 'walls', confidence: 0.45 }
  if (counts.insert + counts.arc + counts.circle > counts.line + counts.polyline) return { role: 'furniture', confidence: 0.28 }
  return { role: 'ignore', confidence: 0.25 }
}

export function guessLayers(sheet: VectorSheet, entities: VectorEntity[] = sheet.entities): LayerGuess[] {
  const counts = new Map<string, Record<string, number>>()
  for (const e of entities) {
    const c = counts.get(e.layer) ?? { ...EMPTY }
    c[e.kind]++
    counts.set(e.layer, c)
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([layer, c]) => ({ layer, ...guess(layer, c), counts: c }))
}

export function roleCounts(layers: LayerGuess[], edits: Record<string, LayerRole>): Record<LayerRole, number> {
  const out: Record<LayerRole, number> = { walls: 0, doors: 0, windows: 0, text: 0, dimensions: 0, furniture: 0, ignore: 0 }
  for (const l of layers) out[edits[l.layer] ?? l.role] += Object.values(l.counts).reduce((a, b) => a + b, 0)
  return out
}

