import { NextRequest, NextResponse } from "next/server";
import { initUploadBatch } from "@/backend/services/fileService";
import { z } from "zod";

const UploadFileInputSchema = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  type: z.string().min(1),
});

const InitUploadBatchSchema = z.object({
  files: z.array(UploadFileInputSchema).min(1),
  folder_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // ✅ Read auth info injected by proxy/middleware
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    console.log("User ID:", userId, "User Email:", userEmail);

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse & validate body
    const body = InitUploadBatchSchema.parse(await req.json());

    const result = await initUploadBatch({
      userId, // already a string
      files: body.files,
      folderId: body.folder_id,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Internal error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
