import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from '../context/auth'
import { Colors } from '../lib/constants'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.dark.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  )
}
