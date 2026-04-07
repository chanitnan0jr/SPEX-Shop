import { Router, Request, Response } from 'express'
import google from 'googlethis'

const router = Router()

// Simple in-memory cache to avoid too many requests
const cache: Record<string, { url: string; timestamp: number }> = {}

router.get('/images/official', async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = req.query.brand as string
    const model = req.query.model as string

    if (!brand || !model) {
      res.status(400).json({ error: 'Missing brand or model' })
      return
    }

    const queryKey = `${brand}-${model}`
    const now = Date.now()
    if (cache[queryKey] && (now - cache[queryKey].timestamp) < 24 * 60 * 60 * 1000) {
      res.json({ url: cache[queryKey].url })
      return
    }

    let searchDomain = ''
    if (brand.toLowerCase().includes('apple')) {
      searchDomain = 'site:apple.com'
    } else if (brand.toLowerCase().includes('samsung')) {
      searchDomain = 'site:samsung.com'
    }

    const searchQuery = `${searchDomain} ${model} smartphone`
    
    const options = {
      page: 0, 
      safe: false, // Safe Search
      additional_params: {
        tbs: 'isz:l' // large size
      }
    }
    
    const images = await google.image(searchQuery, options)
    
    if (images && images.length > 0) {
      // Find the first image that is not too small and preferably from official domain if possible
      // but since we search with site: we just take the first one
      const bestImage = images[0].url
      cache[queryKey] = { url: bestImage, timestamp: now }
      res.json({ url: bestImage })
    } else {
      res.json({ url: null })
    }
  } catch (err) {
    console.error('[images] search failed:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
