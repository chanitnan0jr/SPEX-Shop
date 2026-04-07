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

app.use(errorHandler)

export default app
