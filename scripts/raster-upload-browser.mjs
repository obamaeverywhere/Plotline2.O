// Run against a production preview to check automatic floor upload, measured retrace and undo.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { firefox } from 'playwright'

const browser = await firefox.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('dialog', dialog => dialog.accept())
  await page.goto(`${process.env.TRACE_URL ?? 'http://127.0.0.1:5173'}/studio`)

  // Two rooms with thick walls and no printed measurements force an estimated first scale.
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 600, 400)
    ctx.lineWidth = 8
    ctx.strokeRect(80, 80, 440, 240)
    ctx.beginPath()
    ctx.moveTo(300, 80)
    ctx.lineTo(300, 320)
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.font = '18px sans-serif'
    ctx.fillText('BEDROOM', 140, 200)
    ctx.fillText('KITCHEN', 365, 200)
    return canvas.toDataURL().split(',')[1]
  })
  async function exportUnit() {
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export', exact: true }).click()
    return JSON.parse(await readFile(await (await download).path(), 'utf8'))
  }
  async function awaitTrace() {
    const card = page.locator('.trace-card')
    await card.waitFor()
    await card.waitFor({ state: 'hidden', timeout: 180000 })
  }

  const picker = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Upload design', exact: true }).click()
  await (await picker).setFiles({ name: 'calibration.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await awaitTrace()
  const first = await exportUnit()
  assert.ok(first.walls.length > 0)
  assert.equal(first.planImage.src, 'calibration.png')
  assert.equal(first.name, 'calibration')

  // Fit to the 600 x 400 source. The top wall spans 440 source pixels.
  await page.keyboard.press('0')
  await page.getByRole('button', { name: 'Calibrate and retrace floor' }).click()
  const rect = await page.locator('.canvas-wrap > canvas').boundingBox()
  const zoom = Math.min(rect.width / 600, rect.height / 400) * 0.9
  for (const x of [80, 520]) {
    await page.mouse.click(rect.x + (rect.width - 600 * zoom) / 2 + x * zoom, rect.y + (rect.height - 400 * zoom) / 2 + 80 * zoom)
  }
  const length = page.locator('.field input').first()
  await length.fill('8m')
  await length.press('Enter')
  await awaitTrace()
  const measured = await exportUnit()
  assert.equal(measured.name, first.name)
  assert.equal(measured.planImage.src, first.planImage.src)
  assert.ok(Math.abs(measured.planImage.pxPerM - 55) < 0.3, `440 px / 8 m should give 55 px/m, got ${measured.planImage.pxPerM}`)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  const undone = await exportUnit()
  assert.equal(undone.planImage.pxPerM, first.planImage.pxPerM)
  assert.deepEqual(undone.walls, first.walls)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  assert.deepEqual((await exportUnit()).walls, measured.walls)
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ firstWalls: first.walls.length, measuredWalls: measured.walls.length, pxPerM: measured.planImage.pxPerM, undo: true, redo: true }))
} finally {
  await browser.close()
}
