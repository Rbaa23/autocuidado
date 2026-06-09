// src/app/api/admin/users/route.ts
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, admin: true, approved: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(users)
}
