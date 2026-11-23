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

  it('keeps one opening when an opening is drawn with parallel lines or an inferred gap', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 2, 0), line('b', 'WALL', 3, 0, 5, 0),
      line('c', 'WIN', 2, 0, 3, 0), line('d', 'WIN', 2, 0.05, 3, 0.05),
    ])
    expect(result.unit.walls.flatMap(w => w.openings)).toMatchObject([{ kind: 'window', offsetM: 2, widthM: 1 }])
    expect(validate(result.unit).some(issue => issue.code === 'openings-overlap')).toBe(false)
  })

  it('does not attach an opening to the extension of a closer but out of range wall', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 2, 0), line('b', 'WALL', 5, 0.18, 10, 0.18),
      line('c', 'DOOR', 6, 0, 7, 0),
    ])
    expect(result.stats.openings).toBe(1)
    expect(result.unit.walls.find(w => w.openings.length)?.openings[0].offsetM).toBeCloseTo(1)
  })

  it('flags an opening that cannot fit after a junction splits its wall', () => {
    const result = build([
      line('a', 'WALL', 0, 0, 6, 0), line('b', 'WALL', 3, 0, 3, 3),
      line('c', 'WIN', 2.5, 0, 3.5, 0),
    ])
    expect(result.stats.openings).toBe(0)
    expect(result.review).toContainEqual(expect.objectContaining({ message: expect.stringContaining('could not fit'), entityId: 'c' }))
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
