import { Schema, model } from 'mongoose'

export interface IFeedback {
  sessionId: string
  messageId: string
  query: string
  answer: string
  rating: number // 1 for thumbs up, -1 for thumbs down
  createdAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    sessionId: { type: String, required: true },
    messageId: { type: String, required: true },
    query: { type: String, required: true },
    answer: { type: String, required: true },
    rating: { type: Number, required: true, enum: [1, -1] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'feedbacks',
    versionKey: false,
  }
)

// Index for easy analysis / lookup
FeedbackSchema.index({ sessionId: 1, messageId: 1 })
FeedbackSchema.index({ createdAt: -1 })

export const FeedbackModel = model<IFeedback>('Feedback', FeedbackSchema)
