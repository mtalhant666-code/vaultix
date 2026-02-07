import { supabase } from '@/backend/db/db';

/**
 * Create a new user
 */
export async function createUser(params: {
  email: string;
  passwordHash: string;
  name?: string;
}) {
  const { email, passwordHash, name } = params;

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      name: name || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
