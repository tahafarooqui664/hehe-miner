'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  totalBalance: number
  miningPower: number
  hasBasicPlan: boolean
  speedUpgrades: number
  canMine?: boolean
  timeUntilNextMining?: number
  currentMiningSession?: {
    id: string
    startTime: string
    tokensEarned: number
  } | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, authToken: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        // Set token on API client
        apiClient.setToken(storedToken)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_data', JSON.stringify(userData))
    // Set token on API client
    apiClient.setToken(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    // Clear token from API client
    apiClient.setToken(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
