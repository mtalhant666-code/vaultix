import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/services/userService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    const user = await loginUser(email, password)

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    )
  }
}
