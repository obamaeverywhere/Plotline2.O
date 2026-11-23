// Real Studio acceptance: image upload, mouse scale, Auto-trace, screenshot, then Export.
// No injected units, application state, mocked OCR, or benchmark annotations enter the tracer.
// node scripts/trace-browser.mjs <cases.json> <outDir> [key,key]
import { firefox } from 'playwright'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolvePlanFile } from './trace-paths.mjs'
import { sourceHash } from './trace-source.mjs'

const [manifest, out = '.trace/browser', subset] = process.argv.slice(2)
if (!manifest) throw new Error('Supply a cases JSON: { key: { file, scale?: {a,b,len}, pick?: [x,y] } }')
mkdirSync(out, { recursive: true })
const cases = Object.entries(JSON.parse(readFileSync(manifest))).filter(([key]) => !subset || subset.split(',').includes(key))
if (!cases.length) throw new Error('No cases matched the requested keys')
const browser = await firefox.launch({ headless: true })
const resultsFile = join(out, 'results.json')
const rows = process.env.TRACE_RESUME && existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile)).filter((r) => !r.error && r.sourceHash === sourceHash()) : []
try {
  for (const [key, spec] of cases) {
    if (rows.some((r) => r.key === key && !r.error)) continue
    const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('dialog', (dialog) => dialog.accept())
    const started = Date.now()
    const testedSource = sourceHash()
    let sourceChanged = false
    const sourceWatch = setInterval(() => {
      let changed = false
      try { changed = sourceHash() !== testedSource } catch { changed = true }
      if (changed && !sourceChanged) {
        sourceChanged = true
        clearInterval(sourceWatch)
        context.close().catch(() => {})
      }
    }, 2000)
    try {
      await page.goto(`${process.env.TRACE_URL ?? 'http://127.0.0.1:5173'}/studio`)
      await page.locator('input[type=file][accept="image/png,image/jpeg,image/webp"]').setInputFiles(resolvePlanFile(spec.file))
      await page.getByRole('button', { name: 'Auto-trace', exact: true }).waitFor()
      await page.waitForTimeout(400)
      // Fit-to-image transform is derived from the visible canvas size and source image dimensions.
      const dimensions = await page.evaluate(async () => {
        const input = document.querySelector('input[accept="image/png,image/jpeg,image/webp"]')
        const im = new Image()
        im.src = URL.createObjectURL(input.files[0])
        await im.decode()
        const d = { w: im.naturalWidth, h: im.naturalHeight }
        URL.revokeObjectURL(im.src)
        return d
      })
      const canvas = page.locator('.canvas-wrap > canvas')
      const rect = await canvas.boundingBox()
      const zoom = Math.min(rect.width / dimensions.w, rect.height / dimensions.h) * 0.9
      const screen = ([x, y]) => ({ x: rect.x + (rect.width - dimensions.w * zoom) / 2 + x * zoom, y: rect.y + (rect.height - dimensions.h * zoom) / 2 + y * zoom })
      if (spec.scale) {
        await page.getByRole('button', { name: 'S', exact: true }).click()
        for (const p of [spec.scale.a, spec.scale.b]) { const at = screen(p); await page.mouse.click(at.x, at.y) }
        await page.locator('.field input').fill(spec.scale.len)
        await page.locator('.field input').press('Enter')
        await page.locator('.field').waitFor({ state: 'hidden' })
      }
      await page.screenshot({ path: join(out, `${key}-input.png`) })
      await page.getByRole('button', { name: 'Auto-trace', exact: true }).click()
      if (spec.pick) {
        await page.locator('.trace-card').getByText('Point at a flat', { exact: false }).waitFor({ timeout: 600000 })
        const at = screen(spec.pick)
        await page.mouse.move(at.x, at.y)
        await page.waitForTimeout(300)
        await page.mouse.click(at.x, at.y)
      } else await page.getByRole('button', { name: 'Whole floor', exact: true }).click()
      await page.locator('.trace-card').waitFor({ state: 'hidden', timeout: 600000 })
      const body = await page.locator('body').innerText()
      if (!/Traced \d+ walls/.test(body)) throw new Error(`No completed trace: ${body.slice(-2000)}`)
      writeFileSync(join(out, `${key}.txt`), body)
      await page.screenshot({ path: join(out, `${key}-studio.png`) })
      const download = page.waitForEvent('download')
      await page.getByRole('button', { name: 'Export', exact: true }).click()
      const saved = await download
      await saved.saveAs(join(out, `${key}.unit.json`))
      const u = JSON.parse(readFileSync(join(out, `${key}.unit.json`)))
      const row = { key, sourceHash: testedSource, mode: spec.pick ? 'flat' : 'floor', calibration: spec.scale ? 'known' : 'automatic', seconds: (Date.now() - started) / 1000, summary: body.match(/Traced \d+ walls[^\n]+/)?.[0], walls: u.walls.length, openings: u.walls.reduce((n,w) => n+w.openings.length,0), pxPerM: u.planImage?.pxPerM, errors }
      console.log(JSON.stringify(row))
      if (process.env.TRACE_EDIT === key) {
        // Select a visible wall using the image position, change its width in the normal panel, Export and Undo.
        // This happens AFTER the measured export so acceptance scores use the untouched Auto-trace result.
        await page.keyboard.press('0')
        await page.waitForTimeout(250)
        const at = screen(spec.editAt ?? [632, 525])
        await page.mouse.click(at.x, at.y)
        const width = page.locator('.row').filter({ hasText: 'Width (inches)' }).locator('input')
        const old = await width.inputValue({ timeout: 10000 })
        await width.fill('8')
        await width.press('Enter')
        const editDownload = page.waitForEvent('download')
        await page.getByRole('button', { name: 'Export', exact: true }).click()
        await (await editDownload).saveAs(join(out, `${key}-edited.unit.json`))
        const edited = JSON.parse(readFileSync(join(out, `${key}-edited.unit.json`)))
        const changed = edited.walls.filter(w => u.walls.find(x => x.id === w.id)?.thicknessM !== w.thicknessM)
        if (changed.length !== 1 || Math.abs(changed[0].thicknessM - 8*.0254) > 1e-6) throw new Error('Wall width edit did not change exactly one wall')
        await page.screenshot({ path: join(out, `${key}-edited.png`) })
        await page.getByRole('button', { name: 'Undo', exact: true }).click()
        const undoDownload = page.waitForEvent('download')
        await page.getByRole('button', { name: 'Export', exact: true }).click()
        await (await undoDownload).saveAs(join(out, `${key}-undo.unit.json`))
        const undone = JSON.parse(readFileSync(join(out, `${key}-undo.unit.json`)))
        if (JSON.stringify(undone.walls) !== JSON.stringify(u.walls)) throw new Error('Undo did not restore the original walls')
        row.edit = { oldInches: old, changedWalls: changed.length, newInches: 8, undo: true }
      }
      if (process.env.TRACE_PREVIEW === key) {
        const popup = context.waitForEvent('page')
        await page.getByRole('button', { name: 'Preview 3D', exact: true }).click()
        const viewer = await popup
        viewer.on('pageerror', (e) => errors.push(e.message))
        await viewer.waitForLoadState()
        await viewer.getByRole('button', { name: 'Enter', exact: true }).waitFor({ timeout: 120000 })
        await viewer.getByRole('button', { name: 'Enter', exact: true }).click()
        await viewer.getByRole('button', { name: 'Dollhouse', exact: true }).waitFor()
        await viewer.waitForTimeout(3000)
        await viewer.screenshot({ path: join(out, `${key}-walk.png`) })
        // Enter locks the mouse in walk mode; O is the viewer's normal Dollhouse shortcut.
        await viewer.keyboard.press('o')
        await viewer.locator('button.active').filter({ hasText: 'Dollhouse' }).waitFor()
        await viewer.waitForTimeout(2000)
        writeFileSync(join(out, `${key}-3d.txt`), await viewer.locator('body').innerText())
        await viewer.screenshot({ path: join(out, `${key}-3d.png`) })
        row.preview = { entered: true, walk: true, dollhouse: true, canvas: await viewer.locator('canvas').count(), fallback: /3D could not|3D is unavailable|WebGL/.test(await viewer.locator('body').innerText()) }
      }
      if(sourceHash()!==testedSource)throw new Error('Source changed during this workflow; rerun against a stable source tree')
      rows.push(row)
    } catch (e) {
      rows.push({ key, error: sourceChanged ? 'Source changed during this workflow; rerun against a stable source tree' : e.message, seconds: (Date.now() - started) / 1000, errors })
      console.error(key, e.message)
      await page.screenshot({ path: join(out, `${key}-failed.png`) }).catch(() => {})
    } finally {
      clearInterval(sourceWatch)
      writeFileSync(join(out, 'results.json'), JSON.stringify(rows, null, 2))
      await context.close()
    }
  }
} finally { await browser.close() }
if (rows.some((r) => r.error)) process.exitCode = 1
