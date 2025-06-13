'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { useTonPayment, mockTonPayment, verifyTonPayment } from '@/lib/tonPayments'
import { triggerHapticFeedback } from '@/lib/telegram'
import { formatTonAmount, PAYMENT_AMOUNTS, generatePaymentComment } from '@/lib/tonConnect'
import TonWalletButton, { TonWalletStatus } from './TonWalletButton'
import { useTonAddress } from '@tonconnect/ui-react'

export default function SubscriptionScreen() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { sendPayment, isConnected } = useTonPayment()
  const walletAddress = useTonAddress()

  const handleActivateBasicPlan = async () => {
    setPurchasingPlan('basic')
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.activateBasicPlan();

      if (response.success) {
        triggerHapticFeedback('notification', 'success');
        setSuccess('Basic plan activated successfully! You can now start mining.');
        updateUser({ hasBasicPlan: true });
      } else {
        triggerHapticFeedback('notification', 'error');
        setError(response.error || 'Failed to activate basic plan');
      }
    } catch (error) {
      triggerHapticFeedback('notification', 'error');
      setError('Activation error occurred');
      console.error('Activation error:', error);
    } finally {
      setIsLoading(false)
      setPurchasingPlan(null)
    }
  }

  const handlePurchaseSpeedUpgrade = async () => {
    if (!walletAddress) {
      setError('Please connect your TON wallet first')
      return
    }

    setPurchasingPlan('speed')
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Generate payment comment for tracking
      const paymentComment = generatePaymentComment('speed_upgrade', user?.id || '')

      // Initiate TON payment
      const paymentResult = isConnected
        ? await sendPayment({
            type: 'speed_upgrade',
            userId: user?.id || '',
            title: 'Speed Upgrade',
            description: 'Increase your mining power by 0.25 HEHE per 4 hours'
          })
        : await mockTonPayment({
            type: 'speed_upgrade',
            userId: user?.id || '',
            title: 'Speed Upgrade',
            description: 'Increase your mining power by 0.25 HEHE per 4 hours'
          });

      if (paymentResult.success && paymentResult.transactionHash) {
        // Verify payment on the server
        const verificationResult = await verifyTonPayment(paymentResult.transactionHash);

        if (verificationResult.verified) {
          // Complete the purchase on the server
          const response = await apiClient.purchaseSpeedUpgrade({
            transactionHash: paymentResult.transactionHash,
            paymentMethod: 'ton',
            paymentComment
          });

          if (response.success) {
            triggerHapticFeedback('notification', 'success');
            setSuccess('Speed upgrade purchased! Your mining power has increased.');
            updateUser({
              miningPower: response.user.miningPower,
              speedUpgrades: response.user.speedUpgrades
            });
          } else {
            triggerHapticFeedback('notification', 'error');
            setError(response.error || 'Failed to complete speed upgrade purchase');
          }
        } else {
          triggerHapticFeedback('notification', 'error');
          setError('Payment verification failed. Please try again.');
        }
      } else {
        triggerHapticFeedback('notification', 'error');
        setError(paymentResult.error || 'Payment was cancelled or failed');
      }
    } catch (error) {
      triggerHapticFeedback('notification', 'error');
      setError('Payment processing error occurred');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false)
      setPurchasingPlan(null)
    }
  }

  // Check if user has active mining session
  const hasActiveMining = user?.currentMiningSession && user?.canMine === false
  const isUpgradeDisabled = hasActiveMining || (isLoading && purchasingPlan === 'speed')

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Upgrades</h2>
        <p className="text-gray-400">Enhance your mining capabilities</p>
      </div>

      {/* TON Wallet Connection - Only show if user has basic plan for speed upgrades */}
      {user?.hasBasicPlan && (
        <div className="mb-6">
          <TonWalletStatus />
          <div className="mt-3">
            <TonWalletButton />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Current Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Plan Status</span>
            <span className={`font-medium ${user?.hasBasicPlan ? 'text-green-400' : 'text-red-400'}`}>
              {user?.hasBasicPlan ? 'Basic Plan Active' : 'No Plan'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Mining Power</span>
            <span className="text-white font-medium">
              {user?.miningPower?.toFixed(2) || '4.00'} HEHE/4h
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Speed Upgrades</span>
            <span className="text-white font-medium">
              {user?.speedUpgrades || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Basic Plan */}
      {!user?.hasBasicPlan && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
              <span className="text-xl">⛏️</span>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Basic Mining Plan</h3>
            <p className="text-white/80 text-sm mb-4">
              Unlock the ability to mine HEHE tokens
            </p>

            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">🎉</span>
                <p className="text-white font-semibold text-lg">FREE</p>
              </div>
              <p className="text-white/80 text-sm">Activate your basic plan now</p>
            </div>

            <div className="text-left mb-4">
              <h4 className="text-white font-semibold mb-2">Includes:</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Mine 4 HEHE tokens every 4 hours</li>
                <li>• Access to all tasks and referrals</li>
                <li>• Eligible for future airdrops</li>
                <li>• Ability to purchase speed upgrades</li>
              </ul>
            </div>

            <button
              onClick={handleActivateBasicPlan}
              disabled={isLoading && purchasingPlan === 'basic'}
              className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && purchasingPlan === 'basic'
                ? 'Activating...'
                : 'Activate Basic Plan'
              }
            </button>
          </div>
        </div>
      )}

      {/* Speed Upgrades */}
      {user?.hasBasicPlan && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center mb-3">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Speed Upgrade</h3>
            <p className="text-gray-400 text-sm mb-4">
              Increase your mining power by 0.25 HEHE per 4 hours
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">💎</span>
                <p className="text-yellow-400 font-semibold text-lg">{formatTonAmount(PAYMENT_AMOUNTS.SPEED_UPGRADE)}</p>
              </div>
              <p className="text-yellow-300 text-sm">Per upgrade via TON wallet</p>
            </div>

            <div className="text-left mb-4">
              <h4 className="text-white font-semibold mb-2">Upgrade Details:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• +0.25 HEHE tokens per 4-hour cycle</li>
                <li>• Permanent increase to mining power</li>
                <li>• No limit on number of upgrades</li>
                <li>• Compounds with existing upgrades</li>
              </ul>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-sm">
                Current: {user?.miningPower?.toFixed(2)} HEHE/4h
              </p>
              <p className="text-white text-sm">
                After upgrade: {((user?.miningPower || 4) + 0.25).toFixed(2)} HEHE/4h
              </p>
            </div>

            {hasActiveMining && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                <p className="text-orange-400 text-sm">
                  ⚠️ Cannot purchase upgrades during active mining session. Complete your current mining first.
                </p>
              </div>
            )}

            <button
              onClick={handlePurchaseSpeedUpgrade}
              disabled={!walletAddress || isUpgradeDisabled}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
                !walletAddress || isUpgradeDisabled
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isLoading && purchasingPlan === 'speed'
                ? 'Processing...'
                : !walletAddress
                  ? 'Connect Wallet First'
                  : hasActiveMining
                    ? 'Mining in Progress - Upgrade Locked'
                    : 'Purchase Speed Upgrade'
              }
            </button>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">ℹ️ Plan Information</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Basic plan is completely free - no payment required</li>
          <li>• Speed upgrades require TON wallet connection and payment</li>
          <li>• Speed upgrades stack - buy multiple for even faster mining</li>
          <li>• All upgrades are permanent and apply to all future mining sessions</li>
          {user?.hasBasicPlan && (
            <>
              <li>• Connect any TON wallet (Tonkeeper, MyTonWallet, etc.)</li>
              <li>• Your wallet address: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
