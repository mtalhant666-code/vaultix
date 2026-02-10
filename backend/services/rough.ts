import { supabase } from "@/backend/db/db";
import { generatePresignedPutUrl } from "@/backend/storage/r2";
import { v4 as uuid } from "uuid";
import type { File } from "../shared/types/file";

type InitUploadBatchInput = {
  userId: string;
  files: File[];
  folderId: string | null;
};

