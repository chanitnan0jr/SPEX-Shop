import { Schema, model, Types } from 'mongoose'

export interface ICartItem {
  specId: Types.ObjectId
  brand: string
  model: string
  price_thb: number
  thumbnail_url: string | null
  quantity: number
}

export interface ICart {
  userId: Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>({
  specId: { type: Schema.Types.ObjectId, ref: 'Spec', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price_thb: { type: Number, required: true },
  thumbnail_url: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false })

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, unique: true },
    items: [CartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'carts',
    versionKey: false,
  }
)

CartSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export const CartModel = model<ICart>('Cart', CartSchema)
