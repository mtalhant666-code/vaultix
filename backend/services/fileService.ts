import { supabase } from "@/backend/db/db";
import { generatePresignedPutUrl } from "@/backend/storage/r2";
import { v4 as uuid } from "uuid";
import type { File } from "../shared/types/file";

type InitUploadBatchInput = {
  userId: string;
  files: File[];
  folderId: string;
};

export async function initUploadBatch({
  userId,
  files,
  folderId,
}: InitUploadBatchInput) {
  // ─── Validation ─────────────────────────────

    const { data, error } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new Error("Invalid folder");
    }
    
  // ─── Process ─────────────────────────────
  const uploads: {
    file_id: string;
    upload_url: string;
    expires_at: string;
  }[] = [];

  for (const file of files) {
    const fileId = uuid();
    const storageKey = `users/${userId}/files/${fileId}`;

    const { error: insertError } = await supabase
      .from("files")
      .insert({
        id: fileId,
        user_id: userId,
        folder_id: folderId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_key: storageKey,
        bucket_name: process.env.R2_BUCKET_NAME,
        status: "uploading",
        checksum: null,
      });

    if (insertError) {
      throw new Error("Failed to create file record");
    }

    const { url, expiresAt } = await generatePresignedPutUrl({
      bucket: process.env.R2_BUCKET_NAME!,
      key: storageKey,
      contentType: file.type,
      expiresInSeconds: 60 * 60 * 24, // 24h
    });

    uploads.push({
      file_id: fileId,
      upload_url: url,
      expires_at: expiresAt,
    });
  }

  return { uploads };
}
