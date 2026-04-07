import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI is required')
}

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  await mongoose.connect(uri as string, {
    dbName: process.env.MONGODB_DB_NAME || 'specbot',
  })

  isConnected = true
  console.log('Connected to MongoDB Atlas - SpecBot')
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect()
  isConnected = false
}
