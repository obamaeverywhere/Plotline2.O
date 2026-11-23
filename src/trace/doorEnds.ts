/** Double-action doors swing through a half circle about a structural wall tip. A fixture's closed ring is different. */
import type { OpeningGuess, Px, WallTrace } from './types'

const dist=(a:Px,b:Px)=>Math.hypot(a.x-b.x,a.y-b.y)
const onSegment=(p:Px,a:Px,b:Px)=>{
  const dx=b.x-a.x,dy=b.y-a.y,L=dx*dx+dy*dy
  const t=L?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/L)):0
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)
}

export function endDoors(trace:WallTrace,k:number,ink:[(x:number,y:number)=>boolean,(x:number,y:number)=>boolean]):OpeningGuess[]{
  const found:OpeningGuess[]=[]
  const near=(at:typeof ink[number],x:number,y:number)=>[-1,0,1].some(dx=>[-1,0,1].some(dy=>at(x+dx,y+dy)))
  const structural=trace.walls.filter(w=>w.heightM===undefined||w.heightM>=2)
  const ends=structural.flatMap(w=>[{p:w.a,q:w.b,w},{p:w.b,q:w.a,w}])
  for(const h of ends){
    const length=dist(h.p,h.q)
    if(length<.6*k)continue
    const ux=(h.q.x-h.p.x)/length,uy=(h.q.y-h.p.y)/length,vx=-uy,vy=ux
    for(const j of ends){
      if(j.w===h.w||dist(j.p,j.q)<.3*k)continue
      const along=(j.p.x-h.p.x)*ux+(j.p.y-h.p.y)*uy,across=(j.p.x-h.p.x)*vx+(j.p.y-h.p.y)*vy,R0=Math.abs(across)
      if(R0<.6*k||R0>1.6*k||Math.abs(along)>Math.max(h.w.thicknessPx,j.w.thicknessPx)+2)continue
      if(trace.openings.some(o=>o.kind!=='unknown'&&onSegment(j.p,o.a,o.b)<3&&onSegment(h.p,o.a,o.b)<3))continue
      const mid={x:(j.p.x+h.p.x)/2,y:(j.p.y+h.p.y)/2}
      if(structural.some(w=>onSegment(mid,w.a,w.b)<w.thicknessPx/2))continue
      let best:{hp:Px;score:number}|null=null
      for(let shift=0;shift<=h.w.thicknessPx/2+2;shift+=1){
        const hp={x:h.p.x+ux*shift,y:h.p.y+uy*shift}
        for(const factor of [.9,.95,1,1.05,1.1]){
          const r=R0*factor,d=Math.max(1,.03*r),D=Math.max(3,.15*r)
          const sweep=(at:typeof ink[number],radius:number,side=1,halo=false)=>{
            let a=0,b=0
            for(let i=0;i<18;i++){
              const angle=(-.9+1.8*i/17)*Math.PI/2,c=Math.cos(angle),s=Math.sin(angle)
              const hit=halo?[-d,0,d].some(dr=>near(at,hp.x+(side*ux*c+vx*s)*(radius+dr),hp.y+(side*uy*c+vy*s)*(radius+dr))):at(hp.x+(side*ux*c+vx*s)*radius,hp.y+(side*uy*c+vy*s)*radius)
              if(hit)(i<9?a++:b++)
            }
            return {a:a/9,b:b/9}
          }
          const weak=sweep(ink[1],r,1,true)
          if(Math.min(weak.a,weak.b)<2/3||Math.max(weak.a,weak.b)<8/9)continue
          const strong=sweep(ink[0],r,1,true)
          if(Math.min(strong.a,strong.b)<.44||Math.max(strong.a,strong.b)<.75)continue
          const inner=sweep(ink[1],r*.5)
          let back=0
          for(let off=-Math.ceil(h.w.thicknessPx+3);off<=h.w.thicknessPx+3;off++){const b=sweep(ink[1],r+off,-1,true);back=Math.max(back,Math.min(b.a,b.b))}
          if(Math.max(inner.a,inner.b)>.35||back>2/3)continue
          const inside=sweep(ink[1],r-D,1,true),outside=sweep(ink[1],r+D,1,true)
          if(Math.max(inside.a,inside.b,outside.a,outside.b)>.55)continue
          const score=Math.min(strong.a,strong.b,weak.a,weak.b)
          if(!best||score>best.score)best={hp,score}
        }
      }
      if(!best)continue
      const a=j.p,b=best.hp
      if(found.some(o=>(dist(o.a,a)<4&&dist(o.b,b)<4)||(dist(o.a,b)<4&&dist(o.b,a)<4)))continue
      found.push({a,b,kind:'door',conf:best.score,thicknessPx:h.w.thicknessPx,hingeAt:b,swingTo:{x:b.x+ux*R0,y:b.y+uy*R0}})
    }
  }
  return found
}
