import { supabase } from '@/lib/db'

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
