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
  token: string | null
  login: (credentials: any) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('specbot_token')
    const savedUser = localStorage.getItem('specbot_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (credentials: any) => {
    const { token, user } = await loginApi(credentials)
    setToken(token)
    setUser(user)
    localStorage.setItem('specbot_token', token)
    localStorage.setItem('specbot_user', JSON.stringify(user))
  }

  const register = async (userData: any) => {
    const { token, user } = await registerApi(userData)
    setToken(token)
    setUser(user)
    localStorage.setItem('specbot_token', token)
    localStorage.setItem('specbot_user', JSON.stringify(user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('specbot_token')
    localStorage.removeItem('specbot_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
