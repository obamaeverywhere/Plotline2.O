import { describe, expect, it } from 'vitest'
import { validate } from '../core'
import { buildDxfUnit, joinWallGaps, selectDxfFlat } from './buildUnit'
import { drawingBounds, drawingChoices, entitiesForDrawing } from './drawings'
import { vectorSegments } from './curves'
import { guessLayers } from './layers'
import { parseDxfText } from './parse'
import type { VectorEntity, VectorSheet } from './types'

const minimal = (extra = '') => `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${extra}0\nENDSEC\n0\nEOF\n`
const groups = (...values: (number | string)[]) => values.join('\n') + '\n'
const line = (id: string, layer: string, ax: number, ay: number, bx: number, by: number): VectorEntity =>
  ({ id, layer, kind: 'line', sourceType: 'LINE', paperSpace: false, a: { x: ax, y: ay }, b: { x: bx, y: by } })
const build = (entities: VectorEntity[]) => buildDxfUnit({
  fileName: 'test.dxf', unitsHint: 'meters', entities, layers: [...new Set(entities.map(e => e.layer))],
  bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, warnings: [], spaces: ['model'],
}, { drawingId: 'model', roles: { WALL: 'walls', WIN: 'windows', DOOR: 'doors', ROOM: 'text', NOTE: 'ignore' }, metresPerSourceUnit: 1 })

