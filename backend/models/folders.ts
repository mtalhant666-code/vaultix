import { supabase } from '@/backend/db/db'

export async function createRootFolder(userId: string) {
  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: userId,
      name: 'root',
      is_root: true,
      parent_id: null,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create root folder')
  }

  return data
}

export async function getRootFolderByUserId(userId: string) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .eq("is_root", true)
    .single();

  if (error || !data) {
    throw new Error("Root folder not found");
  }

  return data;
}