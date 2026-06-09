// src/app/api/admin/users/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { approved: true },
  })
  return Response.json(user)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  await prisma.user.delete({ where: { id: Number(id) } })
  return Response.json({ success: true })
}
