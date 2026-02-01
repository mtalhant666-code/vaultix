import { NextRequest } from 'next/server'
import { verifyToken } from '@/utils/jwt'

export function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    throw new Error('Authorization header missing')
  }

  const [type, token] = authHeader.split(' ')

  if (type !== 'Bearer' || !token) {
    throw new Error('Invalid authorization format')
  }

  try {
    const decoded = verifyToken(token)
    return decoded
  } catch {
    throw new Error('Invalid or expired token')
  }
}
