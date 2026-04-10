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

app.use(cors())
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