describe('DXF parsing and preparation', () => {
  it('reads ASCII entities and unit hints; cleans MTEXT', () => {
    const sheet = parseDxfText(minimal('0\nLINE\n8\nA-WALL\n10\n0\n20\n0\n11\n1000\n21\n0\n0\nMTEXT\n8\nA-TEXT\n10\n2\n20\n3\n40\n2\n1\n{\\C1;BEDROOM}\\P12\u00b4-0\\U+00B4\n'), 'sample.dxf')
    expect(sheet.unitsHint).toBe('millimeters')
    expect(sheet.entities).toHaveLength(2)
    expect(sheet.entities[0]).toMatchObject({ kind: 'line', layer: 'A-WALL' })
    expect(sheet.entities[1]).toMatchObject({ kind: 'text', text: expect.stringContaining('BEDROOM') })
    expect(guessLayers(sheet).find(x => x.layer === 'A-WALL')?.role).toBe('walls')
  })

  it('rejects binary and empty files clearly', () => {
    expect(() => parseDxfText('AutoCAD Binary DXF\0')).toThrow(/Binary DXF is not supported/)
    expect(() => parseDxfText('  ')).toThrow(/empty/)
  })

  it('preserves escaped label characters and reads paragraph settings and Unicode in MTEXT', () => {
    const label = String.raw`{\pxqc;\L\U+0042ED\l}\P\{A\} \\P \S1#2;`
    const sheet = parseDxfText(minimal(groups(0, 'MTEXT', 8, 'ROOM', 10, 2, 20, 3, 40, 2, 1, label)))
    expect(sheet.entities[0]).toMatchObject({ kind: 'text', text: 'BED\n{A} \\P 1/2' })
  })

  it('preserves literal braces in single-line room labels', () => {
    const sheet = parseDxfText(minimal(groups(0, 'TEXT', 8, 'ROOM', 10, 2, 20, 3, 40, 2, 1, '{A} \\U+0042ED')))
    expect(sheet.entities[0]).toMatchObject({ kind: 'text', text: '{A} BED' })
  })

  it('approximates bulged polylines as finite short segments', () => {
    const e: VectorEntity = { id: 'p', layer: 'WALL', paperSpace: false, sourceType: 'LWPOLYLINE', kind: 'polyline', closed: false, vertices: [{ x: 0, y: 0, bulge: 1 }, { x: 2, y: 0, bulge: 0 }] }
    const segments = vectorSegments(e)
    expect(segments.length).toBeGreaterThan(5)
    expect(segments.every(s => Number.isFinite(s.a.x + s.a.y + s.b.x + s.b.y))).toBe(true)
  })

  it('reads a quarter arc in the units emitted by the DXF parser', () => {
    const sheet = parseDxfText(minimal(groups(0, 'ARC', 8, 'WALL', 10, 0, 20, 0, 40, 2, 50, 0, 51, 90)))
    const segments = vectorSegments(sheet.entities[0])
    expect(segments).toHaveLength(9)
    expect(segments[0].a).toEqual({ x: 2, y: 0 })
    expect(segments.at(-1)!.b.x).toBeCloseTo(0)
    expect(segments.at(-1)!.b.y).toBeCloseTo(2)
  })

  it('expands nested paper-space inserts using the inherited layer and unique entity IDs', () => {
    const blocks = groups(0, 'SECTION', 2, 'BLOCKS',
      0, 'BLOCK', 2, 'INNER', 10, 0, 20, 0,
      0, 'LINE', 5, 'A1', 8, '0', 10, 0, 20, 0, 11, 2, 21, 0, 0, 'ENDBLK',
      0, 'BLOCK', 2, 'OUTER', 10, 0, 20, 0,
      0, 'INSERT', 2, 'INNER', 8, '0', 10, 2, 20, 0, 0, 'ENDBLK', 0, 'ENDSEC')
    const inserts = groups(0, 'INSERT', 2, 'OUTER', 8, 'WALL', 67, 1, 10, 10, 20, 20,
      0, 'INSERT', 2, 'OUTER', 8, 'WALL', 67, 1, 10, 30, 20, 20)
    const sheet = parseDxfText(blocks + minimal(inserts))
    expect(entitiesForDrawing(sheet, 'model')).toHaveLength(0)
    expect(entitiesForDrawing(sheet, 'paper')).toMatchObject([
      { kind: 'line', layer: 'WALL', a: { x: 12, y: 20 }, b: { x: 14, y: 20 } },
      { kind: 'line', layer: 'WALL', a: { x: 32, y: 20 }, b: { x: 34, y: 20 } },
    ])
    expect(new Set(sheet.entities.map(e => e.id)).size).toBe(2)
  })

  it('preserves the shape of rotated and non-uniformly scaled block arcs', () => {
    const blocks = groups(0, 'SECTION', 2, 'BLOCKS', 0, 'BLOCK', 2, 'CURVES', 10, 0, 20, 0,
      0, 'ARC', 8, '0', 10, 0, 20, 0, 40, 2, 50, 0, 51, 90, 0, 'ENDBLK', 0, 'ENDSEC')
    const inserts = groups(0, 'INSERT', 2, 'CURVES', 8, 'WALL', 10, 10, 20, 20, 41, 2, 42, 1, 50, 90,
      0, 'INSERT', 2, 'CURVES', 8, 'WALL', 10, 0, 20, 0, 41, -1, 42, 1)
    const [scaled, mirrored] = parseDxfText(blocks + minimal(inserts)).entities.map(entity => vectorSegments(entity))
    expect(scaled[0].a.x).toBeCloseTo(10)
    expect(scaled[0].a.y).toBeCloseTo(24)
    expect(scaled.at(-1)!.b.x).toBeCloseTo(8)
    expect(scaled.at(-1)!.b.y).toBeCloseTo(20)
    expect(mirrored[0].a.x).toBeCloseTo(0)
    expect(mirrored[0].a.y).toBeCloseTo(2)
    expect(mirrored.at(-1)!.b.x).toBeCloseTo(-2)
    expect(mirrored.at(-1)!.b.y).toBeCloseTo(0)
  })

  it('joins normal double line wall corners at their centerline intersections', () => {
    const walls = [
      line('1', 'WALL', 0, 0, 6, 0), line('2', 'WALL', 6, 0, 6, 5),
      line('3', 'WALL', 6, 5, 0, 5), line('4', 'WALL', 0, 5, 0, 0),
      line('5', 'WALL', 0.2, 0.2, 5.8, 0.2), line('6', 'WALL', 5.8, 0.2, 5.8, 4.8),
      line('7', 'WALL', 5.8, 4.8, 0.2, 4.8), line('8', 'WALL', 0.2, 4.8, 0.2, 0.2),
    ]
    const imported = build(walls)
    expect(imported.stats.rooms).toBe(1)
    expect(imported.unit.vertices).toHaveLength(4)
    expect(imported.unit.walls.every(w => Math.abs(w.thicknessM - 0.2) < 1e-6)).toBe(true)
  })

  it.each([false, true])('closes both rooms when a partition stops 10 mm short (partition first: %s)', partitionFirst => {
    const boundary = [
      line('south', 'WALL', 0, 0, 8, 0), line('east', 'WALL', 8, 0, 8, 4),
      line('north', 'WALL', 8, 4, 0, 4), line('west', 'WALL', 0, 4, 0, 0),
    ]
    const partition = line('divider', 'WALL', 3, 0.01, 3, 3.99)
    const result = build(partitionFirst ? [partition, ...boundary] : [...boundary, partition])
    expect(result.stats).toMatchObject({ rooms: 2, walls: 7, openings: 0 })
    expect(result.unit.vertices).toHaveLength(6)
    for (const y of [0, 4]) expect(result.unit.vertices).toContainEqual(expect.objectContaining({ x: 3, y }))
  })

  it('leaves a partition with a 200 mm clearance open for review', () => {
    const result = build([
      line('south', 'WALL', 0, 0, 8, 0), line('east', 'WALL', 8, 0, 8, 4),
      line('north', 'WALL', 8, 4, 0, 4), line('west', 'WALL', 0, 4, 0, 0),
      line('divider', 'WALL', 3, 0, 3, 3.8),
    ])
    expect(result.stats).toMatchObject({ rooms: 1, openings: 0 })
    expect(result.review.some(row => row.kind === 'unclosed')).toBe(true)
  })

  it('keeps one opening when an opening is drawn with parallel lines or an inferred gap', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 2, 0), line('b', 'WALL', 3, 0, 5, 0),
      line('c', 'WIN', 2, 0, 3, 0), line('d', 'WIN', 2, 0.05, 3, 0.05),
    ])
    expect(result.unit.walls.flatMap(w => w.openings)).toMatchObject([{ kind: 'window', offsetM: 2, widthM: 1 }])
    expect(validate(result.unit).some(issue => issue.code === 'openings-overlap')).toBe(false)
  })

  it('imports straight and rectangular CAD opening symbols as one opening each', () => {
    const symbol = (layer: string, closed: number, points: number[][]) =>
      groups(0, 'LWPOLYLINE', 8, layer, 90, points.length, 70, closed, ...points.flatMap(([x, y]) => [10, x, 20, y]))
    const sheet = parseDxfText(minimal(
      groups(0, 'LINE', 8, 'WALL', 10, 0, 20, 0, 11, 6000, 21, 6000)
      + symbol('DOOR', 0, [[1000, 1000], [1300, 1300], [1600, 1600]])
      + symbol('WIN', 1, [[2960, 3040], [3040, 2960], [4040, 3960], [3960, 4040], [2960, 3040]]),
    ))
    const result = buildDxfUnit(sheet, { drawingId: 'model', metresPerSourceUnit: 0.001, roles: { WALL: 'walls', DOOR: 'doors', WIN: 'windows' } })
    const openings = result.unit.walls[0].openings
    expect(openings.map(o => o.kind)).toEqual(['door', 'window'])
    expect(openings[0].offsetM).toBeCloseTo(Math.SQRT2)
    expect(openings[0].widthM).toBeCloseTo(0.6 * Math.SQRT2)
    expect(openings[1].offsetM).toBeCloseTo(3 * Math.SQRT2)
    expect(openings[1].widthM).toBeCloseTo(Math.SQRT2)
  })

  it('flags bent and bulged opening polylines for review', () => {
    const marker = (id: string, points: number[][]): VectorEntity => ({
      id, layer: 'DOOR', kind: 'polyline', sourceType: 'LWPOLYLINE', paperSpace: false, closed: false,
      vertices: points.map(([x, y, bulge = 0]) => ({ x, y, bulge })),
    })
    const result = build([line('a', 'WALL', 0, 0, 6, 0),
      marker('bent', [[1, 0], [2, 0], [2, 1]]), marker('swing', [[3, 0, 0.4], [4, 0]])])
    expect(result.stats.openings).toBe(0)
    expect(result.review.filter(row => row.kind === 'opening-guess').map(row => row.entityId)).toEqual(['bent', 'swing'])
  })

  it('keeps one window when a legacy POLYLINE and a LINE mark the same wall gap', () => {
    const sheet = parseDxfText(minimal(
      groups(0, 'LINE', 8, 'WALL', 10, 0, 20, 0, 11, 2000, 21, 0,
        0, 'LINE', 8, 'WALL', 10, 3000, 20, 0, 11, 6000, 21, 0,
        0, 'POLYLINE', 8, 'WIN', 66, 1, 70, 0,
        0, 'VERTEX', 8, 'WIN', 10, 3000, 20, 0,
        0, 'VERTEX', 8, 'WIN', 10, 2000, 20, 0, 0, 'SEQEND',
        0, 'LINE', 8, 'WIN', 10, 2000, 20, 20, 11, 3000, 21, 20),
    ))
    const options = { drawingId: 'model', metresPerSourceUnit: 0.001, roles: { WALL: 'walls', WIN: 'windows' } } as const
    for (const entities of [sheet.entities.filter(e => !(e.layer === 'WIN' && e.kind === 'line')), sheet.entities]) {
      const result = buildDxfUnit({ ...sheet, entities }, options)
      expect(result.unit.walls[0].openings).toMatchObject([{ kind: 'window', offsetM: 2, widthM: 1 }])
      expect(result.review.filter(row => row.kind === 'opening-guess')).toEqual([])
    }
  })

  it('does not attach an opening to the extension of a closer but out of range wall', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 2, 0), line('b', 'WALL', 5, 0.18, 10, 0.18),
      line('c', 'DOOR', 6, 0, 7, 0),
    ])
    expect(result.stats.openings).toBe(1)
    expect(result.unit.walls.find(w => w.openings.length)?.openings[0].offsetM).toBeCloseTo(1)
  })

  it('preserves a window on a reversed duplicate wall when its geometry is merged', () => {
    const result = build([
      line('long', 'WALL', 0, 0, 6, 0), line('repeat', 'WALL', 4, 0.003, 2, 0.003),
      line('window', 'WIN', 2.2, 0.003, 3, 0.003),
    ])
    const openings = result.unit.walls.flatMap(w => w.openings)
    expect(openings).toHaveLength(1)
    expect(openings[0].kind).toBe('window')
    expect(openings[0].offsetM).toBeCloseTo(0.2)
    expect(openings[0].widthM).toBeCloseTo(0.8)
  })

  it('flags an opening that cannot fit after a junction splits its wall', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 6, 0), line('b', 'WALL', 3, 0, 3, 3),
      line('c', 'WIN', 2.5, 0, 3.5, 0),
    ])
    expect(result.stats.openings).toBe(0)
    expect(result.review).toContainEqual(expect.objectContaining({ message: expect.stringContaining('could not fit'), entityId: 'c' }))
  })

  it('deduplicates matching markers across duplicate walls and flags conflicting markers', () => {
    const walls = [line('long', 'WALL', 0, 0, 6, 0), line('repeat', 'WALL', 4, 0.003, 2, 0.003)]
    for (const layer of ['WIN', 'DOOR']) {
      const result = build([...walls, line('first', 'WIN', 2.2, 0, 3, 0), line('second', layer, 3, 0.003, 2.2, 0.003)])
      expect(result.unit.walls.flatMap(w => w.openings)).toMatchObject([{ kind: 'window' }])
      expect(result.review.some(item => item.entityId === 'second' && item.message.includes('Overlapping'))).toBe(layer === 'DOOR')
    }
  })

  it('skips malformed coordinates without placing a wall at the origin', () => {
    const sheet = parseDxfText(minimal(
      groups(0, 'LINE', 8, 'WALL', 10, 'invalid', 20, 0, 11, 10, 21, 0)
      + groups(0, 'LINE', 8, 'WALL', 10, 1, 20, 1, 11, 2, 21, 1),
    ))
    expect(sheet.entities).toHaveLength(1)
    expect(sheet.warnings[0]).toMatch(/non-finite/)
  })

  it('bounds curve tessellation before very large polylines expand into wall segments', () => {
    const path: VectorEntity = {
      id: 'curves', layer: 'WALL', paperSpace: false, sourceType: 'LWPOLYLINE',
      kind: 'polyline', closed: false,
      vertices: Array.from({ length: 6000 }, (_, x) => ({ x, y: 0, bulge: 1 })),
    }
    expect(() => build([path])).toThrow(/too many segments/)
  })

  it('selects a separated model drawing using model extents and reports its own layer counts', () => {
    const entities = [
      ...Array.from({ length: 4 }, (_, i) => line(`a${i}`, 'WALL', 0, i, 4, i)),
      ...Array.from({ length: 4 }, (_, i) => line(`b${i}`, 'WALL', 40, i, 44, i)),
      { ...line('paper', 'WALL', 4000, 0, 8000, 0), paperSpace: true },
    ]
    const sheet: VectorSheet = { fileName: 'plans.dxf', unitsHint: 'meters', entities, layers: ['WALL'], bounds: drawingBounds(entities), warnings: [], spaces: ['model', 'paper'] }
    expect(drawingChoices(sheet).map(d => d.id)).toEqual(['model', 'cluster:0', 'cluster:1', 'paper'])
    const second = entitiesForDrawing(sheet, 'cluster:1')
    expect(drawingBounds(second)).toEqual({ minX: 40, minY: 0, maxX: 44, maxY: 3 })
    expect(guessLayers(sheet, second)[0].counts.line).toBe(4)
    expect(entitiesForDrawing(sheet, 'invalid:0')).toEqual([])
  })

  it('exports selected-flat statistics and area separately from the whole floor', () => {
    const rectangle = (x: number, type: string): VectorEntity[] => [
      line(type + '1', 'WALL', x, 0, x + 5, 0), line(type + '2', 'WALL', x + 5, 0, x + 5, 4),
      line(type + '3', 'WALL', x + 5, 4, x, 4), line(type + '4', 'WALL', x, 4, x, 0),
      { id: type, layer: 'ROOM', paperSpace: false, sourceType: 'TEXT', kind: 'text', text: `Type ${type}`, at: { x: x + 2, y: 2 }, rotationDeg: 0, height: 0.2 },
    ]
    const floor = build([...rectangle(0, 'A'), ...rectangle(20, 'B')])
    expect(floor.flatChoices).toEqual(['Type A', 'Type B'])
    floor.unit.areaSqft = 1600
    const selected = selectDxfFlat(floor, 'Type B')
    expect(selected.stats).toMatchObject({ walls: 4, rooms: 1, openings: 0 })
    expect(selected.unit.areaSqft).toBeGreaterThan(190)
    expect(selected.unit.areaSqft).toBeLessThan(220)
    expect(selected.review.filter(row => row.kind === 'unlabelled')).toHaveLength(1)
    expect(selected.review.some(row => row.kind === 'scale')).toBe(true)
  })

  it('keeps model and paper drawings distinct and guesses likely wall layers', () => {
    const entities: VectorEntity[] = Array.from({ length: 8 }, (_, i) => ({ id: String(i), layer: 'A-WALL', paperSpace: i === 7, sourceType: 'LINE', kind: 'line', a: { x: i, y: 0 }, b: { x: i, y: 4 } }))
    const sheet: VectorSheet = { fileName: 'x.dxf', unitsHint: 'meters', entities, layers: ['A-WALL'], bounds: { minX: 0, minY: 0, maxX: 8, maxY: 4 }, warnings: [], spaces: ['model', 'paper'] }
    expect(drawingChoices(sheet).map(x => x.id)).toEqual(['model', 'paper'])
    expect(guessLayers(sheet)[0].role).toBe('walls')
  })

  it('joins aligned wall fragments and marks inferred door gaps for review', () => {
    const review: Parameters<typeof joinWallGaps>[1] = []
    const result = joinWallGaps([
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, thickness: 0.13, layer: 'W' },
      { a: { x: 2.8, y: 0 }, b: { x: 5, y: 0 }, thickness: 0.13, layer: 'W' },
    ], review)
    expect(result).toHaveLength(1)
    expect(result[0].openings?.[0]?.width).toBeCloseTo(0.8)
    expect(result[0].openings?.[0]?.kind).toBe('door')
    expect(review[0]?.kind).toBe('opening-guess')
  })

  it.each([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]])('keeps solid wall between nearby gaps in entity order %i, %i, %i', (i, j, k) => {
    const fragments = [
      line('west', 'WALL', 0, 0, 2, 0),
      line('pier', 'WALL', 2.5, 0, 3, 0),
      line('east', 'WALL', 5, 0, 3.5, 0),
    ]
    const result = build([fragments[i], fragments[j], fragments[k]])
    expect(result.stats).toMatchObject({ walls: 1, openings: 2 })
    const wall = result.unit.walls[0]
    const openings = wall.openings
    expect(openings.map(o => o.widthM)).toEqual([0.5, 0.5])
    expect(openings.every(o => o.kind === 'door')).toBe(true)
    const startX = result.unit.vertices.find(v => v.id === wall.a)!.x
    const direction = startX === 0 ? 1 : -1
    expect(openings.map(o => startX + direction * (o.offsetM + o.widthM / 2)).sort((a, b) => a - b)).toEqual([2.25, 3.25])
  })

  it('builds a normal editable Unit graph from a mapped vector plan', () => {
    const entities: VectorEntity[] = [
      { id: '1', layer: 'WALL', paperSpace: false, sourceType: 'LINE', kind: 'line', a: { x: 0, y: 0 }, b: { x: 5, y: 0 } },
      { id: '2', layer: 'WALL', paperSpace: false, sourceType: 'LINE', kind: 'line', a: { x: 5, y: 0 }, b: { x: 5, y: 4 } },
      { id: '3', layer: 'WALL', paperSpace: false, sourceType: 'LINE', kind: 'line', a: { x: 5, y: 4 }, b: { x: 0, y: 4 } },
      { id: '4', layer: 'WALL', paperSpace: false, sourceType: 'LINE', kind: 'line', a: { x: 0, y: 4 }, b: { x: 0, y: 0 } },
      { id: '5', layer: 'ROOM', paperSpace: false, sourceType: 'TEXT', kind: 'text', text: 'BEDROOM', at: { x: 2.5, y: 2 }, rotationDeg: 0, height: 0.2 },
    ]
    const sheet: VectorSheet = { fileName: 'floor.dxf', unitsHint: 'meters', entities, layers: ['WALL', 'ROOM'], bounds: { minX: 0, minY: 0, maxX: 5, maxY: 4 }, warnings: [], spaces: ['model'] }
    const result = buildDxfUnit(sheet, { drawingId: 'model', roles: { WALL: 'walls', ROOM: 'text' }, metresPerSourceUnit: 1 })
    expect(result.unit.walls).toHaveLength(4)
    expect(result.unit.vertices).toHaveLength(4)
    expect(result.stats.rooms).toBe(1)
    expect(result.unit.roomLabels[0]?.name).toMatch(/BEDROOM/i)
  })
})
