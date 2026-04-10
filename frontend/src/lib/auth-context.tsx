'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, registerApi } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (credentials: any) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('specbot_token')
    const savedRefreshToken = localStorage.getItem('specbot_refresh_token')
    const savedUser = localStorage.getItem('specbot_user')
    if (savedToken && savedUser) {
      setAccessToken(savedToken)
      setRefreshToken(savedRefreshToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (credentials: any) => {
    const { accessToken, refreshToken, user } = await loginApi(credentials)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUser(user)
    localStorage.setItem('specbot_token', accessToken)
    localStorage.setItem('specbot_refresh_token', refreshToken)
    localStorage.setItem('specbot_user', JSON.stringify(user))
  }

  const register = async (userData: any) => {
    const { accessToken, refreshToken, user } = await registerApi(userData)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUser(user)
    localStorage.setItem('specbot_token', accessToken)
    localStorage.setItem('specbot_refresh_token', refreshToken)
    localStorage.setItem('specbot_user', JSON.stringify(user))
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('specbot_token')
    localStorage.removeItem('specbot_refresh_token')
    localStorage.removeItem('specbot_user')
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, register, logout, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
