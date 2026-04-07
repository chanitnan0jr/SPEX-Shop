import { Schema, model, Document } from 'mongoose'
import { ISpec } from './Spec'

export interface IUserComparison {
  models: string[]
  timestamp: Date
}

export interface IUser extends Document {
  userId: string // Clerk ID or Device Fingerprint
  savedDevices: string[] // Array of brand-model slugs
  comparisonHistory: IUserComparison[]
  preferences: {
    language: 'en' | 'th'
    theme: 'light' | 'dark'
  }
  created_at: Date
  updated_at: Date
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    savedDevices: { type: [String], default: [] },
    comparisonHistory: [
      {
        models: { type: [String], required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    preferences: {
      language: { type: String, enum: ['en', 'th'], default: 'en' },
      theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    collection: 'users',
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

export const UserModel = model<IUser>('User', UserSchema)
