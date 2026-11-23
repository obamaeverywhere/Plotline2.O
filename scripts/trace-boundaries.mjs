// Image-space measurement only: annotations are never imported by the app or supplied to Auto-trace.
// node scripts/trace-boundaries.mjs <ui-export.unit.json> [annotations.json] [output.json]
import { readFileSync, writeFileSync } from 'node:fs'
const [unitFile, annotationFile='scripts/trace-boundaries.json', output] = process.argv.slice(2)
if (!unitFile) throw new Error('Supply a Unit exported through the Studio after Auto-trace')
const u=JSON.parse(readFileSync(unitFile)), a=JSON.parse(readFileSync(annotationFile))
const {pxPerM:k,originPx:o}=u.planImage
const V=new Map(u.vertices.map(v=>[v.id,[o.x+v.x*k,o.y+v.y*k]]))
const lines=u.walls.flatMap(w=>{
  const p=V.get(w.a),q=V.get(w.b),L=Math.hypot(q[0]-p[0],q[1]-p[1])
  if (!L) return []
  const at=t=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]
  return w.openings.filter(x=>x.kind==='window'||x.kind==='slider').map(x=>({a:at(x.offsetM*k/L),b:at((x.offsetM+x.widthM)*k/L)}))
})
const distance=(p,l)=>{
  const dx=l.b[0]-l.a[0],dy=l.b[1]-l.a[1],len=dx*dx+dy*dy
  const t=len ? Math.max(0,Math.min(1,((p[0]-l.a[0])*dx+(p[1]-l.a[1])*dy)/len)) : 0
  return Math.hypot(p[0]-l.a[0]-t*dx,p[1]-l.a[1]-t*dy)
}
const aligned=(p,q)=>{
  const dx=p.b[0]-p.a[0],dy=p.b[1]-p.a[1],ex=q.b[0]-q.a[0],ey=q.b[1]-q.a[1]
  return Math.abs(dx*ex+dy*ey)>=Math.cos(a.angleDeg*Math.PI/180)*Math.hypot(dx,dy)*Math.hypot(ex,ey)
}
const points=l=>{
  const n=Math.max(1,Math.ceil(Math.hypot(l.b[0]-l.a[0],l.b[1]-l.a[1])))
  return Array.from({length:n},(_,i)=>[l.a[0]+(l.b[0]-l.a[0])*(i+.5)/n,l.a[1]+(l.b[1]-l.a[1])*(i+.5)/n])
}
const measured=a.lines.map(l=>{
  const pts=points(l),near=lines.filter(q=>aligned(l,q))
  const found=pts.filter(p=>near.some(q=>distance(p,q)<=a.tolerancePx)).length
  return {name:l.name,samples:pts.length,found,coverage:found/pts.length}
})
let predicted=0,correct=0
for(const l of lines) for(const p of points(l)) {
  if(!a.regions.some(([x0,y0,x1,y1])=>p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1))continue
  predicted++
  if(a.lines.some(q=>aligned(l,q)&&distance(p,q)<=a.tolerancePx))correct++
}
const total=measured.reduce((s,l)=>s+l.samples,0),found=measured.reduce((s,l)=>s+l.found,0)
const result={unitFile,annotationFile,tolerancePx:a.tolerancePx,angleDeg:a.angleDeg,coverage:found/total,precision:predicted ? correct/predicted : null,found,total,predicted,correct,lines:measured}
if(output)writeFileSync(output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
