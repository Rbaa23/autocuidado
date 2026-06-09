// src/app/api/cars/route.ts
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const user = await requireUser()
  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    include: { maintenanceRecords: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(cars)
}

export async function POST(request: Request) {
  const user = await requireUser()
  const data = await request.json()
  const car = await prisma.car.create({
    data: { ...data, userId: user.id },
  })
  return Response.json(car, { status: 201 })
}
