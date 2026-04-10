import axios from 'axios'
import { storage } from './storage'
import type {
  Spec,
  SearchResponse,
  ProductListResponse,
} from '../types/spec'

// Backend URL — change to your actual backend URL (Default port 8080)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'

const api = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, '')}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request Interceptor to add JWT token
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await storage.getItem('userRefreshToken')
        if (!refreshToken) throw new Error('No refresh token available')

        // Attempt to refresh
        const { data } = await axios.post(`${BASE_URL.replace(/\/$/, '')}/api/auth/refresh`, {
          refreshToken,
        })

        // Save new tokens
        await storage.setItem('userToken', data.accessToken)
        await storage.setItem('userRefreshToken', data.refreshToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed (expired or invalid token)
        await storage.deleteItem('userToken')
        await storage.deleteItem('userRefreshToken')
        await storage.deleteItem('userData')
        // Note: The context-level protection in AuthProvider will handle the redirect
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ─── Health ──────────────────────────────────────────
export const healthCheck = async () => {
  const { data } = await api.get<{
    status: string
    db: string
    uptime: number
    timestamp: string
  }>('/health')
  return data
}

// ─── Products (Phase 1 — new backend route) ──────────
export const getProducts = async (
  page = 1,
  limit = 20,
  brand?: string
): Promise<ProductListResponse> => {
  const { data } = await api.get<ProductListResponse>('/products', {
    params: { page, limit, ...(brand ? { brand } : {}) },
  })
  return data
}

export const getProductById = async (id: string): Promise<Spec> => {
  const { data } = await api.get<Spec>(`/products/${id}`)
  return data
}

// ─── Search (existing RAG endpoint) ──────────────────
export const searchProducts = async (
  query: string,
  sessionId?: string
): Promise<SearchResponse> => {
  const { data } = await api.post<SearchResponse>('/search', {
    query,
    sessionId,
  })
  return data
}

// ─── Specs by brand (existing) ───────────────────────
export const getSpecsByBrand = async (brand: string): Promise<Spec[]> => {
  const { data } = await api.get<{ brand: string; count: number; specs: Spec[] }>(
    `/specs/${brand}`
  )
  return data.specs
}

// ─── Compare (existing) ─────────────────────────────
export const compareSpecs = async (models: string[]): Promise<Spec[]> => {
  const { data } = await api.get<{ count: number; specs: Spec[] }>('/compare', {
    params: { models: models.join(',') },
  })
  return data.specs
}

// ─── Brands list ────────────────────────────────────
export const getBrands = async (): Promise<string[]> => {
  const { data } = await api.get<{ count: number; brands: string[] }>('/products/brands')
  return data.brands
}

// ─── Auth ───────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const authRegister = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password })
  return data
}

export const authLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export const authRefresh = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const { data } = await api.post('/auth/refresh', { refreshToken })
  return data
}

export const authMe = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

// ─── Cart (Phase 4) ──────────────────────────────────
export interface ICartItem {
  specId: string
  brand: string
  model: string
  price_thb: number
  thumbnail_url: string | null
  quantity: number
}

export interface ICart {
  userId: string
  items: ICartItem[]
  updatedAt: string
}

export const getCart = async (): Promise<ICart> => {
  const { data } = await api.get<ICart>('/cart')
  return data
}

export const addToCart = async (item: Omit<ICartItem, 'quantity'> & { quantity?: number }): Promise<ICart> => {
  const { data } = await api.post<ICart>('/cart/add', item)
  return data
}

export const updateCartItem = async (specId: string, quantity: number): Promise<ICart> => {
  const { data } = await api.patch<ICart>('/cart/update', { specId, quantity })
  return data
}

export const removeFromCart = async (specId: string): Promise<ICart> => {
  const { data } = await api.delete<ICart>(`/cart/remove/${specId}`)
  return data
}

export const clearCart = async (): Promise<{ message: string; items: [] }> => {
  const { data } = await api.delete<{ message: string; items: [] }>('/cart/clear')
  return data
}

// ─── Orders (Phase 5) ─────────────────────────────────
export interface IShippingAddress {
  name: string
  phone: string
  address: string
  province: string
  zip: string
}

export interface IOrder {
  _id: string
  userId: string
  items: ICartItem[]
  totalAmount: number
  shippingAddress: IShippingAddress
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export const createOrder = async (shippingAddress: IShippingAddress): Promise<IOrder> => {
  const { data } = await api.post<IOrder>('/orders/create', { shippingAddress })
  return data
}

export const getOrders = async (): Promise<IOrder[]> => {
  const { data } = await api.get<IOrder[]>('/orders')
  return data
}

export const getOrderById = async (id: string): Promise<IOrder> => {
  const { data } = await api.get<IOrder>(`/orders/${id}`)
  return data
}

// Export the axios instance for auth interceptor later
export { api }
