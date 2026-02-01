import { supabase } from '@/lib/db';

export async function createFolder(params: {
  userId: string;
  name: string;
  parentId?: string | null;
  isRoot?: boolean;
}) {
  const { userId, name, parentId = null, isRoot = false } = params;

  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: userId,
      name,
      parent_id: parentId,
      is_root: isRoot,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
