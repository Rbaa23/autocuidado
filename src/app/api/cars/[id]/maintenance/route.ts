// src/app/api/cars/[id]/maintenance/route.ts
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getNextKm } from '@/lib/intervals'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser()
  const { id } = await params
  const car = await prisma.car.findFirst({
    where: { id: Number(id), userId: user.id },
  })
  if (!car) return Response.json({ error: 'No encontrado' }, { status: 404 })
  const records = await prisma.maintenanceRecord.findMany({
    where: { carId: car.id },
    orderBy: { kmAtService: 'desc' },
  })
  return Response.json(records)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser()
  const { id } = await params
  const car = await prisma.car.findFirst({
    where: { id: Number(id), userId: user.id },
  })
  if (!car) return Response.json({ error: 'No encontrado' }, { status: 404 })
  const { partName, kmAtService, date, notes } = await request.json()
  const nextKm = getNextKm(partName, kmAtService)
  const record = await prisma.maintenanceRecord.create({
    data: { carId: car.id, partName, kmAtService, date, nextKm, notes: notes || '' },
  })
  if (kmAtService > car.km) {
    await prisma.car.update({ where: { id: car.id }, data: { km: kmAtService } })
  }
  return Response.json(record, { status: 201 })
}
