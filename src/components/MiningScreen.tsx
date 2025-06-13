'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import Image from 'next/image'

export default function MiningScreen() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [canClaim, setCanClaim] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.currentMiningSession) {
      const interval = setInterval(() => {
        updateMiningTimer()
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [user?.currentMiningSession])

  const updateMiningTimer = () => {
    if (!user?.currentMiningSession) return

    const startTime = new Date(user.currentMiningSession.startTime).getTime()
    const miningDuration = 4 * 60 * 60 * 1000 // 4 hours
    const endTime = startTime + miningDuration
    const now = Date.now()
    const remaining = endTime - now

    if (remaining <= 0) {
      setTimeRemaining(0)
      setCanClaim(true)
    } else {
      setTimeRemaining(remaining)
      setCanClaim(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartMining = async () => {
    if (!user?.hasBasicPlan) {
      setError('You need to purchase the basic plan first!')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.startMining()
      
      if (response.success) {
        setSuccess('Mining started successfully!')
        // Refresh user profile
        const profileResponse = await apiClient.getUserProfile()
        if (profileResponse.success) {
          updateUser(profileResponse.user)
        }
      } else {
        setError(response.error || 'Failed to start mining')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimTokens = async () => {
    if (!user?.currentMiningSession) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.claimMining(user.currentMiningSession.id)
      
      if (response.success) {
        setSuccess(`Claimed ${response.tokensEarned} HEHE tokens!`)
        // Refresh user profile
        const profileResponse = await apiClient.getUserProfile()
        if (profileResponse.success) {
          updateUser(profileResponse.user)
        }
      } else {
        setError(response.error || 'Failed to claim tokens')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getMiningProgress = () => {
    if (!user?.currentMiningSession || timeRemaining <= 0) return 100
    
    const startTime = new Date(user.currentMiningSession.startTime).getTime()
    const miningDuration = 4 * 60 * 60 * 1000 // 4 hours
    const elapsed = Date.now() - startTime
    return Math.min((elapsed / miningDuration) * 100, 100)
  }

  return (
    <div className="p-6 max-w-md mx-auto relative">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6 glass animate-bounce-in">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-xl animate-bounce">⚠️</span>
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6 glass animate-bounce-in">
          <div className="flex items-center space-x-3">
            <span className="text-green-400 text-xl animate-bounce">🎉</span>
            <p className="text-green-300 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Mining Status Card */}
      <div className="glass-dark rounded-3xl p-8 mb-8 border border-white/20 hover-lift animate-slide-up relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>

        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center animate-pulse-glow relative">
              <Image
                src="/hehe-logo.svg"
                alt="Hehe Miner"
                width={80}
                height={80}
                className="animate-float"
              />
              {user?.currentMiningSession && timeRemaining > 0 && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
              )}
            </div>
            {canClaim && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping"></div>
            )}
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Mining Status
          </h2>
          
          {!user?.hasBasicPlan ? (
            <div className="text-center animate-slide-up">
              <p className="text-gray-300 mb-6 text-lg">Purchase the basic plan to start mining! 🚀</p>
              <div className="glass rounded-2xl p-6 border border-yellow-400/30">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-3xl animate-bounce">💡</span>
                  <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>⛏️</span>
                  <span className="text-3xl animate-bounce" style={{animationDelay: '0.4s'}}>💎</span>
                </div>
                <p className="text-yellow-300 font-bold text-lg mb-2">
                  Basic Plan: $1
                </p>
                <p className="text-gray-300">
                  Unlock mining 4 HEHE tokens every 4 hours
                </p>
              </div>
            </div>
          ) : user?.currentMiningSession && timeRemaining > 0 ? (
            <div className="animate-slide-up">
              <p className="text-gray-300 mb-6 text-lg font-medium">⚡ Mining in progress... ⚡</p>
              <div className="mb-6">
                <div className="bg-gray-700/50 rounded-full h-4 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${getMiningProgress()}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer"></div>
                  </div>
                </div>
                <p className="text-white font-semibold">
                  Progress: {getMiningProgress().toFixed(1)}% ⚡
                </p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-yellow-400/30">
                <div className="text-4xl font-mono text-yellow-400 mb-3 animate-pulse font-bold">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-white text-lg font-medium">Time remaining ⏰</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white">
                <span className="text-2xl animate-coin-flip">💰</span>
                <span className="text-lg font-bold">Earning: {user.currentMiningSession.tokensEarned} HEHE</span>
                <span className="text-2xl animate-coin-flip" style={{animationDelay: '0.5s'}}>💰</span>
              </div>
            </div>
          ) : canClaim && user?.currentMiningSession ? (
            <div className="animate-bounce-in">
              <div className="mb-6">
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                  🎉 Mining Complete! 🎉
                </p>
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-green-400/30">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <span className="text-3xl animate-bounce">💎</span>
                    <span className="text-2xl font-bold text-white">{user.currentMiningSession.tokensEarned} HEHE</span>
                    <span className="text-3xl animate-bounce" style={{animationDelay: '0.3s'}}>💎</span>
                  </div>
                  <p className="text-white">Ready to claim your rewards!</p>
                </div>
              </div>
              <button
                onClick={handleClaimTokens}
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-green-500 via-green-600 to-blue-600 hover:from-green-600 hover:via-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-green-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer"></div>
                <span className="relative z-10 text-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Claiming...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="group-hover:animate-bounce">💰</span>
                      <span>Claim Tokens</span>
                      <span className="group-hover:animate-bounce">💰</span>
                    </div>
                  )}
                </span>
              </button>
            </div>
          ) : (
            <div className="animate-slide-up">
              <p className="text-white mb-6 text-lg font-medium">🚀 Ready to mine! 🚀</p>
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-blue-400/30">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <span className="text-2xl animate-pulse">⚡</span>
                  <span className="text-lg font-bold text-white">Mining Power: {user?.miningPower} HEHE/4h</span>
                  <span className="text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>⚡</span>
                </div>
                <p className="text-white">Start your mining session now!</p>
              </div>
              <button
                onClick={handleStartMining}
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-yellow-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer"></div>
                <span className="relative z-10 text-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Starting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="group-hover:animate-bounce">⛏️</span>
                      <span>Start Mining</span>
                      <span className="group-hover:animate-bounce">⛏️</span>
                    </div>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 hover-lift group">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-400 text-xl group-hover:animate-coin-flip">💰</span>
            <p className="text-white font-medium">Total Balance</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {user?.totalBalance?.toFixed(2) || '0.00'} HEHE
          </p>
        </div>
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 hover-lift group">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-400 text-xl group-hover:animate-pulse">⚡</span>
            <p className="text-white font-medium">Mining Power</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {user?.miningPower?.toFixed(2) || '4.00'}/4h
          </p>
        </div>
      </div>
    </div>
  )
}
