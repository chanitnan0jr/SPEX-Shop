// Shared types from frontend — adapted for React Native

export interface SpecHighlights {
  display?: string
  ram?: string
  storage?: string
  camera?: string
  battery?: string
  chipset?: string
  os?: string
}

export interface SpecSource {
  site: string
  specphone_id?: number
  slug: string
}

export interface Spec {
  _id: string
  brand: string
  model: string
  category: string
  price_thb: number | null
  source_url: string
  thumbnail_url: string | null
  source: SpecSource
  highlights: SpecHighlights
  spec_sections: Record<string, Record<string, string>>
  search_text: string
  scraped_at: string
  updated_at: string
}

export interface SearchSource {
  brand: string
  model: string
  source_url: string
  thumbnail_url: string | null
  price_thb: number | null
  score?: number
}

export interface SearchResponse {
  answer: string
  sources: SearchSource[]
}

export interface ChatHistoryMessage {
  _id: string
  sessionId: string
  query: string
  answer: string
  sources: SearchSource[]
  createdAt: string
}

// Product listing response from /api/products
export interface ProductListResponse {
  products: Spec[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Auth types
export interface AuthUser {
  _id: string
  email: string
  displayName: string
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

// Cart types
export interface CartItem {
  specId: string
  brand: string
  model: string
  price_thb: number
  thumbnail_url: string | null
  quantity: number
}

export interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  updatedAt: string
}

// Order types
export interface OrderItem {
  specId: string
  brand: string
  model: string
  price_thb: number
  quantity: number
}

export interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'cancelled'
  paymentRef: string | null
  createdAt: string
}
