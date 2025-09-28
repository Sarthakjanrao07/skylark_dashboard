import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!

// The exclamation mark tells TypeScript this variable is never undefined.

export function generateToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '1h' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}
