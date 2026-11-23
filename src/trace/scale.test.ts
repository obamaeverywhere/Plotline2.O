import { describe, expect, it } from 'vitest'
import { dimensionConsensus } from './scale'

describe('scale from dimensions inside closed faces', () => {
  const estimate = (rooms: Record<string, number[]>) => dimensionConsensus(new Map(Object.entries(rooms)), 0.05)

  it('needs dimensions from separate rooms', () => {
    expect(estimate({ living: [0.8, 0.8, 0.81, 0.79] })).toBeNull()
  })

  it('gives a room with repeated dimensions the same weight as other rooms', () => {
    expect(estimate({ living: [0.8, 0.8, 0.8], bed: [1.01], bath: [0.99] })).toBeCloseTo(1)
  })

  it('skips a confused room and uses the agreeing independent rooms', () => {
    expect(estimate({ living: [0.7, 1.3], bed: [0.98], bath: [1.02], store: [NaN, Infinity, -1] })).toBeCloseTo(1)
  })

  it('falls back when two equally supported scales disagree', () => {
    expect(estimate({ roomA: [0.8], roomB: [0.81], roomC: [1.2], roomD: [1.21] })).toBeNull()
  })
})
