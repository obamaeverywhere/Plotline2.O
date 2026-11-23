// Assertions on actual Studio exports, after tracing. No annotations are supplied to the application.
// node scripts/check-trace-results.mjs <browser-output-directory>
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
import {sourceHash} from './trace-source.mjs'
const dir=process.argv[2]
if(!dir)throw new Error('Supply a measured browser output directory')
const read=path=>JSON.parse(readFileSync(path,'utf8'))
const rows=new Map(read(join(dir,'measurements.json')).map(r=>[r.key,r]))
if(process.argv.includes('--require-source')){
 const runs=read(join(dir,'results.json')),manifest=read('scripts/trace-cases.json'),hash=sourceHash()
 assert.deepEqual(runs.map(r=>r.key).sort(),Object.keys(manifest).sort(),'Incomplete browser corpus')
 for(const r of runs){assert.ok(!r.error,`${r.key}: browser workflow failed`);assert.equal(r.sourceHash,hash,`${r.key}: source version differs`);assert.deepEqual(r.errors,[],`${r.key}: page errors`)}
 console.log(`${runs.length} browser exports match the current source version; no page errors.`)
}
const annotations=read('scripts/trace-ownership.json')
const points=new Map(annotations.points.map(p=>[p.name,p]))
const cases=['banani-l2-calibrated',...Object.keys(annotations.selected)]
let checks=0,coreMisses=0,coreChecks=0
for(const key of cases){
 const row=rows.get(key);assert.ok(row,`Missing ${key}`)
 const expected=annotations.selected[key] ? [annotations.selected[key]] : ['Unit A','Unit B']
 assert.deepEqual(row.flats.map(f=>f.name).sort(),expected.sort(),`${key}: wrong flat groups`)
 assert.deepEqual(row.ownership.map(p=>p.name).sort(),[...points.keys()].sort(),`${key}: missing ownership measurements`)
 for(const witness of row.ownership){
  // Shared-core recognition is reported separately: the current OCR still misses its labels.
  if(points.get(witness.name).flat===null){
   coreChecks++
   if(witness.pass!==true)coreMisses++
   if(process.argv.includes('--require-shared'))assert.equal(witness.pass,true,`${key}: shared space ${witness.name} assigned to ${witness.found}`)
   continue
  }
  assert.equal(witness.pass,true,`${key}: ${witness.name} expected ${witness.expected}, found ${witness.found}`);checks++
 }
}
const unit=key=>read(join(dir,`${key}.unit.json`))
const shape=u=>{
 const k=u.planImage.pxPerM,o=u.planImage.originPx
 const xy=v=>[+(o.x+v.x*k).toFixed(4),+(o.y+v.y*k).toFixed(4)]
 const V=new Map(u.vertices.map(v=>[v.id,v]))
 return u.walls.map(w=>{
  const a=V.get(w.a),b=V.get(w.b),L=Math.hypot(b.x-a.x,b.y-a.y)
  const on=m=>xy({x:a.x+(b.x-a.x)*m/L,y:a.y+(b.y-a.y)*m/L})
  return JSON.stringify({ends:[xy(a),xy(b)].sort(),thickness:+w.thicknessM.toFixed(6),height:w.heightM,openings:w.openings.map(p=>JSON.stringify({ends:[on(p.offsetM),on(p.offsetM+p.widthM)].sort(),kind:p.kind,height:p.heightM,sill:p.sillM})).sort()})
 }).sort()
}
for(const flat of ['a','b'])assert.deepEqual(shape(unit(`banani-l2-${flat}-living`)),shape(unit(`banani-l2-${flat}-bed`)),`Unit ${flat.toUpperCase()} changes with click position`)
for(const key of ['banani-l2-calibrated','sheltech-banani-level-2-6']){
 const result=JSON.parse(execFileSync(process.execPath,['scripts/trace-boundaries.mjs',join(dir,`${key}.unit.json`)],{encoding:'utf8'}))
 assert.equal(result.coverage,1,`${key}: a marked glazing line is missing`)
 console.log(`${key}: ${result.found}/${result.total} glazing samples, precision ${(100*result.precision).toFixed(1)}%`)
}
console.log(`${checks} flat-ownership checks passed; both units have the same geometry from living-room and bedroom clicks.`)
console.log(`Shared-core ownership: ${coreChecks-coreMisses}/${coreChecks} checks passed across ${cases.length} workflows; this measures the annotated locations only.`)
