import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { drawingBounds, drawingChoices, entitiesForDrawing } from '../dxf/drawings'
import { vectorSegments } from '../dxf/curves'
import { guessLayers } from '../dxf/layers'
import { sourceScale } from '../dxf/units'
import { canMapAutomatically, layerNeedsReview, layerRoles as ROLES, learnedLayers, profileKey, scaleReference } from '../dxf/upload'
import { parseLength } from '../core'
import type { BuildDxfOptions, DxfImportResult, DxfReviewItem, LayerRole, VectorEntity, VectorSheet } from '../dxf/types'
import type { DxfReview } from '../dxf/studioState'
import type { DxfWorkerIn, DxfWorkerOut } from './dxf.worker'
import './dxf-import.css'

const MAPPING_KEY = 'plotline.dxf.layers.v1'
const PROFILE_KEY = 'plotline.dxf.profiles.v1'
const MAX_BYTES = 15 * 1024 * 1024
const countLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`
const ROLE_LABEL: Record<LayerRole, string> = { walls: 'Walls', doors: 'Doors', windows: 'Windows', text: 'Room text', dimensions: 'Dimensions / notes', furniture: 'Furniture', ignore: 'Ignore' }
const COLORS: Record<LayerRole, string> = { walls: '#ff716b', doors: '#ffd166', windows: '#5bc0eb', text: '#8bd17c', dimensions: '#b4a7d6', furniture: '#d98bdf', ignore: '#647080' }
function remembered(name: string, store = MAPPING_KEY): Record<string, LayerRole> {
  try {
    const all = JSON.parse(localStorage.getItem(store) ?? '{}') as Record<string, Record<string, LayerRole>>
    const entry = all[name]
    return entry && typeof entry === 'object'
      ? Object.fromEntries(Object.entries(entry).filter(([, role]) => ROLES.includes(role)))
      : {}
  } catch { return {} }
}
function mappingFor(fileName: string, layers: ReturnType<typeof guessLayers>) {
  let profiles: unknown = {}
  try { profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') } catch { /* use the layer guesses */ }
  const { confirmed, needsReview } = learnedLayers(layers, profiles)
  const legacy = remembered(fileName.toLowerCase())
  const edits = { ...confirmed }
  for (const { layer } of layers) {
    if (!Object.hasOwn(legacy, layer)) continue
    edits[layer] = legacy[layer]
    if (legacy[layer] !== confirmed[layer]) needsReview.add(layer)
  }
  return { confirmed, needsReview, edits }
}

function remember(name: string, roles: Record<string, LayerRole>, store = MAPPING_KEY) {
  try {
    const all = JSON.parse(localStorage.getItem(store) ?? '{}') as Record<string, Record<string, LayerRole>>
    const next = { ...all, [name]: roles }
    const keys = Object.keys(next)
    for (const key of keys.slice(0, Math.max(0, keys.length - 40))) delete next[key]
    localStorage.setItem(store, JSON.stringify(next))
  } catch { /* storage can be full or disabled; the mapping still works for this import */ }
}

function previewPath(e: VectorEntity): string | null {
  if (e.kind === 'line') return `M ${e.a.x} ${e.a.y} L ${e.b.x} ${e.b.y}`
  if (e.kind === 'polyline' && e.vertices.length > 2500) {
    const step = Math.ceil(e.vertices.length / 2500)
    const path = e.vertices.filter((_v, i) => i % step === 0 || i === e.vertices.length - 1)
      .map((v, i) => `${i ? 'L' : 'M'} ${v.x} ${v.y}`).join(' ')
    return e.closed ? path + ' Z' : path
  }
  const lines = vectorSegments(e)
  return lines.length ? lines.map(s => `M ${s.a.x} ${s.a.y} L ${s.b.x} ${s.b.y}`).join(' ') : null
}

function Preview({ entities, roles, reference }: { entities: VectorEntity[]; roles: Record<string, LayerRole>; reference?: ReturnType<typeof scaleReference> }) {
  const shown = useMemo(() => entities.slice(0, 5000).map(e => ({ e, path: previewPath(e) })), [entities])
  const bounds = useMemo(() => drawingBounds(entities), [entities])
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1e-9)
  const width = Math.max(bounds.maxX - bounds.minX, span * 0.01), height = Math.max(bounds.maxY - bounds.minY, span * 0.01)
  return <svg className="dxf-preview" viewBox={`${bounds.minX} ${bounds.minY} ${width} ${height}`} role="img" aria-label="DXF layer preview">
    <rect x={bounds.minX} y={bounds.minY} width={width} height={height} fill="#101820" />
    <g transform={`translate(0 ${bounds.minY + bounds.maxY}) scale(1 -1)`} fill="none" strokeWidth={Math.max(width, height) / 650} vectorEffect="non-scaling-stroke">
      {shown.map(({ e, path }) => {
        const role = roles[e.layer] ?? 'ignore'
        if (path) return <path key={e.id} d={path} stroke={COLORS[role]} opacity={role === 'ignore' ? 0.25 : 0.9} />
        if (e.kind === 'text') return <circle key={e.id} cx={e.at.x} cy={e.at.y} r={Math.max(width, height) / 300} fill={COLORS[role]} stroke="none" />
        if (e.kind === 'insert') return <circle key={e.id} cx={e.at.x} cy={e.at.y} r={Math.max(width, height) / 250} stroke={COLORS[role]} />
        return null
      })}
      {reference && <line x1={reference.a.x} y1={reference.a.y} x2={reference.b.x} y2={reference.b.y} stroke="white" strokeWidth={span / 160} />}
    </g>
  </svg>
}

export function DxfReviewPanel({ result, onLocate, onDismiss }: {
  result: DxfReview
  onLocate: (row: DxfReviewItem) => void
  onDismiss: (id: string) => void
}) {
  return <section aria-label="DXF review">
    <h3>DXF review{result.items.length ? ` (${result.items.length})` : ''}</h3>
    <p className="muted">{result.sourceName} · {result.stats.metresPerSourceUnit} m per DXF unit</p>
    {result.items.length ? <ul className="issues dxf-review-list">
      {result.items.map(row => <li key={row.id}>
        <span>{row.message}</span>
        <span className="dxf-review-actions">
          <button className="link" onClick={() => onLocate(row)}>Show on plan</button>
          <button className="link" onClick={() => onDismiss(row.id)}>Looks right</button>
        </span>
      </li>)}
    </ul> : <p className="muted">Nothing left to check.</p>}
  </section>
}

export function DxfImport({ onClose, onImport, initialFile }: { initialFile?: File; onClose: () => void; onImport: (result: DxfImportResult) => boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const worker = useRef<Worker | null>(null)
  const timeout = useRef<number | null>(null)
  const reading = useRef(false)
  const pendingFlat = useRef<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [sheet, setSheet] = useState<VectorSheet | null>(null)
  const [layerEdits, setLayerEdits] = useState<Record<string, LayerRole>>({})
  const [reviewLayers, setReviewLayers] = useState(new Set<string>())
  const [drawingId, setDrawingId] = useState('model')
  const [metres, setMetres] = useState('')
  const [result, setResult] = useState<DxfImportResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reviewReason, setReviewReason] = useState('')
  const [automatic, setAutomatic] = useState(true)
  const [knownLength, setKnownLength] = useState('')
  const autoCommit = useRef(false)
  const [workerVersion, setWorkerVersion] = useState(0)
  const importSelected = useEffectEvent((value: DxfImportResult, manual: boolean) => {
    if (onImport(value) && manual) saveMapping()
  })

  const parsed = useEffectEvent((input: VectorSheet) => {
    const drawings = drawingChoices(input)
    const drawing = drawings[0]?.id ?? 'model'
    const layers = guessLayers(input, entitiesForDrawing(input, drawing))
    const { confirmed, needsReview, edits } = mappingFor(input.fileName, layers)
    setReviewLayers(needsReview)
    const factor = sourceScale(input.unitsHint)
    setSheet(input); setDrawingId(drawing); setLayerEdits(edits); setKnownLength('')
    setMetres(factor?.toString() ?? ''); setResult(null); setError('')
    if (!automatic) return
    if (drawings.length !== 1) return setReviewReason('Choose the drawing to import from this file.')
    if (!factor) return setReviewReason('Set the scale using one known length or a unit conversion.')
    if (needsReview.size || !canMapAutomatically(layers, confirmed)) return setReviewReason('Check the layer roles before building this floor.')
    autoCommit.current = true
    const roles = Object.fromEntries(layers.map(l => [l.layer, Object.hasOwn(edits, l.layer) ? edits[l.layer] : l.role]))
    send({ type: 'build', options: { drawingId: drawing, roles, metresPerSourceUnit: factor } })
  })
  useEffect(() => {
    const modal = dialog.current
    modal?.showModal()
    return () => modal?.close()
  }, [])

  useEffect(() => {
    const w = new Worker(new URL('./dxf.worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    const finish = () => {
      if (timeout.current !== null) window.clearTimeout(timeout.current)
      timeout.current = null
      setBusy(false)
    }
    w.onmessage = (event: MessageEvent<DxfWorkerOut>) => {
      finish()
      const message = event.data
      if (message.type === 'error') { autoCommit.current = false; pendingFlat.current = null; setError(message.message); return }
      if (message.type === 'parsed') {
        parsed(message.sheet)
        return
      }
      const flat = pendingFlat.current
      pendingFlat.current = null
      if (flat) { importSelected(message.result, true); return }
      setResult(message.result)
      const auto = autoCommit.current
      autoCommit.current = false
      if (auto) {
        if (message.result.stats.rooms > 0 && !message.result.review.some(r => r.kind === 'size-mismatch' || r.kind === 'unclosed')) {
          importSelected(message.result, false)
        } else setReviewReason('Review the room boundaries and dimensions before importing this floor.')
      }
    }
    w.onerror = event => {
      finish()
      setError(event.message || 'The DXF worker stopped unexpectedly. Choose the file again.')
      setSheet(null)
      setResult(null)
      setWorkerVersion(v => v + 1)
    }
    return () => {
      if (timeout.current !== null) window.clearTimeout(timeout.current)
      timeout.current = null
      pendingFlat.current = null
      w.terminate()
      worker.current = null
    }
  }, [workerVersion])

  const choices = useMemo(() => sheet ? drawingChoices(sheet) : [], [sheet])
  const entities = useMemo(() => sheet ? entitiesForDrawing(sheet, drawingId) : [], [sheet, drawingId])
  const drawingLayers = useMemo(() => sheet ? guessLayers(sheet, entities) : [], [sheet, entities])
  const roles = useMemo(() => Object.fromEntries(drawingLayers.map(({ layer, role }) =>
    [layer, Object.hasOwn(layerEdits, layer) ? layerEdits[layer] : role])), [drawingLayers, layerEdits])
  const displayLayers = useMemo(() => drawingLayers.map(layer => ({
    layer, check: reviewLayers.has(layer.layer) || layerNeedsReview(layer, layerEdits),
  })).sort((a, b) => Number(b.check) - Number(a.check)), [drawingLayers, reviewLayers, layerEdits])
  const reference = useMemo(() => sheet?.unitsHint === 'unitless' ? scaleReference(entities, roles) : undefined, [sheet, entities, roles])
  const measured = knownLength.trim() ? parseLength(knownLength) : null
  const factor = knownLength.trim() ? measured && reference && measured / reference.length : Number(metres)
  const saveMapping = () => {
    if (!sheet) return
    remember(sheet.fileName.toLowerCase(), layerEdits)
    const key = profileKey(drawingLayers)
    if (key) remember(key, roles, PROFILE_KEY)
  }

  const send = (message: DxfWorkerIn, transfer?: Transferable[]) => {
    const active = worker.current
    if (!active) { setBusy(false); setError('The DXF worker is starting. Try again.'); return }
    if (timeout.current !== null) return
    setBusy(true); setError('')
    timeout.current = window.setTimeout(() => {
      active.terminate()
      worker.current = null
      timeout.current = null
      pendingFlat.current = null
      setBusy(false)
      setError('DXF processing exceeded 60 seconds. Split the drawing or remove unused geometry, then retry.')
      setSheet(null)
      setResult(null)
      setWorkerVersion(v => v + 1)
    }, 60_000)
    try {
      active.postMessage(message, transfer ?? [])
    } catch {
      window.clearTimeout(timeout.current)
      timeout.current = null
      pendingFlat.current = null
      setBusy(false)
      setError('Could not send the drawing to the DXF worker. Try again.')
    }
  }
  const chooseFile = async (file?: File) => {
    if (!file || reading.current || timeout.current !== null) return
    autoCommit.current = false
    setError(''); setReviewReason(''); setResult(null); setSheet(null); setFileName(file.name)
    if (!/\.dxf$/i.test(file.name)) { setError('Choose an ASCII DXF file (.dxf). DWG and binary DXF are not supported yet.'); return }
    if (file.size > MAX_BYTES) { setError('This file is over 15 MB. Export only the floor plan or split the drawing, then retry.'); return }
    reading.current = true
    setBusy(true)
    const active = worker.current
    try {
      const buffer = await file.arrayBuffer()
      if (active !== worker.current) return
      send({ type: 'parse', buffer, fileName: file.name }, [buffer])
    } catch (e) {
      setBusy(false)
      setError(e instanceof Error ? e.message : String(e))
    } finally { reading.current = false }
  }
  const openInitial = useEffectEvent((file: File) => void chooseFile(file))
  useEffect(() => {
    let active = true
    if (initialFile) queueMicrotask(() => { if (active) openInitial(initialFile) })
    return () => { active = false }
  }, [initialFile])

  const updateRole = (layer: string, role: LayerRole) => {
    setResult(null); setKnownLength('')
    setReviewLayers(prev => new Set([...prev].filter(name => name !== layer)))
    setLayerEdits(prev => ({ ...prev, [layer]: role }))
  }
  const build = () => {
    if (!sheet) return
    if (!factor || !Number.isFinite(factor) || factor <= 0) { setError('Confirm a positive metres-per-DXF-unit scale before building.'); return }
    autoCommit.current = false
    setResult(null)
    const options: BuildDxfOptions = { drawingId, roles, metresPerSourceUnit: factor, unitName: sheet.fileName.replace(/\.dxf$/i, '') }
    send({ type: 'build', options })
  }
  const importFlat = (name: string) => { pendingFlat.current = name; send({ type: 'select-flat', name }) }
  const importWhole = () => { if (result && onImport(result)) saveMapping() }

  return <dialog ref={dialog} className="dxf-shade" aria-labelledby="dxf-title"
    onCancel={e => { e.preventDefault(); onClose() }}
    onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()}
    onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <section className="dxf-dialog">
      <header className="dxf-head"><div><h2 id="dxf-title">Import a DXF floor plan</h2><p>Read CAD vectors, map layers, confirm scale, then create an editable Plotline Unit.</p></div><button onClick={onClose} aria-label="Close DXF import">×</button></header>
      <div className="dxf-body">
        <label><input type="checkbox" checked={automatic} disabled={busy} onChange={e => setAutomatic(e.target.checked)} /> Automatically import a whole floor when units and layers are clear</label>
        <label className="dxf-file">DXF file<input type="file" accept=".dxf,application/dxf" disabled={busy} onChange={e => {
          const file = e.currentTarget.files?.[0]
          e.currentTarget.value = ''
          void chooseFile(file)
        }} /></label>
        {reviewReason && <p role="status">{reviewReason}</p>}
        {sheet && <>
          <div className="dxf-stage"><b>1. Choose drawing and map its layers</b><span>{fileName} · {entities.length.toLocaleString()} entities in this drawing · $INSUNITS: {sheet.unitsHint}</span></div>
          {choices.length > 1 && <label className="dxf-field">Drawing / layout<select value={drawingId} disabled={busy} onChange={e => { setResult(null); setKnownLength(''); setDrawingId(e.target.value)
            const mapping = mappingFor(sheet.fileName, guessLayers(sheet, entitiesForDrawing(sheet, e.target.value)))
            setLayerEdits(mapping.edits); setReviewLayers(mapping.needsReview) }}>{choices.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
          <Preview entities={entities} roles={roles} reference={reference} />
          {drawingLayers.length > 300 && <p className="dxf-warning">This file has {drawingLayers.length} layers; the table shows 300, with roles needing review first. Simplify layer count before importing if needed.</p>}
          <div className="dxf-legend">{ROLES.filter(r => drawingLayers.some(l => (roles[l.layer] ?? l.role) === r)).map(r => <span key={r}><i style={{ background: COLORS[r] }} />{ROLE_LABEL[r]}</span>)}</div>
          <div className="dxf-layer-head"><span>Layer</span><span>Entities</span><span>Use as</span><span>Mapping</span></div>
          <div className="dxf-layers">{displayLayers.slice(0, 300).map(({ layer, check }) => <div className="dxf-layer" key={layer.layer}>
            <strong title={layer.layer}>{layer.layer}</strong><span>{Object.values(layer.counts).reduce((a, b) => a + b, 0)}</span>
            <select aria-label={`Role for layer ${layer.layer}`} value={roles[layer.layer] ?? layer.role} disabled={busy} onChange={e => updateRole(layer.layer, e.target.value as LayerRole)}>{ROLES.map(role => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}</select>
            <span className={check ? 'dxf-low' : ''}>{check ? 'Check role' : Object.hasOwn(layerEdits, layer.layer) ? 'Mapped' : `${Math.round(layer.confidence * 100)}%`}</span>
          </div>)}</div>
          <div className="dxf-stage"><b>2. Confirm drawing scale</b><span>The DXF unit value is only a hint. Compare a printed room size after building.</span></div>
          <label className="dxf-field">1 DXF unit equals <span><input type="number" min="0.0000001" step="any" value={metres} disabled={busy} onChange={e => { setResult(null); setKnownLength(''); setMetres(e.target.value) }} /> metres</span></label>
          {reference && <label className="dxf-field">Real length of the white wall segment
            <input aria-label="Real length of highlighted wall" placeholder="e.g. 4.4m or 12ft" value={knownLength} disabled={busy} onChange={e => { setResult(null); setKnownLength(e.target.value) }} /></label>}
          {sheet.unitsHint === 'unitless' && <p className="dxf-warning">This file has no declared units. Enter the unit conversion or measure the highlighted wall if available.</p>}
          {sheet.warnings.map((w, i) => <p className="dxf-warning" key={i}>{w}</p>)}
          <button className="dxf-build" disabled={busy || !factor || factor <= 0} onClick={build}>{busy ? 'Processing in worker…' : 'Build and review'}</button>
        </>}
        {result && <div className="dxf-result">
          <h3>3. Review the generated graph</h3>
          <p>{countLabel(result.stats.walls, 'wall')} · {countLabel(result.stats.rooms, 'closed room')} · {countLabel(result.stats.openings, 'opening')} · {countLabel(result.flatChoices.length, 'inferred flat')}</p>
          <p className="dxf-source">Source: DXF vectors · scale {result.stats.metresPerSourceUnit} m/unit ({result.stats.sourceUnits})</p>
          {result.review.length > 0 && <div className="dxf-review"><b>Check these ({result.review.length})</b><ul>{result.review.slice(0, 12).map(row => <li key={row.id}>{row.message}</li>)}</ul>{result.review.length > 12 && <p>More review rows will be available in Studio after import.</p>}</div>}
          <button className="dxf-build" disabled={busy} onClick={importWhole}>Import whole floor</button>
          {result.flatChoices.length > 0 && <div className="dxf-flat-picks"><span>Or import one inferred flat:</span>{result.flatChoices.map(name => <button key={name} disabled={busy} onClick={() => importFlat(name)}>{busy && pendingFlat.current === name ? 'Preparing…' : name}</button>)}</div>}
          {result.flatChoices.length === 0 && <p className="dxf-warning">No flat groups were inferred. The whole floor can still be imported and edited.</p>}
        </div>}
        {error && <p className="dxf-error" role="alert">{error}</p>}
      </div>
      <footer className="dxf-foot"><span>ASCII DXF only · max 15 MB · unsupported items stay visible as review rows</span><button disabled={busy} onClick={onClose}>Cancel</button></footer>
    </section>
  </dialog>
}

