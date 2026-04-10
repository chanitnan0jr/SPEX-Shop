import { Schema, model, Types } from 'mongoose'

export interface IOrderItem {
  specId: Types.ObjectId
  brand: string
  model: string
  price_thb: number
  quantity: number
  thumbnail_url: string | null
}

export interface IShippingAddress {
  name: string
  phone: string
  address: string
  province: string
  zip: string
}

export interface IOrder {
  userId: Types.ObjectId
  items: IOrderItem[]
  totalAmount: number
  shippingAddress: IShippingAddress
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  paymentRef?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  specId: { type: Schema.Types.ObjectId, ref: 'Spec', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price_thb: { type: Number, required: true },
  quantity: { type: Number, required: true },
  thumbnail_url: { type: String, default: null },
}, { _id: false })

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  zip: { type: String, required: true },
}, { _id: false })

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    paymentRef: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'orders',
    versionKey: false,
  }
)

OrderSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export const OrderModel = model<IOrder>('Order', OrderSchema)
