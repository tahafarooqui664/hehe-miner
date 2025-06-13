'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import MiningScreen from './MiningScreen'
import TasksScreen from './TasksScreen'
import ReferralsScreen from './ReferralsScreen'
import AirdropScreen from './AirdropScreen'
import SubscriptionScreen from './SubscriptionScreen'

type Screen = 'mining' | 'tasks' | 'referrals' | 'airdrop' | 'subscription'

export default function MainApp() {
  const { user, updateUser } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('mining')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    console.log('🔍 MainApp: Fetching user profile...')
    try {
      console.log('🔍 MainApp: Making API call to getUserProfile')
      const response = await apiClient.getUserProfile()
      console.log('🔍 MainApp: Profile response:', response)

      if (response.success) {
        console.log('✅ MainApp: Profile fetch successful, updating user')
        updateUser(response.user)
      } else {
        console.error('❌ MainApp: Profile fetch failed:', response.error)
      }
    } catch (error) {
      console.error('❌ MainApp: Failed to fetch user profile:', error)
    } finally {
      console.log('🔍 MainApp: Setting loading to false')
      setIsLoading(false)
    }
  }



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'mining':
        return <MiningScreen />
      case 'tasks':
        return <TasksScreen />
      case 'referrals':
        return <ReferralsScreen />
      case 'airdrop':
        return <AirdropScreen />
      case 'subscription':
        return <SubscriptionScreen />
      default:
        return <MiningScreen />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-60 right-10 w-2 h-2 bg-green-400 rounded-full animate-float opacity-70" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-dark border-b border-white/10 px-4 py-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse-glow">
                <span className="text-lg animate-float">⛏️</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Hehe Miner
              </h1>
              <p className="text-sm text-gray-300 font-medium">
                Welcome, {user?.firstName} {user?.lastName} ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right glass rounded-lg p-3 hover-lift">
              <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-coin-flip">
                {user?.totalBalance?.toFixed(2) || '0.00'} HEHE
              </p>
              <p className="text-xs text-gray-300">
                ⚡ Power: {user?.miningPower?.toFixed(2) || '4.00'}/4h
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-24 pt-4">
        <div className="animate-slide-up">
          {renderScreen()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 glass-dark border-t border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-around py-3 px-2">
          <button
            onClick={() => setCurrentScreen('mining')}
            className={`group flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              currentScreen === 'mining'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentScreen === 'mining' ? 'animate-mining-pulse' : 'group-hover:animate-bounce'}`}>⛏️</span>
            <span className="text-xs font-semibold">Mine</span>
            {currentScreen === 'mining' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
          </button>

          <button
            onClick={() => setCurrentScreen('tasks')}
            className={`group flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              currentScreen === 'tasks'
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentScreen === 'tasks' ? 'animate-pulse' : 'group-hover:animate-bounce'}`}>📋</span>
            <span className="text-xs font-semibold">Tasks</span>
            {currentScreen === 'tasks' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
          </button>

          <button
            onClick={() => setCurrentScreen('referrals')}
            className={`group flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              currentScreen === 'referrals'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentScreen === 'referrals' ? 'animate-pulse' : 'group-hover:animate-bounce'}`}>👥</span>
            <span className="text-xs font-semibold">Referrals</span>
            {currentScreen === 'referrals' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
          </button>

          <button
            onClick={() => setCurrentScreen('airdrop')}
            className={`group flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              currentScreen === 'airdrop'
                ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg shadow-green-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentScreen === 'airdrop' ? 'animate-float' : 'group-hover:animate-bounce'}`}>🪂</span>
            <span className="text-xs font-semibold">Airdrop</span>
            {currentScreen === 'airdrop' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
          </button>

          <button
            onClick={() => setCurrentScreen('subscription')}
            className={`group flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              currentScreen === 'subscription'
                ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentScreen === 'subscription' ? 'animate-pulse' : 'group-hover:animate-bounce'}`}>⚡</span>
            <span className="text-xs font-semibold">Upgrade</span>
            {currentScreen === 'subscription' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
          </button>
        </div>
      </nav>
    </div>
  )
}
