import { supabase } from '@/backend/db/db'

export async function createFile(params: {
  user_id: string
  folder_id?: string | null
  file_name: string
  file_size: number
  file_type: string
  storage_key: string
  bucket_name: string
}) {
  const { data, error } = await supabase
    .from('files')
    .insert({
      ...params,
      status: 'uploading',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
