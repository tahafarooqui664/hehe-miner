'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AirdropScreen() {
  const { user } = useAuth()

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Airdrop</h2>
        <p className="text-gray-400">Your HEHE token balance and airdrop status</p>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
            <span className="text-2xl">🪂</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-1">Total Balance</h3>
          <p className="text-white/80 text-sm">Your accumulated HEHE tokens</p>
        </div>
        
        <div className="text-4xl font-bold text-white mb-2">
          {user?.totalBalance?.toFixed(2) || '0.00'}
        </div>
        <p className="text-white/80 text-lg">HEHE Tokens</p>
      </div>

      {/* Airdrop Status */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center mb-3">
            <span className="text-xl">⏰</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Airdrop Status</h3>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 font-semibold text-lg">Coming Soon</p>
          </div>
          <p className="text-gray-400 text-sm">
            The HEHE token airdrop is currently in development. 
            Keep mining and completing tasks to maximize your token balance!
          </p>
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <h3 className="text-white font-semibold mb-4">Token Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⛏️</span>
              <span className="text-gray-300">Mining Rewards</span>
            </div>
            <span className="text-white font-medium">
              {/* This would be calculated from mining sessions */}
              {(user?.totalBalance || 0) > 0 ? 'Active' : 'Start Mining'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📋</span>
              <span className="text-gray-300">Task Rewards</span>
            </div>
            <span className="text-white font-medium">Available</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👥</span>
              <span className="text-gray-300">Referral Rewards</span>
            </div>
            <span className="text-white font-medium">0.5 HEHE each</span>
          </div>
        </div>
      </div>

      {/* Airdrop Information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-3">Airdrop Information</h4>
        <div className="space-y-2 text-blue-300 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>All HEHE tokens earned through mining, tasks, and referrals will be eligible for the airdrop</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>The airdrop will convert your HEHE tokens to the official HEHE cryptocurrency</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Keep accumulating tokens to maximize your airdrop allocation</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Follow our social media channels for airdrop announcements</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm mb-3">
          Want to increase your airdrop allocation?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-white font-medium text-sm">Keep Mining</p>
            <p className="text-gray-400 text-xs">Earn 4+ HEHE every 4 hours</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-white font-medium text-sm">Complete Tasks</p>
            <p className="text-gray-400 text-xs">Bonus tokens available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
