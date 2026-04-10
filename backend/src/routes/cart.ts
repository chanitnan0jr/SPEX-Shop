import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/authMiddleware'
import { CartModel } from '../models/Cart'
import { Types } from 'mongoose'

const router = Router()

// @route   GET /api/cart
// @desc    Get current user's cart
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    let cart = await CartModel.findOne({ userId: req.userId })
    if (!cart) {
      cart = await CartModel.create({ userId: req.userId, items: [] })
    }
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// @route   POST /api/cart/add
// @desc    Add item to cart
router.post('/add', requireAuth, async (req: AuthRequest, res: Response) => {
  const { specId, brand, model, price_thb, thumbnail_url, quantity = 1 } = req.body

  if (!specId || !brand || !model || price_thb === undefined) {
    return res.status(400).json({ error: 'Missing required item details' })
  }

  try {
    let cart = await CartModel.findOne({ userId: req.userId })
    
    if (!cart) {
      cart = new CartModel({ userId: req.userId, items: [] })
    }

    const itemIndex = cart.items.findIndex(item => item.specId.toString() === specId)

    if (itemIndex > -1) {
      // Item exists, increment quantity
      cart.items[itemIndex].quantity += quantity
    } else {
      // New item
      cart.items.push({
        specId: new Types.ObjectId(specId),
        brand,
        model,
        price_thb,
        thumbnail_url,
        quantity
      } as any)
    }

    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
})

// @route   PATCH /api/cart/update
// @desc    Update item quantity
router.patch('/update', requireAuth, async (req: AuthRequest, res: Response) => {
  const { specId, quantity } = req.body

  if (!specId || quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Invalid update details' })
  }

  try {
    const cart = await CartModel.findOne({ userId: req.userId })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    const itemIndex = cart.items.findIndex(item => item.specId.toString() === specId)
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not in cart' })

    cart.items[itemIndex].quantity = quantity
    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// @route   DELETE /api/cart/remove/:specId
// @desc    Remove item from cart
router.delete('/remove/:specId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { specId } = req.params

  try {
    const cart = await CartModel.findOne({ userId: req.userId })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    cart.items = cart.items.filter(item => item.specId.toString() !== specId)
    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' })
  }
})

// @route   DELETE /api/cart/clear
// @desc    Clear all items
router.delete('/clear', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await CartModel.findOne({ userId: req.userId })
    if (cart) {
      cart.items = []
      await cart.save()
    }
    res.json({ message: 'Cart cleared', items: [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

export default router
