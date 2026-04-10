import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-prod'

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    req.userId = payload.userId
    req.userEmail = payload.email
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
