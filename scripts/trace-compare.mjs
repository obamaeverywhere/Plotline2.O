// Compare the measurements of UI-generated drafts. Missing annotations remain unmeasured, never counted as correct.
// node scripts/trace-compare.mjs <beforeDir> <afterDir> <reportDir>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [beforeDir, afterDir, out = '.trace/comparison'] = process.argv.slice(2)
if (!beforeDir || !afterDir) throw new Error('Supply before and after browser output directories')
mkdirSync(out, { recursive: true })
const read = (dir, file) => existsSync(join(dir, file)) ? JSON.parse(readFileSync(join(dir, file))) : []
const byKey = (rows) => new Map(rows.map(r => [r.key, r]))
const runs = (dir) => {
  const rows = read(dir, 'results.json')
  // An interrupted run can have an error followed by its successful retry; a completed export takes precedence.
  return byKey([...rows.filter(r => r.error), ...rows.filter(r => !r.error)])
}
const before = runs(beforeDir), after = runs(afterDir)
const bm = byKey(read(beforeDir, 'measurements.json')), am = byKey(read(afterDir, 'measurements.json'))
const manifest = JSON.parse(readFileSync('scripts/trace-cases.json'))
const rows = Object.entries(manifest).map(([key, spec]) => ({ key, file: spec.file, calibration: spec.scale ? 'known' : 'automatic', mode: spec.pick ? 'flat' : 'floor', before: before.get(key), after: after.get(key), beforeMetrics: bm.get(key), afterMetrics: am.get(key) }))
writeFileSync(join(out, 'comparison.json'), JSON.stringify(rows, null, 2))
const delta = (a,b) => `${a ?? '—'} → ${b ?? '—'}`
const lines = ['| Case | Walls | Rooms | Named | Openings | Validation issues | Review rows | Seconds |', '|---|---:|---:|---:|---:|---:|---:|---:|']
for (const r of rows) {
  const b = r.before, a = r.after, m = r.beforeMetrics, n = r.afterMetrics
  if (b?.error || a?.error || !b || !a) lines.push(`| ${r.key} | ${b?.error ? 'before failed' : !b ? 'before missing' : ''} ${a?.error ? 'after failed' : !a ? 'after missing' : ''} | — | — | — | — | — | — |`)
  else lines.push(`| ${r.key} | ${delta(b.walls,a.walls)} | ${delta(m?.rooms,n?.rooms)} | ${delta(m?.labelled,n?.labelled)} | ${delta(b.openings,a.openings)} | ${delta(m?.issues.length,n?.issues.length)} | ${delta(m?.review,n?.review)} | ${delta(Math.round(b.seconds),Math.round(a.seconds))} |`)
}
writeFileSync(join(out, 'table.md'), lines.join('\n')+'\n')
console.log(`${rows.length} cases, ${rows.filter(r => r.before && r.after && !r.before.error && !r.after.error).length} paired successful exports; see ${out}/comparison.json`)
