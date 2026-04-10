import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { 
  Prompt_400Regular, 
  Prompt_500Medium, 
  Prompt_600SemiBold, 
  Prompt_700Bold, 
  Prompt_900Black 
} from '@expo-google-fonts/prompt'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from '../context/auth'
import { CartProvider } from '../context/cart'
import { UiPreferencesProvider } from '../context/ui-context'
import { Colors } from '../lib/constants'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Prompt-Regular': Prompt_400Regular,
    'Prompt-Medium': Prompt_500Medium,
    'Prompt-SemiBold': Prompt_600SemiBold,
    'Prompt-Bold': Prompt_700Bold,
    'Prompt-Black': Prompt_900Black,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UiPreferencesProvider>
        <AuthProvider>
          <CartProvider>
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
          </CartProvider>
        </AuthProvider>
      </UiPreferencesProvider>
    </QueryClientProvider>
  )
}
