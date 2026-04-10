'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Spec, addToCartApi, getCartApi } from '@/lib/api'

interface CartItem {
  _id: string
  product: Spec
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addItem: (product: Spec) => Promise<void>
  removeItem: (productId: string) => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    // Load relative cart if logged in, otherwise use local storage
    const loadCart = async () => {
      try {
        const data = await getCartApi()
        setCart(data.items || [])
      } catch {
        const saved = localStorage.getItem('specbot_cart')
        if (saved) setCart(JSON.parse(saved))
      }
    }
    loadCart()
  }, [])

  const addItem = async (product: Spec) => {
    try {
      // Sync with backend if possible
      await addToCartApi(product._id!, 1)
    } catch {
      // Fallback to local state
    }

    const newCart = [...cart]
    const existing = newCart.find(item => item.product._id === product._id)
    if (existing) {
      existing.quantity += 1
    } else {
      newCart.push({ _id: Math.random().toString(), product, quantity: 1 })
    }
    
    setCart(newCart)
    localStorage.setItem('specbot_cart', JSON.stringify(newCart))
  }

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item.product._id !== productId)
    setCart(newCart)
    localStorage.setItem('specbot_cart', JSON.stringify(newCart))
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
