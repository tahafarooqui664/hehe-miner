import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface UserPayload {
  id: string
  telegramId: string
  username?: string
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Mock authentication for local development
export function createMockUser(): UserPayload {
  return {
    id: 'mock-user-id',
    telegramId: 'mock-telegram-id',
    username: 'mock_user'
  }
}
