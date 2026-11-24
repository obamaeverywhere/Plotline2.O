// Real Studio DXF acceptance: import a supplied ASCII DXF, map layers/scale, build, review, import, and export.
// node scripts/dxf-browser.mjs <real-plan.dxf> <metres-per-source-unit> [output-dir]
// Optional DXF_LAYER_ROLES='{"A-WALL":"walls","A-ROOM":"text"}' overrides layer guesses.
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { firefox } from 'playwright'

const [fileArg, scaleArg, outputArg = '.trace/dxf-acceptance'] = process.argv.slice(2)
if (!fileArg || !scaleArg) throw new Error('Supply a real DXF path and metres-per-source-unit value.')
const file = resolve(fileArg)
const scale = Number(scaleArg)
assert.ok(Number.isFinite(scale) && scale > 0, 'Scale must be a positive metres-per-source-unit value.')
const out = resolve(outputArg)
mkdirSync(out, { recursive: true })
const roles = JSON.parse(process.env.DXF_LAYER_ROLES ?? '{}')
const browser = await firefox.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('dialog', dialog => dialog.accept())
try {
  await page.goto(`${process.env.DXF_URL ?? 'http://127.0.0.1:5173'}/studio`)
  await page.getByRole('button', { name: 'Import DXF', exact: true }).click()
  await page.getByRole('checkbox', { name: /Automatically import/ }).uncheck()
  await page.locator('input[type=file][accept=".dxf,application/dxf"]').setInputFiles(file)
  await page.getByRole('button', { name: 'Build and review', exact: true }).waitFor({ timeout: 120000 })
  for (const [layer, role] of Object.entries(roles)) {
    await page.getByLabel(`Role for layer ${layer}`, { exact: true }).selectOption(role)
  }
  await page.locator('.dxf-field input[type=number]').fill(String(scale))
  await page.screenshot({ path: join(out, 'mapped-preview.png') })
  await page.getByRole('button', { name: 'Build and review', exact: true }).click()
  await page.getByRole('heading', { name: '3. Review the generated graph' }).waitFor({ timeout: 120000 })
  const reviewText = await page.locator('.dxf-result').innerText()
  writeFileSync(join(out, 'review.txt'), reviewText)
  await page.screenshot({ path: join(out, 'review.png') })
  await page.getByRole('button', { name: 'Import whole floor', exact: true }).click()
  await page.locator('.dxf-dialog').waitFor({ state: 'hidden' })
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const download = await downloadPromise
  const unitPath = join(out, 'imported.unit.json')
  await download.saveAs(unitPath)
  const unit = JSON.parse(readFileSync(unitPath, 'utf8'))
  assert.ok(Array.isArray(unit.vertices) && Array.isArray(unit.walls) && Array.isArray(unit.roomLabels), 'Export is not a Plotline Unit.')
  assert.ok(unit.walls.length > 0, 'DXF import produced no walls.')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  const undoDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const undoDownload = await undoDownloadPromise
  const undoPath = join(out, 'undo.unit.json')
  await undoDownload.saveAs(undoPath)
  const undone = JSON.parse(readFileSync(undoPath, 'utf8'))
  assert.equal(undone.walls.length, 0, 'Undo did not restore the pre-import empty Unit.')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  const redoDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const redoDownload = await redoDownloadPromise
  const redoPath = join(out, 'redo.unit.json')
  await redoDownload.saveAs(redoPath)
  const redone = JSON.parse(readFileSync(redoPath, 'utf8'))
  assert.deepEqual(redone.walls, unit.walls, 'Redo did not restore the imported walls.')
  assert.deepEqual(redone.vertices, unit.vertices, 'Redo did not restore the imported vertices.')
  assert.deepEqual(errors, [], `Browser page errors: ${errors.join('; ')}`)
  const report = { source: file, scale, roles, vertices: unit.vertices.length, walls: unit.walls.length, roomLabels: unit.roomLabels.length, openings: unit.walls.reduce((n, w) => n + w.openings.length, 0), undo: undone.walls.length === 0, redo: redone.walls.length === unit.walls.length, review: reviewText, pageErrors: errors }
  writeFileSync(join(out, 'acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, review: undefined }))
} finally {
  await context.close()
  await browser.close()
}
