import { Schema, model, Document } from 'mongoose'

export interface IVisit extends Document {
  ip?: string
  userAgent?: string
  timestamp: Date
}

const VisitSchema = new Schema<IVisit>(
  {
    ip: { type: String, default: 'anonymous' },
    userAgent: { type: String, default: 'unknown' },
    timestamp: { type: Date, default: Date.now }
  },
  {
    collection: 'visits',
    versionKey: false
  }
)

export const VisitModel = model<IVisit>('Visit', VisitSchema)
