'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import LandingPage from '@/components/LandingPage'
import MainApp from '@/components/MainApp'

export default function Home() {
  const { user, token, isLoading } = useAuth()
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
    }
  }, [token])

  // Always show landing page for authentication flow
  // This ensures the app always starts from loading screen

  const handleLaunchApp = () => {
    setShowLanding(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Hehe Miner...</p>
        </div>
      </div>
    )
  }

  if (!user || showLanding) {
    return <LandingPage onLaunchApp={handleLaunchApp} />
  }

  return <MainApp />
}
