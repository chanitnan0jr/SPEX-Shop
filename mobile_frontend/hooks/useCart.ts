import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart, ICartItem } from '../lib/api'
import { useAuth } from '../context/auth'
import { storage } from '../lib/storage'

const LOCAL_CART_KEY = 'spex_local_cart'

export function useCart() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [localItems, setLocalItems] = useState<ICartItem[]>([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)

  // ─── 1. GUEST MODE (LOCAL STORAGE) ──────────────────

  useEffect(() => {
    if (!token) {
      loadLocalCart()
    } else {
      setIsLocalLoading(false)
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

  // ─── 2. AUTH MODE (BACKEND API) ─────────────────────

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: !!token,
  })

  const addMutation = useMutation({
    mutationFn: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => apiAddToCart(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  // ─── 3. CORE ACTIONS ────────────────────────────────

  const addToCart = async (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => {
    if (token) {
      return addMutation.mutateAsync(item)
    }

    // Local Logic
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
      const mutation = apiUpdateCartItem(specId, quantity)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return mutation
    }

    const newItems = localItems.map(item => 
      item.specId === specId ? { ...item, quantity } : item
    )
    await saveLocalCart(newItems)
  }

  const removeItem = async (specId: string) => {
    if (token) {
      const mutation = apiRemoveFromCart(specId)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return mutation
    }

    const newItems = localItems.filter(item => item.specId !== specId)
    await saveLocalCart(newItems)
  }

  const clearCart = async () => {
    if (token) {
      const mutation = apiClearCart()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      return mutation
    }

    await saveLocalCart([])
  }

  // ─── 4. SYNC LOGIC ──────────────────────────────────

  const mergeLocalCart = useCallback(async () => {
    const stored = await storage.getItem(LOCAL_CART_KEY)
    if (!stored) return

    const localItemsToSync: ICartItem[] = JSON.parse(stored)
    if (localItemsToSync.length === 0) return

    try {
      // Sync each item to backend
      for (const item of localItemsToSync) {
        await apiAddToCart(item)
      }
      // Success - clear local
      await storage.deleteItem(LOCAL_CART_KEY)
      setLocalItems([])
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (e) {
      console.error('Failed to sync cart', e)
    }
  }, [queryClient])

  // ─── 5. COMPUTED ────────────────────────────────────

  const items = token ? (cartQuery.data?.items ?? []) : localItems
  const totalCount = items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum: number, item: ICartItem) => sum + (item.price_thb * item.quantity), 0)

  return {
    items,
    totalCount,
    totalPrice,
    isLoading: token ? cartQuery.isLoading : isLocalLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    mergeLocalCart,
    refreshCart: () => token ? cartQuery.refetch() : loadLocalCart(),
  }
}
