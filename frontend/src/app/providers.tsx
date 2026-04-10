'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { UiPreferencesProvider } from '@/lib/ui-context'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 * 5, // 5 min
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <UiPreferencesProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </UiPreferencesProvider>
    </QueryClientProvider>
  )
}
