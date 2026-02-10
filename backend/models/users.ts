import { supabase } from '@/backend/db/db';
import { createRootFolder } from '@/backend/models/folders'
import type { User } from '../shared/types/user';
/**
 * Create a new user
 */
export async function createUser(params: {
  email: string
  passwordHash: string
  name?: string
}): Promise<User> {
  const { email, passwordHash, name } = params

  // 1️⃣ Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      name: name ?? null,
    })
    .select()
    .single()

  if (error || !user) {
    throw new Error(error?.message ?? 'Failed to create user')
  }

  // 2️⃣ Create root folder (atomic-at-app-level)
  try {
    await createRootFolder(user.id)
  } catch (err) {
    // rollback user if root folder fails
    await supabase.from('users').delete().eq('id', user.id)
    throw err
  }

  return user
}

/**
 * Get user by email (used for login & signup checks)
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)
    .single();

  // "no rows returned" is NOT an error for login flow
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data; // null if not found
}
