import { Router, type Request, type Response } from 'express'
import { VisitModel } from '../models/Visit'

const router = Router()

router.post('/track', async (req: Request, res: Response) => {
  try {
    const visit = new VisitModel({
      ip: req.ip || req.headers['x-forwarded-for'] || 'anonymous',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    })
    await visit.save()
    res.status(200).json({ success: true, message: 'Visit tracked' })
  } catch (error) {
    console.error('Track error:', error)
    res.status(500).json({ success: false, error: 'Failed to record visit' })
  }
})

// Optional GET to check count (simple analytics)
router.get('/track/count', async (req: Request, res: Response) => {
  try {
    const total = await VisitModel.countDocuments()
    const today = await VisitModel.countDocuments({
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
    res.json({ total, today })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visit stats' })
  }
})

export default router
