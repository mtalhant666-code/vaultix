import { NextResponse } from 'next/server';
import { supabase } from '@/backend/db/db';

export async function GET() {
  const { data, error } = await supabase
    .from('folders') // ⚠️ table name must exist
    .select('*')
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    connected: true,
    data,
  });
}
