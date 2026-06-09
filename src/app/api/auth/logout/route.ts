// src/app/api/auth/logout/route.ts
import { destroySession } from '@/lib/auth'

export async function POST() {
  await destroySession()
  return Response.json({ success: true })
}
