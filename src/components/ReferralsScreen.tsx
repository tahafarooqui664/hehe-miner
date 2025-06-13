'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

interface Referral {
  id: string
  reward: number
  createdAt: string
  referred: {
    username?: string
    firstName?: string
    lastName?: string
    joinedAt: string
  }
}

interface ReferralStats {
  totalReferrals: number
  totalRewards: number
}

export default function ReferralsScreen() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, totalRewards: 0 })
  const [referralLink, setReferralLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const response = await apiClient.getReferrals()
      if (response.success) {
        setReferrals(response.referrals)
        setStats(response.stats)
        setReferralLink(response.referralLink)
      } else {
        setError(response.error || 'Failed to fetch referrals')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading referrals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Referrals</h2>
        <p className="text-gray-400">Invite friends and earn 0.5 HEHE per referral</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Referral Link */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
        <h3 className="text-white font-semibold mb-3">Your Referral Link</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Share this link with friends to earn 0.5 HEHE tokens for each signup
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Total Referrals</p>
          <p className="text-white text-2xl font-bold">{stats.totalReferrals}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Total Earned</p>
          <p className="text-yellow-400 text-2xl font-bold">{stats.totalRewards.toFixed(1)}</p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Recent Referrals</h3>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {referrals.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-400">No referrals yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Start sharing your referral link to earn rewards!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {referral.referred.firstName} {referral.referred.lastName}
                      {referral.referred.username && (
                        <span className="text-gray-400 ml-1">
                          (@{referral.referred.username})
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Joined {formatDate(referral.referred.joinedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">
                      +{referral.reward} HEHE
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(referral.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">How Referrals Work</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Share your unique referral link</li>
          <li>• When someone signs up using your link, you both benefit</li>
          <li>• You earn 0.5 HEHE tokens for each successful referral</li>
          <li>• No limit on the number of referrals you can make</li>
        </ul>
      </div>
    </div>
  )
}
