import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '@/backend/storage/r2'

export async function GET() {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: 'hello-world.txt',
      Body: 'Hello from Vaultix 🚀',
      ContentType: 'text/plain',
    })
  )

  return NextResponse.json({ success: true })
}

