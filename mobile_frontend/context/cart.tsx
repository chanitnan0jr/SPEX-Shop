import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCart, 
  addToCart as apiAddToCart, 
  updateCartItem as apiUpdateCartItem, 
  removeFromCart as apiRemoveFromCart, 
  clearCart as apiClearCart, 
  ICartItem 
} from '../lib/api'
import { useAuth } from './auth'
import { storage } from '../lib/storage'

const LOCAL_CART_KEY = 'spex_local_cart'

interface CartContextType {
  items: ICartItem[]
  totalCount: number
  totalPrice: number
  isLoading: boolean
  addToCart: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => Promise<void>
  updateQuantity: (specId: string, quantity: number) => Promise<void>
  removeItem: (specId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  mergeLocalCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [localItems, setLocalItems] = useState<ICartItem[]>([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)

  // 1. Initial Load for Guest Cart
  useEffect(() => {
    if (!token) {
      loadLocalCart()
    } else {
      setIsLocalLoading(false)
      // When token appears, we might want to sync
      mergeLocalCart()
    }
  }, [token])

  const loadLocalCart = async () => {
    setIsLocalLoading(true)
    try {
      const stored = await storage.getItem(LOCAL_CART_KEY)
      if (stored) {
        setLocalItems(JSON.parse(stored))
      } else {
        setLocalItems([])
      }
    } catch (e) {
      console.error('Failed to load local cart', e)
    } finally {
      setIsLocalLoading(false)
    }
  }

  const saveLocalCart = async (items: ICartItem[]) => {
    try {
      await storage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
      setLocalItems(items)
    } catch (e) {
      console.error('Failed to save local cart', e)
    }
  }

  // 2. Auth Queries
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: !!token,
  })

  const addMutation = useMutation({
    mutationFn: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => apiAddToCart(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  // 3. Actions
  const addToCart = async (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => {
    if (token) {
      await addMutation.mutateAsync(item)
      return
    }

    const existingIndex = localItems.findIndex(i => i.specId === item.specId)
    let newItems = [...localItems]
    
    if (existingIndex > -1) {
      newItems[existingIndex].quantity += (item.quantity ?? 1)
    } else {
      newItems.push({ ...item, quantity: item.quantity ?? 1 } as ICartItem)
    }
    
    await saveLocalCart(newItems)
  }

  const updateQuantity = async (specId: string, quantity: number) => {
    if (token) {
      await apiUpdateCartItem(specId, quantity)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return
    }

    const newItems = localItems.map(item => 
      item.specId === specId ? { ...item, quantity } : item
    )
    await saveLocalCart(newItems)
  }

  const removeItem = async (specId: string) => {
    if (token) {
      await apiRemoveFromCart(specId)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return
    }

    const newItems = localItems.filter(item => item.specId !== specId)
    await saveLocalCart(newItems)
  }

  const clearCart = async () => {
    if (token) {
      await apiClearCart()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return
    }

    await saveLocalCart([])
  }

  const mergeLocalCart = useCallback(async () => {
    const stored = await storage.getItem(LOCAL_CART_KEY)
    if (!stored) return

    const localItemsToSync: ICartItem[] = JSON.parse(stored)
    if (localItemsToSync.length === 0) return

    try {
      for (const item of localItemsToSync) {
        await apiAddToCart(item)
      }
      await storage.deleteItem(LOCAL_CART_KEY)
      setLocalItems([])
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (e) {
      console.error('Failed to sync cart', e)
    }
  }, [queryClient])

  const refreshCart = async () => {
    if (token) {
      await cartQuery.refetch()
    } else {
      await loadLocalCart()
    }
  }

  // 4. Computed
  const items = useMemo(() => {
    return token ? (cartQuery.data?.items ?? []) : localItems
  }, [token, cartQuery.data, localItems])

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price_thb * item.quantity), 0)
  }, [items])

  return (
    <CartContext.Provider value={{
      items,
      totalCount,
      totalPrice,
      isLoading: token ? cartQuery.isLoading : isLocalLoading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      mergeLocalCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
