import { useCartContext } from '../context/cart'

/**
 * Hook to access global cart state.
 * Refactored to consume CartContext so all components share the same state.
 */
export function useCart() {
  return useCartContext()
}
