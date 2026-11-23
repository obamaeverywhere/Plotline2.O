import { describe, expect, test } from 'vitest'
import { traceWalls } from './walls'
import type { Gray } from './types'
import { loadPgm } from './evalio'
import { fileURLToPath } from 'node:url'

function stepped(k: number, ink: number) {
  const width = Math.round(10*k), height = Math.round(7*k)
  const g: Gray = {width,height,data:new Uint8Array(width*height).fill(245)}
  const box = (x0:number,y0:number,x1:number,y1:number,value=ink) => {
    for(let y=Math.round(y0*k);y<Math.round(y1*k);y++) for(let x=Math.round(x0*k);x<Math.round(x1*k);x++)g.data[y*width+x]=value
  }
  // Offset walls around a shaft: a short thick riser continuing into a thinner nib. Long runs establish both classes.
  box(4,1,8,1.34)
  box(1,1.71,4.34,2.05)
  box(4,1,4.34,2.05)
  box(4.14,2.05,4.27,2.75)
  box(1,4,8,4.13)
  box(1,5,8,5.34)
  return {g,box}
}

describe('contrast through wall thickness changes', () => {
  test('the real lift dogleg retains its short riser despite a thinner continuation', () => {
    // Firefox-decoded crop of Demo drawings/Sheltech/Level 2.jpg, x355..515, y330..475. Annotation read from the image:
    // the wall at x434..444 joins y404 to y423, then continues as a thin jamb. It must not join the lift to the toilet.
    const g = loadPgm(fileURLToPath(new URL('../data/fixtures/stepped-junction.pgm', import.meta.url)))!
    const result = traceWalls(g, { tracker: 'tracks', halfPx: .127*27.075658723705732/2 })
    const riser = result.walls.filter(w => Math.abs(w.a.x-w.b.x)<2 && w.a.x>79 && w.a.x<90 && Math.min(w.a.y,w.b.y)<80 && Math.max(w.a.y,w.b.y)>93)
    expect(riser.length).toBe(1)
  })
  test.each([27,50,80])('retains the ink-backed short riser at %i pixels/m', (k) => {
    const {g}=stepped(k,10)
    const result=traceWalls(g,{tracker:'tracks',halfPx:.127*k/2})
    const riser=result.walls.filter(w=>Math.abs(w.a.x-w.b.x)<k*.04 && Math.abs(w.a.x/k-4.17)<.09 && Math.min(w.a.y,w.b.y)/k<1.5 && Math.max(w.a.y,w.b.y)/k>1.7)
    expect(riser.length).toBe(1)
    // Its centre stays on the drawn band; there is no diagonal shortcut across the dogleg.
    expect(riser[0].a.x/k).toBeGreaterThan(4)
    expect(riser[0].a.x/k).toBeLessThan(4.34)
  })
  test('low-contrast fill stays rejected, rather than accepting every wider stroke', () => {
    const {g}=stepped(50,220)
    const result=traceWalls(g,{tracker:'tracks',halfPx:.127*50/2,darkMax:230})
    expect(result.walls).toEqual([])
  })
  test('a paper gap in a stepped wall is not filled by the contrast check', () => {
    const k=50, {g,box}=stepped(k,10)
    box(4,1.4,4.34,1.85,245)
    const result=traceWalls(g,{tracker:'tracks',halfPx:.127*k/2})
    expect(result.walls.some(w=>Math.abs(w.a.x/k-4.17)<.09 && Math.abs(w.b.x/k-4.17)<.09 && Math.min(w.a.y,w.b.y)/k<1.4 && Math.max(w.a.y,w.b.y)/k>1.85)).toBe(false)
  })
})
