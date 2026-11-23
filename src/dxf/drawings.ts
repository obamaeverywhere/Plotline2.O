import type { DrawingChoice, VectorEntity, VectorSheet } from './types'

const boxOf = (e: VectorEntity) => {
  const ps = e.kind === 'line' ? [e.a, e.b] : e.kind === 'polyline' ? e.vertices : e.kind === 'arc' || e.kind === 'circle' ? [{ x: e.center.x - e.radius, y: e.center.y - e.radius }, { x: e.center.x + e.radius, y: e.center.y + e.radius }] : e.kind === 'text' || e.kind === 'insert' ? [e.at] : e.at ? [e.at] : []
  if (!ps.length) return null
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of ps) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) }
  return { minX, minY, maxX, maxY }
}
const centreOf = (b: NonNullable<ReturnType<typeof boxOf>>) => ({ x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 })

export function drawingBounds(entities: VectorEntity[]): VectorSheet['bounds'] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const entity of entities) {
    const box = boxOf(entity)
    if (!box) continue
    minX = Math.min(minX, box.minX)
    minY = Math.min(minY, box.minY)
    maxX = Math.max(maxX, box.maxX)
    maxY = Math.max(maxY, box.maxY)
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 0, maxY: 0 }
}

const clustersBySheet = new WeakMap<VectorSheet, VectorEntity[][]>()

function modelClusters(sheet: VectorSheet): VectorEntity[][] {
  const cached = clustersBySheet.get(sheet)
  if (cached) return cached
  const model = sheet.entities.filter(e => !e.paperSpace)
  const result = inferClusters(model)
  clustersBySheet.set(sheet, result)
  return result
}

function inferClusters(model: VectorEntity[]): VectorEntity[][] {
  const entries = model.flatMap(entity => {
    const box = boxOf(entity)
    return box ? [{ entity, center: centreOf(box) }] : []
  })
  if (entries.length < 8) return []

  const bounds = drawingBounds(model)
  const gap = Math.max(Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.12, 1e-6)
  const cells = new Map<string, { x: number; y: number; members: number[] }>()
  const parents = entries.map((_, i) => i)
  const root = (index: number) => {
    while (parents[index] !== index) {
      parents[index] = parents[parents[index]]
      index = parents[index]
    }
    return index
  }
  entries.forEach(({ center }, index) => {
    const x = Math.floor((center.x - bounds.minX) / gap)
    const y = Math.floor((center.y - bounds.minY) / gap)
    const key = `${x},${y}`
    const cell = cells.get(key)
    // Points in the same cell are all within the connection distance.
    if (cell) {
      parents[index] = cell.members[0]
      cell.members.push(index)
    } else cells.set(key, { x, y, members: [index] })
  })
  if (cells.size === 1) return []

  const maxDistanceSquared = (gap * 1.42) ** 2
  let comparisons = 0
  for (const cell of cells.values()) for (let dx = 0; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
    if (dx === 0 && dy <= 0) continue
    const other = cells.get(`${cell.x + dx},${cell.y + dy}`)
    if (!other || root(cell.members[0]) === root(other.members[0])) continue
    search: for (const i of cell.members) for (const j of other.members) {
      // Fall back to the complete model drawing when automatic separation is too expensive.
      if (++comparisons > 500_000) return []
      const a = entries[i].center, b = entries[j].center
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= maxDistanceSquared) {
        parents[root(j)] = root(i)
        break search
      }
    }
  }
  const groups = new Map<number, VectorEntity[]>()
  entries.forEach(({ entity }, i) => {
    const key = root(i)
    const group = groups.get(key)
    if (group) group.push(entity)
    else groups.set(key, [entity])
  })
  const candidates = [...groups.values()].filter(group => group.length >= 4)
  return candidates.length >= 2 ? candidates : []
}

/** Model and paper space are separate choices; widely separated model-space islands are offered as optional drawings. */
export function drawingChoices(sheet: VectorSheet): DrawingChoice[] {
  const choices: DrawingChoice[] = []
  for (const space of ['model', 'paper'] as const) {
    const paperSpace = space === 'paper'
    const count = sheet.entities.reduce((n, e) => n + Number(e.paperSpace === paperSpace), 0)
    if (!count) continue
    choices.push({ id: space, label: paperSpace ? 'Paper space' : 'Model space', paperSpace, entityCount: count })
    if (paperSpace || count < 8) continue
    const clusters = modelClusters(sheet)
    if (clusters.length > 1) clusters.forEach((g, i) => {
      choices.push({ id: `cluster:${i}`, label: `Separated drawing ${i + 1} (${g.length} entities)`, paperSpace: false, entityCount: g.length })
    })
  }
  return choices
}

export function entitiesForDrawing(sheet: VectorSheet, id: string): VectorEntity[] {
  if (id === 'model') return sheet.entities.filter(e => !e.paperSpace)
  if (id === 'paper') return sheet.entities.filter(e => e.paperSpace)
  const cluster = /^cluster:(\d+)$/.exec(id)
  return cluster ? modelClusters(sheet)[Number(cluster[1])] ?? [] : []
}

