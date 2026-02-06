import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const userHeader = req.headers.get('x-user')

  if (!userHeader) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = JSON.parse(userHeader)

  return NextResponse.json({
    success: true,
    user,
  })
}
