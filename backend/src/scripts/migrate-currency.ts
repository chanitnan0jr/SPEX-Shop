import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { SpecModel } from '../models/Spec'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env')
  process.exit(1)
}

const MULTIPLIER = 0.2625

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI!, {
      dbName: process.env.MONGODB_DB_NAME || 'specbot'
    })
    console.log('[migrate] Connected to MongoDB - SpecBot')

    const specs = await SpecModel.find({ price_thb: { $ne: null, $gt: 0 } })
    console.log(`[migrate] Found ${specs.length} documents with prices to normalize`)

    let updatedCount = 0
    for (const spec of specs) {
      // Check if price looks like it needs conversion (i.e., it is currently large INR values)
      // Flagship models over 10k INR are good indicators. 
      // We will apply it to all though, as per instructions.
      const originalPrice = spec.price_thb!
      const normalizedPrice = Math.round(originalPrice * MULTIPLIER)
      
      spec.price_thb = normalizedPrice
      spec.updated_at = new Date()
      
      // Specifically update the source description or metadata if needed? 
      // No, just the field.
      
      await spec.save()
      updatedCount++
      if (updatedCount % 10 === 0) {
        console.log(`[migrate] Progress: ${updatedCount}/${specs.length}...`)
      }
    }

    console.log(`[migrate] Successfully normalized ${updatedCount} documents.`)
    console.log(`[migrate] Example: ${specs[0]?.brand} ${specs[0]?.model} -> ${specs[0]?.price_thb} THB`)
    
  } catch (error) {
    console.error('[migrate] Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('[migrate] Disconnected from MongoDB')
  }
}

migrate()
