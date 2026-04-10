import { Schema, model, Document } from 'mongoose'

export interface IAuthUser extends Document {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const AuthUserSchema = new Schema<IAuthUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
  },
  {
    collection: 'auth_users',
    versionKey: false,
    timestamps: true,
  }
)

export const AuthUserModel = model<IAuthUser>('AuthUser', AuthUserSchema)
