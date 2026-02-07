import { NextRequest, NextResponse } from 'next/server';
import { signupUser } from '@/backend/services/userService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await signupUser({ email, password, name });

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        token: result.token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
