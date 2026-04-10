import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { useRouter, useSegments } from 'expo-router'

type User = {
  id: string
  email: string
  name: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  refreshToken: string | null
  signIn: (token: string, refreshToken: string, user: User) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    loadStorageData()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === 'auth'

    if (token && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace('/(tabs)')
    }
  }, [token, segments, isLoading])

  async function loadStorageData() {
    try {
      const storedToken = await storage.getItem('userToken')
      const storedRefreshToken = await storage.getItem('userRefreshToken')
      const storedUser = await storage.getItem('userData')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Failed to load auth data', e)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (newToken: string, newRefreshToken: string, newUser: User) => {
    try {
      await storage.setItem('userToken', newToken)
      await storage.setItem('userRefreshToken', newRefreshToken)
      await storage.setItem('userData', JSON.stringify(newUser))
      setToken(newToken)
      setRefreshToken(newRefreshToken)
      setUser(newUser)
    } catch (error) {
      console.error('Failed to save auth data', error)
    }
  }

  const signOut = async () => {
    try {
      await storage.deleteItem('userToken')
      await storage.deleteItem('userRefreshToken')
      await storage.deleteItem('userData')
      setToken(null)
      setRefreshToken(null)
      setUser(null)
    } catch (error) {
      console.error('Failed to delete auth data', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
