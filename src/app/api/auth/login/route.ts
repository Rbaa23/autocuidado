// src/app/api/auth/login/route.ts
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== password) {
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  if (!user.approved) {
    return Response.json({ error: 'Cuenta pendiente de aprobación' }, { status: 403 })
  }

  await createSession(user.id)

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    admin: user.admin,
    approved: user.approved,
    createdAt: user.createdAt,
  })
}
