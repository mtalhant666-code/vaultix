import bcrypt from 'bcrypt'
import { createUser, getUserByEmail } from '@/backend/models/users'
import { signToken } from '@/backend/auth/jwt'
import { createRootFolder } from '@/backend/models/folders'

const SALT_ROUNDS = 10

export async function signupUser(params: {
  email: string
  password: string
  name?: string
}) {
  const { email, password, name } = params

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await createUser({
    email,
    passwordHash,
    name,
  })

  await createRootFolder(user.id)

  const token = signToken({
    userId: user.id,
    email: user.email,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      is_email_verified: user.is_email_verified,
    },
    token,
  }
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

  const token = signToken({
    userId: user.id,
    email: user.email,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      is_email_verified: user.is_email_verified,
      
    },
    token,
  }
}
