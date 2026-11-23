import { beforeEach, expect, test, vi } from 'vitest'
import type { Gray, TextItem } from './types'
import { normaliseName, readInFaces } from './text'
import { capacityCores, prepare, solveTraces } from './solve'
import { deriveRooms } from '../core'

const control = vi.hoisted(() => ({ replies: [] as string[], late: null as TextItem[] | null }))
vi.mock('tesseract.js', () => ({
  OEM: { LSTM_ONLY: 1 }, PSM: { SINGLE_BLOCK: 6, SPARSE_TEXT: 11, SINGLE_LINE: 7, SINGLE_WORD: 8 },
  createWorker: async () => ({ setParameters: async () => {} }),
  createScheduler: () => ({ addWorker: () => {}, terminate: async () => {}, addJob: async () => ({ data: { text: control.replies.shift() ?? '', confidence: 95 } }) }),
}))
vi.mock('./text', async (original) => {
  const actual = await original<typeof import('./text')>()
  return { ...actual, readTypes: async () => [], readInFaces: (...args: Parameters<typeof actual.readInFaces>) => control.late ? Promise.resolve(control.late) : actual.readInFaces(...args) }
})
beforeEach(() => { control.replies = []; control.late = null })

const polygon = [{x:20,y:20},{x:100,y:20},{x:100,y:100},{x:20,y:100}]
const blank = (): Gray => ({width:300,height:220,data:new Uint8Array(300*220).fill(255)})
const strip = { box: {x:40,y:50,w:40,h:12}, angle:0 as const, reason:'name-unread' as const }

test('a bounded shaft label can be recovered in mixed case, with two agreeing strip readings', async () => {
  control.replies = ['', '', 'Hostway', 'Hoistway', 'Hoistway']
  const out = await readInFaces(blank(), [polygon], {items:[],glyphPx:8,rejected:[strip]}, 30)
  expect(out).toHaveLength(1)
  expect(normaliseName(out[0].text)).toBe('HOISTWAY')
  expect(out[0]).toMatchObject({kind:'room',roomKind:'other'})
})
test('one uncertain core reading cannot claim a shared space', async () => {
  control.replies = ['', '', 'Hoistway', 'noise', 'noise']
  expect(await readInFaces(blank(), [polygon], {items:[],glyphPx:8,rejected:[strip]}, 30)).toEqual([])
})
test('a rejected core label outside the face cannot name that face', async () => {
  control.replies = ['', '', 'Hoistway', 'Hoistway', 'Hoistway']
  const other = {...strip,box:{...strip.box,x:120}}
  expect(await readInFaces(blank(), [polygon], {items:[],glyphPx:8,rejected:[other]}, 30)).toEqual([])
})
test('late shared-space labels refresh ownership without retracing walls or crossing the bedroom partition', async () => {
  const gray = blank(), K=30, offset=20
  const wall = (x0:number,y0:number,x1:number,y1:number) => {
    for(let y=offset+y0*K-2;y<=offset+y1*K+2;y++) for(let x=offset+x0*K-2;x<=offset+x1*K+2;x++) gray.data[y*gray.width+x]=0
  }
  wall(0,0,8,0);wall(0,4,8,4);wall(0,0,0,4);wall(8,0,8,4);wall(5,0,5,4)
  const item = (text:string,x:number,y:number,roomKind:TextItem['roomKind']):TextItem => ({text,kind:'room',roomKind,box:{x:offset+x*K-8,y:offset+y*K-4,w:16,h:8},conf:.9,source:'ocr'})
  control.late=[]
  const before=await prepare(gray,{pxPerM:K,text:{items:[item('BEDROOM',2,2,'bed')]}})
  // This is the label recovered by the late face pass, not part of the initial reading.
  control.late=[item('Hoistway',5.5,2,'other')]
  const p=await prepare(gray,{pxPerM:K,text:{items:[item('BEDROOM',2,2,'bed')]}})
  expect(p.traces.inCore({x:(offset+5.5*K)/K,y:(offset+2*K)/K})).toBe(true)
  expect(p.traces.inCore({x:(offset+4.8*K)/K,y:(offset+2*K)/K})).toBe(false)
  const shape=(t:typeof p.traces)=>{
    const V=new Map(t.draft.unit.vertices.map(v=>[v.id,v]))
    return t.draft.walls.map(w=>JSON.stringify({ends:[V.get(w.a),V.get(w.b)].map(v=>[v!.x,v!.y]).sort(),th:w.thicknessM,height:w.heightM,openings:w.openings.map(o=>[o.kind,o.offsetM,o.widthM])})).sort()
  }
  expect(shape(p.traces)).toEqual(shape(before.traces))
})

