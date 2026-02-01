import bcrypt from 'bcrypt'
import { createUser, getUserByEmail } from '@/models/users'

const SALT_ROUNDS = 10

export async function signupUser(params: {
  email: string
  password: string
}) {
  const { email, password } = params

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  return createUser({
    email,
    passwordHash,
  })
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email)

  if (!user) {
    throw new Error('Invalid email or password')
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    throw new Error('Invalid email or password')
  }

  // NEVER return password_hash
  return {
    id: user.id,
    email: user.email,
    is_email_verified: user.is_email_verified,
    created_at: user.created_at,
  }
}
