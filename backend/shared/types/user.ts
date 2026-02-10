// src/backend/types/user.ts
export type User = {
  id: string
  email: string
  name: string | null
  is_email_verified: boolean
  password_hash: string
  created_at: string
}
