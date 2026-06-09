import { cookies } from 'next/headers'
import { prisma } from './prisma'
import crypto from 'crypto'

const SESSION_COOKIE = 'autocuidado-session'

export async function createSession(userId: number) {
  const token = crypto.randomUUID()
  await prisma.session.create({ data: { token, userId } })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  return session
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  cookieStore.delete(SESSION_COOKIE)
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) throw new Error('No autorizado')
  if (!session.user.approved) throw new Error('Cuenta pendiente de aprobación')
  return session.user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!user.admin) throw new Error('Se requieren permisos de administrador')
  return user
}
