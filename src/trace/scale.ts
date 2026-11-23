/** The printed length divided by the length drawn at the provisional scale, grouped by closed face. */
export function dimensionConsensus(factorsByRoom: ReadonlyMap<string, readonly number[]>, tolerance: number): number | null {
  const votes: number[] = []
  for (const factors of factorsByRoom.values()) {
    const usable = factors.filter(factor => Number.isFinite(factor) && factor > 0).sort((a, b) => a - b)
    if (!usable.length) continue
    const median = usable[usable.length >> 1]
    // A repeated note is one vote. Conflicting dimensions in the same face are ambiguous.
    if (usable.every(factor => Math.abs(factor / median - 1) <= tolerance)) votes.push(median)
  }
  votes.sort((a, b) => a - b)
  if (votes.length < 2) return null
  const median = votes[votes.length >> 1]
  const agreeing = votes.filter(factor => Math.abs(factor / median - 1) <= tolerance)
  if (agreeing.length < 2 || agreeing.length * 2 <= votes.length) return null
  return agreeing.reduce((sum, factor) => sum + factor, 0) / agreeing.length
}
