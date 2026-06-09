// src/app/api/cars/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser()
  const { id } = await params
  const car = await prisma.car.findFirst({
    where: { id: Number(id), userId: user.id },
    include: { maintenanceRecords: { orderBy: { kmAtService: 'desc' } } },
  })
  if (!car) return Response.json({ error: 'No encontrado' }, { status: 404 })
  return Response.json(car)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser()
  const { id } = await params
  const existing = await prisma.car.findFirst({
    where: { id: Number(id), userId: user.id },
  })
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })
  const data = await request.json()
  const car = await prisma.car.update({
    where: { id: Number(id) },
    data,
  })
  return Response.json(car)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser()
  const { id } = await params
  const existing = await prisma.car.findFirst({
    where: { id: Number(id), userId: user.id },
  })
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })
  await prisma.car.delete({ where: { id: Number(id) } })
  return Response.json({ success: true })
}
