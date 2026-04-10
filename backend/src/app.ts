import express from 'express'
import cors from 'cors'
import { rateLimiter, searchRateLimiter } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import healthRouter from './routes/health'
import searchRouter from './routes/search'
import specsRouter from './routes/specs'
import compareRouter from './routes/compare'
import imagesRouter from './routes/images'
import trackRouter from './routes/track'
import feedbackRouter from './routes/feedback'
import chatRouter from './routes/chat'
import productsRouter from './routes/products'
import authRouter from './routes/auth'
import cartRouter from './routes/cart'
import ordersRouter from './routes/orders'

const app = express()

// Robust CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // Web Frontend
  'http://localhost:8081', // Expo Web
  process.env.FRONTEND_URL, // Production Web
  process.env.MOBILE_ORIGIN, // Physical Mobile Device IP
].filter(Boolean) as string[]

app.use(cors({
  origin: true, // Emergency Bypass: Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Log incoming origin for future whitelisting
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    console.log(`[cors-debug] Request from: ${origin}`)
    res.setHeader('X-Debug-Origin', origin)
  }
  next()
})
app.use(express.json())
app.use(rateLimiter)

app.use('/api', healthRouter)
app.use('/api', searchRateLimiter, searchRouter)
app.use('/api', specsRouter)
app.use('/api', compareRouter)
app.use('/api', trackRouter)
app.use('/api', imagesRouter)
app.use('/api', feedbackRouter)
app.use('/api', chatRouter)
app.use('/api', productsRouter)
app.use('/api', authRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)

app.use(errorHandler)

export default app
