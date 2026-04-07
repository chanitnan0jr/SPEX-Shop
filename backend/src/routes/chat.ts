import { Router, type Request, type Response } from 'express'
import { ChatMessageModel } from '../models/ChatMessage'

const router = Router()

/**
 * Retrieve chat history for a persistent session.
 */
router.get('/chat/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params

  try {
    const messages = await ChatMessageModel.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    messages.reverse()

    res.json(messages)
  } catch (error) {
    console.error('[chat] fetch history error:', error)
    res.status(500).json({ error: 'Failed to retrieve chat history' })
  }
})

/**
 * Clear chat history for a persistent session.
 */
router.delete('/chat/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params

  try {
    await ChatMessageModel.deleteMany({ sessionId })
    res.json({ success: true, message: 'Chat history cleared' })
  } catch (error) {
    console.error('[chat] delete history error:', error)
    res.status(500).json({ error: 'Failed to clear chat history' })
  }
})

export default router
