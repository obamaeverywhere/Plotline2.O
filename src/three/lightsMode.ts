/** Automatic lighting switches on when the sun is below five degrees. */
export type LightsMode = 'auto' | 'on' | 'off'
export const lightsOn = (mode: LightsMode, altDeg: number): boolean => (mode === 'auto' ? altDeg < 5 : mode === 'on')
