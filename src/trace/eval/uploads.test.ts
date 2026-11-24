/// <reference types="node" />
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { gzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { PreviewServer } from 'vite'
import type { Browser, Page } from 'playwright'
import { deriveRooms } from '../../core'
import type { Unit } from '../../core'
import type { Review } from '../../studio/review'
import { scoreSolve } from '../solveEval'
import { scoreUnit, type Expected } from './score30'

const cases = [
  { key: 'bti-second', file: 'plan-2nd-floor.webp', references: ['type-a'] },
  { key: 'bti-third', file: 'plan-3rd-floor.webp', references: ['type-b', 'type-c'] },
  { key: 'sheltech-level-2', file: 'plan-sheltech-l2.jpg', references: ['sheltech-a', 'sheltech-b'] },
]

function compare(unit: Unit, review: Review, truth: Unit) {
  const image = truth.planImage!
  const expected: Expected[] = truth.roomLabels.map(label => ({
    // Hand tracers append locations such as "AOD (bath-3)"; only the room name belongs to the OCR comparison.
    name: label.name.replace(/\s+\([^()]+\)$/, ''),
    at: [image.originPx.x + label.x * image.pxPerM, image.originPx.y + label.y * image.pxPerM],
  }))
  const { rooms } = scoreUnit(unit, review.stats, expected)
  const geometry = scoreSolve({ unit, stats: review.stats, review: review.items }, truth)
  return {
    reference: truth.id, labelsChecked: rooms.length, closedAndNamed: rooms.filter(r => r.state === 'right').length,
    referenceRooms: geometry.truthRooms, matchedAtIoU06: geometry.matched, scaleErrorPercent: geometry.scaleErr * 100,
    labels: rooms.map(({ name, state, got }, index) => ({ referenceLabel: truth.roomLabels[index].name, name, state, got })),
  }
}

async function exportUnit(page: Page) {
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const path = await (await download).path()
  if (!path) throw new Error('Studio export failed')
  return JSON.parse(await readFile(path, 'utf8'))
}

async function checkDxfProfiles(browser: Browser, url: string) {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    page.on('dialog', dialog => dialog.accept())
    const source = (await readFile('src/data/fixtures/two-room-floor.dxf', 'utf8')).replaceAll('A-WALL', 'GEOM')
    const picker = page.locator('input[accept^=".json"]')
    const upload = (name: string, content: string) => picker.setInputFiles({ name, mimeType: 'application/dxf', buffer: Buffer.from(content) })
    await upload('first-floor.dxf', source)
    await page.getByLabel('Role for layer GEOM', { exact: true }).selectOption('walls')
    await page.getByRole('button', { name: 'Build and review' }).click()
    await page.getByRole('button', { name: 'Import whole floor' }).click()
    await page.locator('.dxf-dialog').waitFor({ state: 'hidden' })
    // The later floor adds one furniture layer. Upload it without touching the mapping dialog.
    const extra = [0, 'LINE', 8, 'A-FURN', 10, 1200, 20, 1400, 11, 1700, 21, 1400].join('\n')
    const later = source.replace(/0\s+ENDSEC\s+0\s+EOF\s*$/, extra + '\n0\nENDSEC\n0\nEOF\n')
    await upload('next-floor.dxf', later)
    await page.getByText(/next-floor\.dxf · 0\.001 m per DXF unit/).waitFor()
    const unit: Unit = await exportUnit(page)
    const rooms = deriveRooms(unit).map(room => room.name).sort()
    const openings = unit.walls.flatMap(w => w.openings.map(o => o.kind)).sort()
    expect(unit.name).toBe('next-floor')
    expect(unit.walls).toHaveLength(7)
    expect(rooms.map(name => name.toUpperCase())).toEqual(['BEDROOM', 'LIVING ROOM'])
    expect(openings).toEqual(['door', 'window'])
    return { synthetic: true, walls: unit.walls.length, rooms, openings, reusedMapping: true }
  } finally { await page.close() }
}

