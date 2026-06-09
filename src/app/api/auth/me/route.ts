// src/app/api/auth/me/route.ts
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ user: null })
  return Response.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      admin: session.user.admin,
      approved: session.user.approved,
      createdAt: session.user.createdAt,
    },
  })
}
