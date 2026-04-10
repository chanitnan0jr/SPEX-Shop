import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/authMiddleware'
import { OrderModel } from '../models/Order'
import { CartModel } from '../models/Cart'

const router = Router()

// @route   GET /api/orders
// @desc    Get current user's order history
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await OrderModel.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history' })
  }
})

// @route   GET /api/orders/:id
// @desc    Get single order details
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderModel.findOne({ _id: req.params.id, userId: req.userId })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' })
  }
})

// @route   POST /api/orders/create
// @desc    Create a new order from cart
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  const { shippingAddress } = req.body

  if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
    return res.status(400).json({ error: 'Missing shipping address details' })
  }

  try {
    // 1. Get current cart
    const cart = await CartModel.findOne({ userId: req.userId })
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cannot checkout with an empty cart' })
    }

    // 2. Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price_thb * item.quantity), 0)

    // 3. Create the order
    const order = new OrderModel({
      userId: req.userId,
      items: cart.items.map(item => ({
        specId: item.specId,
        brand: item.brand,
        model: item.model,
        price_thb: item.price_thb,
        quantity: item.quantity,
        thumbnail_url: item.thumbnail_url
      })),
      totalAmount,
      shippingAddress,
      status: 'paid' // Simulated auto-pay for Phase 5
    })

    await order.save()

    // 4. Clear the cart
    cart.items = []
    await cart.save()

    res.status(201).json(order)
  } catch (err) {
    console.error('Order creation error:', err)
    res.status(500).json({ error: 'Failed to process order' })
  }
})

export default router
