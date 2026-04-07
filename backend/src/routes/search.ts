import { Router, type Request, type Response } from 'express'
import { runRAG } from '../services/rag'

const router = Router()

router.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'query is required and must be a non-empty string' })
    return
  }

  const result = await runRAG(query.trim())
  res.json(result)
})

export default router
