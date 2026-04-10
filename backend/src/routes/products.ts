import { Router, type Request, type Response } from 'express'
import { SpecModel } from '../models/Spec'

const router = Router()

// GET /api/products — list products with pagination + optional brand filter
router.get('/products', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const brand = (req.query.brand as string)?.trim()
    const sort = (req.query.sort as string) || 'model'

    const filter: Record<string, unknown> = {}
    if (brand) {
      filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      SpecModel.find(filter, { embedding: 0, search_text: 0 })
        .sort({ [sort]: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SpecModel.countDocuments(filter),
    ])

    res.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[products] list error:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/brands — distinct brand list
router.get('/products/brands', async (_req: Request, res: Response) => {
  try {
    const brands = await SpecModel.distinct('brand')
    res.json({ count: brands.length, brands: brands.sort() })
  } catch (err) {
    console.error('[products] brands error:', err)
    res.status(500).json({ error: 'Failed to fetch brands' })
  }
})

// GET /api/products/:id — single product by ObjectId
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'Invalid product ID format' })
      return
    }

    const product = await SpecModel.findById(id, { embedding: 0 }).lean()

    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    res.json(product)
  } catch (err) {
    console.error('[products] detail error:', err)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

export default router
