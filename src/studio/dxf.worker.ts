import { buildDxfUnit, selectDxfFlat } from '../dxf/buildUnit'
import { parseDxfBytes } from '../dxf/parse'
import type { BuildDxfOptions, DxfImportResult, VectorSheet } from '../dxf/types'

export type DxfWorkerIn = { type: 'parse'; buffer: ArrayBuffer; fileName: string } | { type: 'build'; options: BuildDxfOptions } | { type: 'select-flat'; name: string }
export type DxfWorkerOut = { type: 'parsed'; sheet: VectorSheet } | { type: 'built'; result: DxfImportResult } | { type: 'error'; message: string }

let sheet: VectorSheet | null = null
let built: DxfImportResult | null = null
self.onmessage = (event: MessageEvent<DxfWorkerIn>) => {
  try {
    if (event.data.type === 'parse') {
      sheet = null
      built = null
      sheet = parseDxfBytes(event.data.buffer, event.data.fileName)
      self.postMessage({ type: 'parsed', sheet } satisfies DxfWorkerOut)
      return
    }
    if (!sheet) throw new Error('Choose a DXF file first.')
    if (event.data.type === 'select-flat') {
      if (!built) throw new Error('Build the drawing before selecting a flat.')
      const result = selectDxfFlat(built, event.data.name)
      self.postMessage({ type: 'built', result } satisfies DxfWorkerOut)
      return
    }
    built = null
    built = buildDxfUnit(sheet, event.data.options)
    self.postMessage({ type: 'built', result: built } satisfies DxfWorkerOut)
  } catch (e) {
    self.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) } satisfies DxfWorkerOut)
  }
}

