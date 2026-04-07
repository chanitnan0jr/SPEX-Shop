import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected'

  res.json({
    status: 'ok',
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

export default router
