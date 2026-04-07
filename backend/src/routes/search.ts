import { Router, type Request, type Response } from 'express'
import { runRAG } from '../services/rag'
import { ChatMessageModel } from '../models/ChatMessage'

const router = Router()

router.post('/search', async (req: Request, res: Response) => {
  const { query, sessionId } = req.body as { query?: string, sessionId?: string }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'query is required and must be a non-empty string' })
    return
  }

  try {
    const result = await runRAG(query.trim())
    
    // Save to history if sessionId is provided (don't await to avoid blocking response, but handle errors)
    if (sessionId) {
      ChatMessageModel.create({
        sessionId,
        query: query.trim(),
        answer: result.answer,
        sources: result.sources,
        createdAt: new Date()
      }).catch(err => console.error('[search] failed to save chat history:', err))
    }

    res.json(result)
  } catch (error) {
    console.error('[search] RAG error:', error)
    res.status(500).json({ error: 'Failed to process your request' })
  }
})

export default router
