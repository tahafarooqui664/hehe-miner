/**
 * TON Payment Integration
 * 
 * This file contains utilities for processing TON payments
 */

import { useTonConnectUI } from '@tonconnect/ui-react'
import { createTonPayment, generatePaymentComment, PAYMENT_AMOUNTS } from './tonConnect'

export interface TonPaymentOptions {
  type: 'basic_plan' | 'speed_upgrade'
  userId: string
  title: string
  description: string
}

export interface TonPaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

/**
 * Initiates a TON payment using TON Connect
 */
export async function initiateTonPayment(
  tonConnectUI: any,
  options: TonPaymentOptions
): Promise<TonPaymentResult> {
  try {
    if (!tonConnectUI) {
      return {
        success: false,
        error: 'TON Connect UI not available'
      }
    }

    // Get payment amount based on type
    const amount = options.type === 'basic_plan' 
      ? PAYMENT_AMOUNTS.BASIC_PLAN 
      : PAYMENT_AMOUNTS.SPEED_UPGRADE

    // Generate unique comment for tracking
    const comment = generatePaymentComment(options.type, options.userId)

    // Create payment transaction
    const transaction = createTonPayment({
      amount,
      comment,
      validUntil: Math.floor(Date.now() / 1000) + 600 // 10 minutes
    })

    console.log('Sending TON transaction:', {
      amount,
      comment,
      transaction
    })

    // Send transaction
    const result = await tonConnectUI.sendTransaction(transaction)
    
    if (result && result.boc) {
      // Extract transaction hash from BOC
      const transactionHash = extractTransactionHash(result.boc)
      
      return {
        success: true,
        transactionHash
      }
    } else {
      return {
        success: false,
        error: 'Transaction failed or was cancelled'
      }
    }
  } catch (error) {
    console.error('TON payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment error'
    }
  }
}

/**
 * Extracts transaction hash from BOC (simplified)
 * In a real implementation, you would properly parse the BOC
 */
function extractTransactionHash(boc: string): string {
  // This is a simplified hash generation
  // In production, you should properly parse the BOC to get the actual transaction hash
  const hash = Buffer.from(boc, 'base64').toString('hex').slice(0, 64)
  return hash
}

/**
 * Verifies a TON payment on the server
 */
export async function verifyTonPayment(transactionHash: string): Promise<{
  success: boolean
  verified: boolean
  error?: string
}> {
  try {
    const response = await fetch('/api/subscription/verify-ton-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionHash })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('TON payment verification error:', error)
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    }
  }
}

/**
 * Hook for TON payments
 */
export function useTonPayment() {
  const [tonConnectUI] = useTonConnectUI()

  const sendPayment = async (options: TonPaymentOptions): Promise<TonPaymentResult> => {
    return initiateTonPayment(tonConnectUI, options)
  }

  return {
    sendPayment,
    isConnected: tonConnectUI?.connected || false
  }
}

// Mock implementation for development/testing
export function mockTonPayment(options: TonPaymentOptions): Promise<TonPaymentResult> {
  return new Promise((resolve) => {
    console.log('MOCK TON PAYMENT:', options)
    
    // Simulate payment processing
    setTimeout(() => {
      // 90% success rate for testing
      if (Math.random() < 0.9) {
        resolve({
          success: true,
          transactionHash: `mock_ton_tx_${Date.now()}`
        })
      } else {
        resolve({
          success: false,
          error: 'Mock TON payment failed'
        })
      }
    }, 2000) // Longer delay to simulate blockchain confirmation
  })
}
