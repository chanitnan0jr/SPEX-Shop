import { Router, type Request, type Response } from 'express'
import { SpecModel } from '../models/Spec'

const router = Router()

router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await SpecModel.distinct('model')
    res.json({ count: models.length, models: models.sort() })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch models' })
  }
})

router.get('/specs/:brand', async (req: Request, res: Response) => {
  const brand = req.params.brand?.trim()

  if (!brand) {
    res.status(400).json({ error: 'brand parameter is required' })
    return
  }

  const specs = await SpecModel.find(
    { brand: { $regex: new RegExp(`^${brand}$`, 'i') } },
    { embedding: 0 }
  )
    .sort({ model: 1 })
    .lean()

  if (specs.length === 0) {
    res.status(404).json({ error: `No specs found for brand: ${brand}` })
    return
  }

  res.json({ brand, count: specs.length, specs })
})

export default router
