import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/jwt'

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
]

export const proxy = (req: NextRequest) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Only protect API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const headers = new Headers(req.headers)
    headers.set('x-user', JSON.stringify(decoded))

    return NextResponse.next({
      request: { headers },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    )
  }
}
