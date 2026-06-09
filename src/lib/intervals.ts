export const INTERVAL_KM: Record<string, number> = {
  'Aceite de motor': 10000,
  'Filtro de aceite': 10000,
  'Filtro de aire': 20000,
  'Filtro de combustible': 30000,
  'Filtro de habitáculo': 20000,
  'Bujías': 40000,
  'Líquido de frenos': 40000,
  'Pastillas de freno': 30000,
  'Discos de freno': 60000,
  'Neumáticos': 50000,
  'Correa de distribución': 100000,
  'Tensor de distribución': 100000,
  'Bomba de agua': 100000,
  'Líquido refrigerante': 60000,
  'Aceite de transmisión': 60000,
  'Filtro de transmisión': 60000,
  'Batería': 50000,
  'Amortiguadores': 80000,
  'Suspensión': 80000,
}

export const PARTS = Object.keys(INTERVAL_KM)

export function getNextKm(partName: string, currentKm: number): number {
  const interval = INTERVAL_KM[partName] || 10000
  return currentKm + interval
}
