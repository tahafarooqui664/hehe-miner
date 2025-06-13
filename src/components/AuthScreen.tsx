'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { getTelegramWebApp, getTelegramUser } from '@/lib/telegram'

export default function AuthScreen() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)

  useEffect(() => {
    // Check if running in Telegram Web App and auto-login
    const initTelegramAuth = async () => {
      const webApp = getTelegramWebApp()
      if (webApp || navigator.userAgent.includes('Telegram') || (window as any).Telegram) {
        setIsTelegramWebApp(true)
        console.log('Telegram environment detected')

        // Auto-login with Telegram data
        await handleTelegramLogin()
      } else {
        console.log('Not in Telegram environment')
      }
    }

    initTelegramAuth()
  }, [])

  const handleMockLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiClient.loginMock()

      if (response.success) {
        login(response.user, response.token)
      } else {
        setError(response.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTelegramLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      console.log('=== TELEGRAM LOGIN ATTEMPT ===')

      // Initialize Telegram Web App first
      const webApp = getTelegramWebApp()
      if (webApp) {
        webApp.ready()
        webApp.expand()
      }

      console.log('WebApp object:', webApp)
      console.log('Window.Telegram:', (window as any).Telegram)
      console.log('Navigator userAgent:', navigator.userAgent)

      // Extract referral parameter from URL and Telegram WebApp
      const urlParams = new URLSearchParams(window.location.search)
      let referralId = urlParams.get('ref')

      // Also check Telegram WebApp start parameter (this is the key fix!)
      const webApp = (window as any).Telegram?.WebApp
      if (!referralId && webApp?.initDataUnsafe?.start_param) {
        referralId = webApp.initDataUnsafe.start_param
      }

      console.log('Referral ID extracted:', referralId)

      // Try multiple sources for user data
      let telegramUser = null
      let authMethod = 'unknown'
      let initData = null

      // Method 1: Try to get initData first (most reliable for validation)
      if (webApp?.initData && webApp.initData.length > 0) {
        initData = webApp.initData
        authMethod = 'initData'
        console.log('✅ Found initData:', initData)

        // Also try to extract user from initData for fallback
        try {
          const urlParams = new URLSearchParams(initData)
          const userParam = urlParams.get('user')
          if (userParam) {
            telegramUser = JSON.parse(userParam)
            console.log('✅ Extracted user from initData:', telegramUser)
          }
        } catch (e) {
          console.log('⚠️ Could not parse user from initData:', e)
        }
      }

      // Method 2: Direct WebApp initDataUnsafe (most common)
      if (!telegramUser && webApp?.initDataUnsafe?.user) {
        telegramUser = webApp.initDataUnsafe.user
        authMethod = 'initDataUnsafe'
        console.log('✅ Found user via initDataUnsafe:', telegramUser)
      }

      // Method 3: Global Telegram object
      if (!telegramUser && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        telegramUser = (window as any).Telegram.WebApp.initDataUnsafe.user
        authMethod = 'global_telegram'
        console.log('✅ Found user via global Telegram:', telegramUser)
      }

      // Method 3: Parse initData manually
      else if (webApp?.initData) {
        try {
          const urlParams = new URLSearchParams(webApp.initData)
          const userParam = urlParams.get('user')
          if (userParam) {
            telegramUser = JSON.parse(userParam)
            authMethod = 'parsed_initData'
            console.log('✅ Found user via parsed initData:', telegramUser)
          }
        } catch (parseError) {
          console.error('Failed to parse initData:', parseError)
        }
      }

      // Method 4: Extract from window.Telegram if available
      else if ((window as any).Telegram?.WebApp?.initDataUnsafe) {
        const initDataUnsafe = (window as any).Telegram.WebApp.initDataUnsafe
        if (initDataUnsafe.user) {
          telegramUser = initDataUnsafe.user
          authMethod = 'window_telegram_unsafe'
          console.log('✅ Found user via window.Telegram.WebApp.initDataUnsafe:', telegramUser)
        }
      }

      // Method 5: Use environment detection with real user ID extraction
      else if (navigator.userAgent.includes('Telegram') || (window as any).Telegram) {
        // Try to get real user data from any available source
        const webAppData = (window as any).Telegram?.WebApp
        if (webAppData?.initDataUnsafe?.user) {
          telegramUser = webAppData.initDataUnsafe.user
          authMethod = 'telegram_webapp_data'
          console.log('✅ Found user via Telegram WebApp data:', telegramUser)
        } else {
          // Last resort: Generate unique ID based on browser/session
          const sessionId = Date.now() + Math.random()
          telegramUser = {
            id: Math.floor(sessionId), // Generate unique ID
            first_name: 'Telegram',
            last_name: 'User',
            username: `user_${Math.floor(sessionId)}`
          }
          authMethod = 'generated_unique_id'
          console.log('✅ Generated unique user ID:', telegramUser)
        }
      }

      // Try to authenticate with available data
      let authPayload = null

      if (initData && initData.length > 0) {
        // Use initData if available (most secure and proper way)
        authPayload = {
          initData,
          ...(referralId && { referralId })
        }
        console.log('🚀 Authenticating with initData, referral:', referralId)
      } else if (telegramUser && telegramUser.id) {
        // Use direct user data as fallback
        authPayload = {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          photo_url: telegramUser.photo_url,
          auth_date: Math.floor(Date.now() / 1000),
          hash: `telegram-auth-${authMethod}`,
          authMethod: authMethod,
          ...(referralId && { referralId })
        }
        console.log(`🚀 Authenticating user via ${authMethod}, referral:`, referralId)
      } else {
        console.error('❌ No Telegram user data found')
        setError('Unable to get Telegram user data. Please make sure you opened this app from Telegram.')
        return
      }

      if (authPayload) {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authPayload)
        })

        const data = await response.json()
        console.log('Authentication response:', data)

        if (data.success) {
          console.log('✅ Authentication successful!')
          // Clear stored referral ID after successful authentication
          if (referralId) {
            localStorage.removeItem('hehe_referral_id')
            console.log('🗑️ Cleared referral ID from localStorage')
          }
          login(data.user, data.token)
        } else {
          console.error('❌ Authentication failed:', data.error)
          setError(`Authentication failed: ${data.error}`)
        }
      } else {
        console.error('❌ Could not create authentication payload')
        setError('Unable to authenticate. Please try refreshing the page.')
      }
    } catch (error) {
      console.error('Telegram login error:', error)
      setError(`Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-16 w-5 h-5 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-float opacity-70" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-60 left-1/2 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-60" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="glass-dark rounded-3xl shadow-2xl p-8 border border-white/20 animate-bounce-in hover-lift">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
                <span className="text-3xl animate-float">⛏️</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3 animate-slide-up">
              Hehe Miner
            </h1>
            <p className="text-gray-300 text-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
              ✨ Start mining Hehe tokens today! ✨
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6 glass animate-bounce-in">
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-lg">⚠️</span>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Buttons */}
          <div className="space-y-5 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <button
              onClick={handleTelegramLogin}
              className="group w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl transform hover:scale-105"
            >
              <span className="text-xl group-hover:animate-bounce">📱</span>
              <span className="text-lg">Login with Telegram</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer"></div>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 glass-dark rounded-full text-gray-300 font-medium">
                  ✨ or for testing ✨
                </span>
              </div>
            </div>

            <button
              onClick={handleMockLogin}
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-yellow-500/25 hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-lg">Logging in...</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
                </>
              ) : (
                <>
                  <span className="text-xl group-hover:animate-bounce">🔧</span>
                  <span className="text-lg">Mock Login (Development)</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer"></div>
                </>
              )}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/20 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h3 className="text-xl font-bold text-white mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎮 Amazing Features 🎮
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg glass hover-lift transition-all duration-300">
                <span className="text-green-400 text-lg animate-pulse">⛏️</span>
                <span className="text-gray-200 font-medium">Mine 4+ HEHE tokens every 4 hours</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass hover-lift transition-all duration-300">
                <span className="text-blue-400 text-lg animate-pulse" style={{animationDelay: '0.5s'}}>📋</span>
                <span className="text-gray-200 font-medium">Complete tasks for bonus tokens</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass hover-lift transition-all duration-300">
                <span className="text-purple-400 text-lg animate-pulse" style={{animationDelay: '1s'}}>👥</span>
                <span className="text-gray-200 font-medium">Refer friends and earn rewards</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass hover-lift transition-all duration-300">
                <span className="text-yellow-400 text-lg animate-pulse" style={{animationDelay: '1.5s'}}>⚡</span>
                <span className="text-gray-200 font-medium">Upgrade mining speed infinitely</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm mb-2">Join thousands of miners worldwide! 🌍</p>
              <div className="flex justify-center space-x-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
