import type { Unit } from '../core'

export type DxfUnits = 'unitless' | 'inches' | 'feet' | 'miles' | 'millimeters' | 'centimeters' | 'meters' | 'kilometers'
export type LayerRole = 'walls' | 'doors' | 'windows' | 'text' | 'dimensions' | 'furniture' | 'ignore'

export interface DxfPoint { x: number; y: number }
export interface DxfVertex extends DxfPoint { bulge: number }
export interface DxfEntityBase { id: string; layer: string; paperSpace: boolean; sourceType: string }
export type VectorEntity =
  | (DxfEntityBase & { kind: 'line'; a: DxfPoint; b: DxfPoint })
  | (DxfEntityBase & { kind: 'polyline'; vertices: DxfVertex[]; closed: boolean })
  | (DxfEntityBase & { kind: 'arc'; center: DxfPoint; radius: number; startDeg: number; endDeg: number })
  | (DxfEntityBase & { kind: 'circle'; center: DxfPoint; radius: number })
  | (DxfEntityBase & { kind: 'text'; text: string; at: DxfPoint; rotationDeg: number; height: number })
  | (DxfEntityBase & { kind: 'insert'; name: string; at: DxfPoint; scaleX: number; scaleY: number; rotationDeg: number; columns: number; rows: number; columnSpacing: number; rowSpacing: number })
  | (DxfEntityBase & { kind: 'unsupported'; label: string; at?: DxfPoint })

export interface VectorSheet {
  fileName: string
  unitsHint: DxfUnits
  /** Source coordinates remain in native DXF drawing units until the scale-confirm boundary. */
  entities: VectorEntity[]
  layers: string[]
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  warnings: string[]
  spaces: ('model' | 'paper')[]
}

export interface DrawingChoice { id: string; label: string; paperSpace: boolean; entityCount: number }
export interface LayerGuess { layer: string; role: LayerRole; confidence: number; counts: Record<string, number> }
export interface DxfReviewItem {
  id: string
  at: DxfPoint
  kind: 'unclosed' | 'unlabelled' | 'size-mismatch' | 'opening-guess' | 'low-confidence' | 'scale' | 'other'
  message: string
  entityId?: string
  scope?: 'drawing'
}
export interface DxfImportResult {
  unit: Unit
  review: DxfReviewItem[]
  stats: { walls: number; rooms: number; openings: number; sourceUnits: DxfUnits; metresPerSourceUnit: number }
  sourceName: string
  flatChoices: string[]
}

export interface BuildDxfOptions {
  drawingId: string
  roles: Record<string, LayerRole>
  metresPerSourceUnit: number
  projectName?: string
  unitName?: string
  areaSqft?: number
}

