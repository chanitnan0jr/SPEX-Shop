import { Router, type Request, type Response } from 'express'
import { SpecModel } from '../models/Spec'

const router = Router()

router.get('/compare', async (req: Request, res: Response) => {
  const modelsParam = req.query.models as string | undefined

  if (!modelsParam) {
    res.status(400).json({ error: 'models query parameter is required (e.g. ?models=iPhone 16,Galaxy S25)' })
    return
  }

  const modelNames = modelsParam
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

  if (modelNames.length < 2) {
    res.status(400).json({ error: 'At least 2 model names are required' })
    return
  }

  if (modelNames.length > 4) {
    res.status(400).json({ error: 'Maximum 4 models can be compared at once' })
    return
  }

  const specs = await SpecModel.find(
    {
      model: {
        $in: modelNames.map((name) => new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')),
      },
    },
    { embedding: 0 }
  ).lean()

  if (specs.length === 0) {
    res.json({ count: 0, specs: [] })
    return
  }

  res.json({ count: specs.length, specs })
})

export default router