test.each([0,Math.PI/5])('capacity alone is insufficient: paired dimensioned enclosures with no residential names provide shared-space evidence (%s)', (angle) => {
  const turn=(x:number,y:number)=>({x:5+x*Math.cos(angle)-y*Math.sin(angle),y:5+x*Math.sin(angle)+y*Math.cos(angle)})
  const vertices=[[0,0],[2,0],[4,0],[0,2],[2,2],[4,2]].map(([x,y],i)=>({id:`v${i}`,...turn(x,y)}))
  const walls=[[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]].map(([a,b],i)=>({id:`w${i}`,a:`v${a}`,b:`v${b}`,heightM:3,thicknessM:.127,openings:[]}))
  const unit={vertices,walls,roomLabels:[]},rooms=deriveRooms(unit)
  const item=(x:number,text:string,dims?:{aM:number;bM:number}):TextItem=>{
    const p=turn(x,1)
    return {kind:dims?'dims':'other',text,box:{x:p.x*30-4,y:p.y*30-3,w:8,h:6},dims,source:'ocr',conf:.9}
  }
  const items=[item(1,'8 persons'),item(3,'8 persons'),item(1,'size',{aM:1.9,bM:1.9}),item(3,'size',{aM:1.9,bM:1.9})]
  expect(capacityCores(unit,rooms,{items},30)).toHaveLength(2)
  expect(capacityCores(unit,rooms,{items:items.slice(0,2)},30)).toEqual([])
  expect(capacityCores(unit,rooms,{items:items.filter(it=>it!==items[1])},30)).toEqual([])
  expect(capacityCores(unit,rooms,{items:[...items,{...item(1,'BEDROOM'),kind:'room',roomKind:'bed'}]},30)).toEqual([])
})

test('a sized open-kitchen work area does not rename the shared living space',()=>{
  const K=30,P=(x:number,y:number)=>({x:20+x*K,y:20+y*K})
  const points=[P(0,0),P(8,0),P(8,4),P(0,4)]
  const walls=points.map((a,i)=>({a,b:points[(i+1)%4],thicknessPx:6,conf:1}))
  const gray=blank()
  for(const w of walls)for(let y=Math.round(Math.min(w.a.y,w.b.y)-3);y<=Math.max(w.a.y,w.b.y)+3;y++)for(let x=Math.round(Math.min(w.a.x,w.b.x)-3);x<=Math.max(w.a.x,w.b.x)+3;x++)gray.data[y*gray.width+x]=0
  const living:TextItem={text:'LIVING',kind:'room',roomKind:'living',box:{...P(5,2),w:12,h:8},conf:.9,source:'ocr'}
  const kitchen:TextItem={...living,text:'OPEN KITCHEN',roomKind:'kitchen',box:{...P(2,2),w:12,h:8},dims:{aM:3,bM:1.2}}
  const run=(text:string)=>solveTraces(gray,{walls:{walls,openings:[]},text:{items:[living,{...kitchen,text}]}},{pxPerM:K}).unit.roomLabels.filter(l=>l.kind!=='other').map(l=>l.name)
  expect(run('OPEN KITCHEN')).toContain('Living')
  expect(run('KITCHEN')).toContain('Kitchen')
})
