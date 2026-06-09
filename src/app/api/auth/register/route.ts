// src/app/api/auth/register/route.ts
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  const userCount = await prisma.user.count()
  const admin = userCount === 0
  const approved = userCount === 0

  const user = await prisma.user.create({
    data: { name, email, password, admin, approved },
  })

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    admin: user.admin,
    approved: user.approved,
    createdAt: user.createdAt,
  })
}
