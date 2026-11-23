import type { DxfUnits } from './types'

export const METRES_PER_UNIT: Record<DxfUnits, number | null> = {
  unitless: null, inches: 0.0254, feet: 0.3048, miles: 1609.344,
  millimeters: 0.001, centimeters: 0.01, meters: 1, kilometers: 1000,
}
export const sourceScale = (unit: DxfUnits): number | null => METRES_PER_UNIT[unit]