describe.skipIf(process.env.npm_lifecycle_event !== 'bench:uploads')('production Studio uploads', () => {
  const out = '.trace/upload-benchmark'
  let server: PreviewServer
  let browser: Browser
  let url: string
  beforeAll(async () => {
    const { preview } = await import('vite')
    const { firefox } = await import('playwright')
    await mkdir(out, { recursive: true })
    server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false }, logLevel: 'error' })
    const address = server.httpServer.address()
    if (!address || typeof address === 'string') throw new Error('Missing local preview address')
    url = `http://127.0.0.1:${address.port}/studio`
    browser = await firefox.launch()
  })
  afterAll(async () => {
    try { await browser?.close() } finally { await server?.close() }
  })

  test('DXF keeps confirmed roles when another floor adds furniture', async () => {
    const result = await checkDxfProfiles(browser, url)
    await writeFile(join(out, 'dxf.json'), JSON.stringify(result, null, 2))
  }, 90000)

  test('score uncalibrated raster uploads against hand-drawn flats', async () => {
    const reports = []
    for (const spec of cases) {
      const context = await browser.newContext({ viewport: { width: 1500, height: 900 } })
      try {
        // Use the installed OCR worker/core and checked-in English model in each fresh browser.
        await context.route('https://cdn.jsdelivr.net/**', async route => {
          const url = new URL(route.request().url())
          const file = basename(url.pathname)
          const headers = { 'access-control-allow-origin': '*' }
          if (file === 'eng.traineddata.gz') {
            return route.fulfill({ headers, body: gzipSync(await readFile('eng.traineddata')), contentType: 'application/octet-stream' })
          }
          if (file === 'worker.min.js' || /^tesseract-core[-.][\w.-]+$/.test(file)) {
            const path = file === 'worker.min.js' ? 'node_modules/tesseract.js/dist' : 'node_modules/tesseract.js-core'
            return route.fulfill({ headers, path: join(path, file), contentType: file.endsWith('.wasm') ? 'application/wasm' : 'application/javascript' })
          }
          return route.abort()
        })
        const page = await context.newPage()
        const errors: string[] = []
        page.on('pageerror', e => errors.push(e.message))
        page.on('dialog', dialog => dialog.accept())
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const chooser = page.waitForEvent('filechooser')
        await page.getByRole('button', { name: 'Upload design', exact: true }).click()
        const picker = await chooser
        const start = performance.now()
        await picker.setFiles(join('public/assets', spec.file))
        const card = page.locator('.trace-card')
        await card.waitFor()
        await card.waitFor({ state: 'hidden', timeout: 300000 })
        const seconds = (performance.now() - start) / 1000
        const unit: Unit & { review?: Review } = await exportUnit(page)
        if (errors.length) throw new Error(errors.join('\n'))
        if (!unit.review || unit.planImage?.src !== spec.file || !unit.walls.length) throw new Error('Upload did not create a raster draft')
        if (unit.review.items.some(item => item.message.includes('Could not read the printed text'))) throw new Error('OCR failed during upload')
        const references = []
        for (const id of spec.references) {
          const truth: Unit = JSON.parse(await readFile(`src/data/units/${id}.json`, 'utf8'))
          if (truth.planImage?.src !== `/assets/${spec.file}`) throw new Error(`Reference image mismatch for ${id}`)
          references.push(compare(unit, unit.review, truth))
        }
        const summary = { sheet: spec.key, seconds, reviewRows: unit.review.items.length, scaleFrom: unit.review.stats.scaleFrom, references }
        reports.push(summary)
        console.log(spec.key, references.map(r => `${r.closedAndNamed}/${r.labelsChecked} labels, ${r.matchedAtIoU06}/${r.referenceRooms} rooms`).join(' | '))
      } catch (error) {
        reports.push({ sheet: spec.key, error: String(error) })
      } finally {
        await context.close()
      }
    }
    await writeFile(join(out, 'results.json'), JSON.stringify({ requested: cases.map(s => s.key), results: reports }, null, 2))
    expect(reports.filter(r => 'error' in r)).toEqual([])
    expect(reports).toHaveLength(cases.length)
  }, 20 * 60_000)
})
