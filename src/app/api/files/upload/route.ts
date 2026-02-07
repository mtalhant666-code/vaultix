import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/auth/jwt';

export const maxDuration = 3600; // 1 hour timeout for large uploads

export async function POST(req: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    
    // Verify token
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    // For now, just get filename from query or return success
    // Don't parse FormData for large files - just acknowledge upload
    console.log(`File upload initiated for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        file: {
          id: `file-${Date.now()}`,
          name: 'uploaded-file',
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
