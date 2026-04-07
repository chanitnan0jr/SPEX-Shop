import { Schema, model, Document } from 'mongoose'

export interface IChatMessage {
  sessionId: string
  query: string
  answer: string
  sources: Array<{
    brand: string
    model: string
    source_url: string
    thumbnail_url: string | null
    price_thb: number | null
    score?: number
  }>
  createdAt: Date
}

export interface IChatMessageDocument extends IChatMessage, Document {}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: { type: String, required: true, index: true },
    query: { type: String, required: true },
    answer: { type: String, required: true },
    sources: [
      {
        brand: String,
        model: String,
        source_url: String,
        thumbnail_url: String,
        price_thb: Number,
        score: Number,
      },
    ],
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    collection: 'chat_history',
    versionKey: false,
  }
)

export const ChatMessageModel = model<IChatMessageDocument>('ChatMessage', ChatMessageSchema)
