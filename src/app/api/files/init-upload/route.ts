import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '@/backend/storage/r2'
import { createFile } from '@/backend/models/files'

export async function POST(req: NextRequest) {
  try {
    const user = JSON.parse(req.headers.get('x-user')!)
    const body = await req.json()

    const { file_name, file_type, file_size, folder_id } = body

    if (!file_name || !file_type || !file_size) {
      return NextResponse.json(
        { success: false, message: 'Invalid input' },
        { status: 400 }
      )
    }

    // temp key, file id comes after insert
    const tempKey = 'temp'

    const file = await createFile({
      user_id: user.userId,
      folder_id,
      file_name,
      file_size,
      file_type,
      storage_key: tempKey,
      bucket_name: process.env.R2_BUCKET_NAME!,
    })

    const storageKey = `users/u-${user.userId}/files/f-${file.id}`

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storageKey,
        ContentType: file_type,
      }),
      { expiresIn: 60 * 5 }
    )

    return NextResponse.json({
      success: true,
      fileId: file.id,
      uploadUrl,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
