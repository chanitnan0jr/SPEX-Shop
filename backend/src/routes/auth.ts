import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthUserModel } from '../models/AuthUser'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-prod'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod'
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'

function signAccessToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

// ─── POST /api/auth/register ─────────────────────────
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string
      email?: string
      password?: string
    }

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ error: 'name, email and password are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email address' })
      return
    }

    // Check duplicate
    const existing = await AuthUserModel.findOne({ email: email.toLowerCase() })
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }

    // Hash & create
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await AuthUserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    })

    const accessToken = signAccessToken(user.id, user.email)
    const refreshToken = signRefreshToken(user.id)

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('[auth] register error:', err)
    res.status(500).json({ error: 'Registration failed, please try again' })
  }
})

// ─── POST /api/auth/login ────────────────────────────
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    const user = await AuthUserModel.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const accessToken = signAccessToken(user.id, user.email)
    const refreshToken = signRefreshToken(user.id)

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('[auth] login error:', err)
    res.status(500).json({ error: 'Login failed, please try again' })
  }
})

// ─── POST /api/auth/refresh ──────────────────────────
router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }

    if (!refreshToken) {
      res.status(400).json({ error: 'refreshToken is required' })
      return
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string }

    const user = await AuthUserModel.findById(payload.userId)
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const newAccessToken = signAccessToken(user.id, user.email)
    const newRefreshToken = signRefreshToken(user.id)

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

// ─── GET /api/auth/me ────────────────────────────────
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const user = await AuthUserModel.findById(payload.userId, { passwordHash: 0 })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ id: user.id, name: user.name, email: user.email })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
