import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/jwt'

export const proxy = (req: NextRequest) => {
  // Only protect /api/me
  if (!req.nextUrl.pathname.startsWith('/api/me')) {
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user', JSON.stringify(decoded))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    )
  }
}
