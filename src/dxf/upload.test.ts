import { describe, expect, it } from 'vitest'
import { initialState } from '../studio/model'
import { studioReducerWithDxf } from './studioState'
import type { LayerGuess, VectorEntity } from './types'
import { canMapAutomatically, learnedLayers, profileKey, scaleReference } from './upload'

const walls: LayerGuess = { layer: 'A-WALL', role: 'walls', confidence: 0.88, counts: { line: 4 } }
const labels: LayerGuess = { layer: 'A-TEXT', role: 'text', confidence: 0.88, counts: { text: 1 } }

describe('automatic whole-floor upload', () => {
  it('matches layer conventions across floors and avoids sharing anonymous layer names', () => {
    const key = profileKey([walls, labels])
    expect(profileKey([labels, { ...walls, counts: { line: 50, text: 0 } }])).toBe(key)
    expect(profileKey([{ ...walls, counts: { polyline: 4 } }, labels])).not.toBe(key)
    expect(profileKey([{ ...walls, layer: '0' }])).toBeNull()
  })

  it('reuses individual confirmed roles from older profiles after layers are added or removed', () => {
    const geometry = { ...walls, layer: 'GEOM', role: 'ignore' as const, confidence: 0.25 }
    const furniture = { ...walls, layer: 'A-FURN', role: 'furniture' as const }
    const profiles = { [profileKey([geometry, labels])!]: { GEOM: 'walls', 'A-TEXT': 'text' } }
    for (const layers of [[geometry], [geometry, labels, furniture]]) {
      const { confirmed, needsReview } = learnedLayers(layers, profiles)
      expect(confirmed.GEOM).toBe('walls')
      expect(confirmed['A-FURN']).toBeUndefined()
      expect(needsReview.size).toBe(0)
      expect(canMapAutomatically(layers, confirmed)).toBe(true)
    }
  })

  it('asks about changed geometry and conflicting roles while retaining exact-profile choices', () => {
    const profiles = {
      [profileKey([walls, labels])!]: { 'A-WALL': 'walls', 'A-TEXT': 'text' },
      [profileKey([walls])!]: { 'A-WALL': 'doors' },
    }
    expect(learnedLayers([walls, { ...labels, layer: 'NEW' }], profiles).needsReview.has('A-WALL')).toBe(true)
    expect(learnedLayers([{ ...walls, counts: { polyline: 2 } }, labels], profiles).needsReview.has('A-WALL')).toBe(true)
    expect(learnedLayers([walls, labels], profiles).confirmed['A-WALL']).toBe('walls')
  })

  it('skips malformed stored entries and numeric layers for partial matches', () => {
    const anonymous = { ...walls, layer: '0' }
    const profiles = { junk: { GEOM: 'doors' }, [profileKey([anonymous, labels])!]: { '0': 'doors', 'A-TEXT': 'unknown' } }
    expect(learnedLayers([anonymous, walls, labels], profiles).confirmed).toEqual({})
    expect(profileKey([{ ...walls, layer: 'দেয়াল' }])).toBeTruthy()
  })

  it('asks for an uncertain mapping until confirmed and checks wall geometry', () => {
    const unknown: LayerGuess = { ...walls, layer: 'GEOM', role: 'ignore', confidence: 0.25 }
    expect(canMapAutomatically([walls, labels], {})).toBe(true)
    expect(canMapAutomatically([unknown, labels], {})).toBe(false)
    expect(canMapAutomatically([unknown, labels], { GEOM: 'walls' })).toBe(true)
    expect(canMapAutomatically([{ ...walls, counts: { text: 2 } }], {})).toBe(false)
    expect(canMapAutomatically([labels], {})).toBe(false)
  })

  it('offers a straight wall length, including the closing edge of a polyline', () => {
    const poly: VectorEntity = { id: 'p', kind: 'polyline', layer: 'W', sourceType: 'LWPOLYLINE', closed: true, paperSpace: false,
      vertices: [{ x: 0, y: 0, bulge: 1 }, { x: 30, y: 0, bulge: 1 }, { x: 3, y: 4, bulge: 0 }] }
    expect(scaleReference([poly], { W: 'walls' })?.length).toBe(5)
    expect(scaleReference([{ ...poly, closed: false }], { W: 'walls' })).toBeUndefined()
    expect(scaleReference([poly], { W: 'furniture' })).toBeUndefined()
  })

  it('restores the picture and matching review across consecutive uploads with undo and redo', () => {
    const original = initialState()
    const image = { dataUrl: 'data:image/png;base64,AA==', naturalW: 100, naturalH: 80, name: 'first.png' }
    const raster = studioReducerWithDxf(original, { type: 'raster-import', image, result: {
      unit: original.unit, review: [], stats: { ms: 0, pxPerM: 10, scaleFrom: 'given', walls: 0, rooms: 0, labelled: 0 },
    } })
    const cad = studioReducerWithDxf(raster, { type: 'dxf-import', result: {
      unit: { ...original.unit, id: 'cad' }, sourceName: 'second.dxf', flatChoices: [], review: [],
      stats: { walls: 0, rooms: 0, openings: 0, sourceUnits: 'meters', metresPerSourceUnit: 1 },
    } })
    const back = studioReducerWithDxf(cad, { type: 'undo' })
    expect(back.planImage).toEqual(image)
    expect(back.review).toEqual(raster.review)
    const empty = studioReducerWithDxf(back, { type: 'undo' })
    expect(empty.unit).toEqual(original.unit)
    expect(empty.planImage).toBeNull()
    const restored = studioReducerWithDxf(empty, { type: 'redo' })
    expect(restored.planImage).toEqual(image)
    const forward = studioReducerWithDxf(restored, { type: 'redo' })
    expect(forward.dxfReview).toEqual(cad.dxfReview)
    expect(forward.planImage).toBeNull()
  })
})
