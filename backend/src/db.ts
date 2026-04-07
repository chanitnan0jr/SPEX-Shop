import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI is required')
}

process.on('SIGTERM', () => console.log('SIGTERM received'))
process.on('SIGINT', () => console.log('SIGINT received'))

// Catch unhandled rejections for clearer Azure debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('[server] Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

let isConnected = false

export async function connectDB(): Promise<void> {
  try {
    console.log('[db] connecting to MongoDB...')
    await mongoose.connect(uri as string, {
      dbName: process.env.MONGODB_DB_NAME || 'specbot',
      serverSelectionTimeoutMS: 10000, // 10s timeout instead of waiting forever
      socketTimeoutMS: 45000,
    })
    console.log('[db] connected successfully')
    isConnected = true
  } catch (error) {
    console.error('[db] connection error:', error)
    throw error
  }
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect()
  isConnected = false
}
