import type { AutoTraceResult } from '../trace/types'
import type { Id } from '../core'
import { normalizeUnit, reducer, type Draft, type PlanImage, type StudioState } from '../studio/model'
import { studioReducer, type StudioAction } from '../studio/review'
import type { DxfImportResult, DxfReviewItem } from './types'

export type DxfReview = Pick<DxfImportResult, 'sourceName' | 'stats'> & {
  source: 'dxf'
  unitId: Id
  items: DxfReviewItem[]
}
export type StudioDraftWithDxf = Draft & { dxfReview?: DxfReview }

type DrawingContext = Pick<StudioState, 'planImage' | 'review' | 'view'> & { dxfReview?: DxfReview }
type ImportBoundary = { previousId: Id; before: DrawingContext; after: DrawingContext }
export type StudioStateWithDxf = StudioState & {
  dxfReview?: DxfReview
  dxfImports?: ReadonlyMap<Id, ImportBoundary>
}

type Action = Exclude<StudioAction, { type: 'restore' }>
  | { type: 'restore'; draft: StudioDraftWithDxf }
  | { type: 'dxf-import'; result: DxfImportResult }
  | { type: 'raster-import'; image: PlanImage; result: AutoTraceResult }
  | { type: 'dxf-dismiss'; id: Id }

export const activeDxfReview = (state: StudioStateWithDxf) =>
  state.dxfReview?.unitId === state.unit.id ? state.dxfReview : undefined

function drawingContext(state: StudioStateWithDxf): DrawingContext {
  const { planImage, review, view, dxfReview } = state
  return { planImage, review, view, dxfReview }
}

function trackImport(state: StudioStateWithDxf, next: StudioStateWithDxf): StudioStateWithDxf {
  const historyIds = new Set(next.history.past.map(drawing => drawing.id))
  const imports = new Map([...(state.dxfImports ?? [])].filter(([id]) => historyIds.has(id)))
  imports.set(next.unit.id, {
    previousId: state.unit.id,
    before: drawingContext(state),
    after: drawingContext(next),
  })
  return { ...next, dxfImports: imports }
}

export function studioReducerWithDxf(state: StudioStateWithDxf, action: Action): StudioStateWithDxf {
  if (action.type === 'raster-import') {
    const next = studioReducer({ ...state, planImage: action.image, review: null }, { type: 'auto-trace', result: action.result })
    // Joining walls can add another undo step. Treat an uploaded floor and its source picture as one edit.
    return trackImport(state, { ...next, history: reducer(state, { type: 'drag-begin' }).history, dxfReview: undefined })
  }
  if (action.type === 'dxf-import') {
    const { unit: built, review, sourceName, stats } = action.result
    const unit = normalizeUnit({ ...built, planImage: undefined })
    const next: StudioStateWithDxf = {
      ...reducer(state, { type: 'drag-begin' }),
      unit,
      planImage: null,
      review: null,
      dxfReview: { source: 'dxf', unitId: unit.id, items: review, sourceName, stats },
      selection: [],
      chain: null,
      tool: 'select',
    }
    return trackImport(state, next)
  }

  if (action.type === 'dxf-dismiss') {
    const current = activeDxfReview(state)
    return current ? { ...state, dxfReview: { ...current, items: current.items.filter(row => row.id !== action.id) } } : state
  }

  const next = studioReducer(state, action)
  if (action.type === 'restore') {
    const saved = action.draft.dxfReview
    if (saved?.unitId === next.unit.id) return { ...next, dxfReview: saved }
    // Drafts saved by the first DXF importer stored their rows in the raster review field.
    const legacy = action.draft.review as Draft['review'] & { source?: string; sourceName?: string; dxfStats?: DxfReview['stats'] }
    if (legacy?.source === 'dxf' && legacy.unitId === next.unit.id && legacy.dxfStats) {
      return {
        ...next,
        review: null,
        dxfReview: { source: 'dxf', unitId: legacy.unitId, items: legacy.items, sourceName: legacy.sourceName ?? next.unit.name, stats: legacy.dxfStats },
      }
    }
  }
  if (!state.dxfImports || state.unit.id === next.unit.id) return next

  // The standard history holds Units. Restore the photo and review when undo crosses an upload.
  if (action.type === 'undo') {
    const entry = state.dxfImports.get(state.unit.id)
    if (entry?.previousId !== next.unit.id) return next
    const imports = new Map(state.dxfImports)
    imports.set(state.unit.id, { ...entry, after: drawingContext(state) })
    return { ...next, ...entry.before, dxfImports: imports }
  }
  if (action.type === 'redo') {
    const entry = state.dxfImports.get(next.unit.id)
    if (entry?.previousId !== state.unit.id) return next
    const imports = new Map(state.dxfImports)
    imports.set(next.unit.id, { ...entry, before: drawingContext(state) })
    return { ...next, ...entry.after, dxfImports: imports }
  }
  return next
}
