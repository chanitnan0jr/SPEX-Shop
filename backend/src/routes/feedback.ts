import { Router, Request, Response } from 'express'
import { FeedbackModel, IFeedback } from '../models/Feedback'

const router = Router()

/**
 * POST /api/feedback
 * Submit a thumb up/down for a specific RAG answer
 */
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, messageId, query, answer, rating } = req.body

    // Basic validation
    if (!sessionId || !messageId || !query || !answer || !rating) {
      return res.status(400).json({ error: 'Missing required feedback fields' })
    }

    if (rating !== 1 && rating !== -1) {
      return res.status(400).json({ error: 'Invalid rating value' })
    }

    // Upsert feedback if messageId + sessionId already exists
    const update = {
      sessionId,
      messageId,
      query,
      answer,
      rating,
      createdAt: new Date(),
    }

    const doc = await FeedbackModel.findOneAndUpdate(
      { sessionId, messageId },
      update,
      { upsert: true, new: true }
    )

    console.log(`[feedback] recorded ${rating === 1 ? 'UP' : 'DOWN'} for session ${sessionId}`)

    return res.status(200).json({ success: true, doc })
  } catch (error: any) {
    console.error('[feedback] error:', error.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
