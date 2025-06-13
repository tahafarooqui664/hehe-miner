'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { initTelegramWebApp, getTelegramUser, isTelegramWebApp, triggerHapticFeedback, getTelegramStartParam } from '@/lib/telegram'
import Image from 'next/image'

interface LandingPageProps {
  onLaunchApp: () => void
}

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingText, setLoadingText] = useState('Initializing...')

  const loadingSteps = [
    'Initializing...',
    'Connecting to Telegram...',
    'Authenticating user...',
    'Loading user data...',
    'Preparing mining interface...',
    'Almost ready...'
  ]

  useEffect(() => {
    // Initialize Telegram Web App
    initTelegramWebApp()
    // Auto-start authentication
    handleLaunchApp()
  }, [])

  useEffect(() => {
    if (isLoading) {
      let stepIndex = 0
      const interval = setInterval(() => {
        stepIndex = (stepIndex + 1) % loadingSteps.length
        setLoadingText(loadingSteps[stepIndex])
      }, 800)

      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleLaunchApp = async () => {
    setIsLoading(true)
    setError('')

    // Trigger haptic feedback
    triggerHapticFeedback('impact', 'medium')

    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Extract referral parameter - PRIORITY ORDER:
      // 1. URL query parameter (from webhook ?ref=)
      // 2. Telegram WebApp start_param (if available)
      let referralId = null

      console.log('🚨 EXTRACTING REFERRAL ID')
      console.log('🚨 Current URL:', window.location.href)
      console.log('🚨 URL search:', window.location.search)

      // Check URL parameter FIRST (this is where webhook puts it)
      const urlParams = new URLSearchParams(window.location.search)
      referralId = urlParams.get('ref')
      if (referralId) {
        console.log('🚨 FOUND REFERRAL IN URL PARAM:', referralId)
      } else {
        console.log('🚨 NO REFERRAL IN URL PARAM')
      }

      // Check Telegram WebApp start parameter as fallback
      if (!referralId && typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param) {
        referralId = (window as any).Telegram.WebApp.initDataUnsafe.start_param
        console.log('🚨 FOUND REFERRAL IN TELEGRAM START_PARAM:', referralId)
      }

      // Try helper function as last resort
      if (!referralId && isTelegramWebApp()) {
        referralId = getTelegramStartParam()
        if (referralId) {
          console.log('🚨 FOUND REFERRAL VIA HELPER FUNCTION:', referralId)
        }
      }

      console.log('🚨🚨🚨 FINAL REFERRAL ID:', referralId)

      // Try Telegram authentication first
      if (isTelegramWebApp()) {
        const telegramUser = getTelegramUser()
        const webApp = (window as any).Telegram?.WebApp

        if (telegramUser) {
          // Use initData if available (most secure)
          if (webApp?.initData) {
            console.log('🚨 USING INITDATA AUTH')
            console.log('🚨 WebApp initDataUnsafe:', webApp.initDataUnsafe)
            console.log('🚨 Raw initData:', webApp.initData)

            const authPayload = {
              initData: webApp.initData
            }

            // ALWAYS add referral ID if it exists
            if (referralId) {
              authPayload.referralId = referralId
              console.log('🚨 ADDING REFERRAL ID TO INITDATA PAYLOAD:', referralId)
            } else {
              console.log('🚨 NO REFERRAL ID TO ADD TO INITDATA PAYLOAD')
            }

            console.log('🚨 FINAL INITDATA PAYLOAD:', JSON.stringify(authPayload, null, 2))

            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(authPayload)
            })

            const data = await response.json()
            if (data.success) {
              triggerHapticFeedback('notification', 'success')
              login(data.user, data.token)
              onLaunchApp()
              return
            }
          } else {
            // Fallback to user data
            const authPayload = {
              id: telegramUser.id,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              username: telegramUser.username,
              photo_url: telegramUser.photo_url,
              auth_date: Math.floor(Date.now() / 1000),
              hash: 'telegram-auth-webapp'
            }

            // ALWAYS add referral ID if it exists
            if (referralId) {
              authPayload.referralId = referralId
              console.log('SENDING REFERRAL ID WITH USER DATA:', referralId)
            }

            console.log('Sending user data auth with referral:', !!referralId)

            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(authPayload)
            })

            const data = await response.json()
            if (data.success) {
              triggerHapticFeedback('notification', 'success')
              login(data.user, data.token)
              onLaunchApp()
              return
            }
          }
        }
      }

      // Fallback to mock authentication for development
      console.log('FALLING BACK TO MOCK AUTH')
      const mockPayload = {
        mock: true
      }

      // ALWAYS add referral ID if it exists
      if (referralId) {
        mockPayload.referralId = referralId
        console.log('SENDING REFERRAL ID WITH MOCK AUTH:', referralId)
      }

      console.log('Mock auth payload:', JSON.stringify(mockPayload, null, 2))

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload)
      })

      const data = await response.json()
      if (data.success) {
        triggerHapticFeedback('notification', 'success')
        login(data.user, data.token)
        onLaunchApp()
      } else {
        triggerHapticFeedback('notification', 'error')
        setError(data.error || 'Authentication failed')
      }
    } catch (error) {
      triggerHapticFeedback('notification', 'error')
      setError('Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-orange-400 rounded-full opacity-20 animate-pulse delay-300"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-yellow-300 rounded-full opacity-20 animate-pulse delay-700"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-300 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="text-center z-10">
          {/* Logo */}
          <div className="mb-8 animate-bounce">
            <Image
              src="/hehe-logo.svg"
              alt="Hehe Miner"
              width={120}
              height={120}
              className="mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Loading spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-orange-400 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>

          {/* Loading text */}
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
            {loadingText}
          </h2>
          
          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>

          <p className="text-gray-300 mt-4 text-sm">
            Please wait while we prepare your mining experience...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-orange-400 rounded-full opacity-20 animate-float delay-300"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-yellow-300 rounded-full opacity-20 animate-float delay-700"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-300 rounded-full opacity-20 animate-float delay-500"></div>
      </div>

      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8 animate-bounce">
          <Image
            src="/hehe-logo.svg"
            alt="Hehe Miner"
            width={150}
            height={150}
            className="mx-auto drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4 animate-pulse">
          HEHE MINER
        </h1>

        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Start your crypto mining journey with the most fun and rewarding mining game!
        </p>

        {/* Features */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-center text-gray-300">
            <span className="text-yellow-400 mr-2">⚡</span>
            <span>Mine HEHE tokens every 4 hours</span>
          </div>
          <div className="flex items-center justify-center text-gray-300">
            <span className="text-yellow-400 mr-2">🚀</span>
            <span>Upgrade your mining power</span>
          </div>
          <div className="flex items-center justify-center text-gray-300">
            <span className="text-yellow-400 mr-2">👥</span>
            <span>Refer friends and earn rewards</span>
          </div>
        </div>



        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-400 text-xs mt-6">
          Powered by Telegram • Secure • Decentralized
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
