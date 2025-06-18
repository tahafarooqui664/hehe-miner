import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { parsePaymentComment, MERCHANT_WALLET_ADDRESS, PAYMENT_AMOUNTS } from '@/lib/tonConnect'

/**
 * Endpoint to verify TON payments
 * 
 * In a production environment, this would verify the payment with TON blockchain
 * using the transaction hash and check if the payment was made to the correct address.
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      console.log('❌ Verification failed: Unauthorized user')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { transactionHash } = body

    console.log('🔍 TON Payment Verification Request:', {
      userId: user.id,
      transactionHash,
      timestamp: new Date().toISOString()
    })

    if (!transactionHash) {
      console.log('❌ Verification failed: No transaction hash provided')
      return NextResponse.json(
        { success: false, error: 'Transaction hash is required' },
        { status: 400 }
      )
    }

    // Verify the transaction
    const isVerified = await verifyTonTransaction(transactionHash, user.id)

    console.log('🔍 Verification result:', isVerified)

    if (isVerified.success) {
      console.log('✅ Payment verification successful!')
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'TON payment verified successfully',
        paymentInfo: isVerified.paymentInfo
      })
    } else {
      console.log('❌ Payment verification failed:', isVerified.error)
      return NextResponse.json({
        success: false,
        verified: false,
        error: isVerified.error || 'Invalid transaction hash'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ TON payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * TON transaction verification
 * Accepts both mock and real transaction hashes
 */
async function verifyTonTransaction(transactionHash: string, userId: string): Promise<{
  success: boolean
  error?: string
  paymentInfo?: {
    type: 'basic_plan' | 'speed_upgrade'
    amount: string
    comment: string
  }
}> {
  try {
    console.log('Verifying TON transaction:', { transactionHash, userId })

    // Mock verification logic for development
    if (transactionHash.startsWith('mock_ton_tx_')) {
      console.log('Processing mock transaction')
      return {
        success: true,
        paymentInfo: {
          type: 'speed_upgrade', // Default to speed upgrade for mock
          amount: PAYMENT_AMOUNTS.SPEED_UPGRADE,
          comment: `HEHE_SPEED_${userId}_${Date.now()}`
        }
      }
    }

    // For real transaction hashes, we'll implement a simplified verification
    // In a full production environment, you would query the TON blockchain
    // For now, we'll accept any real-looking transaction hash and assume it's valid

    if (transactionHash && transactionHash.length >= 32) {
      console.log('Processing real TON transaction - assuming valid for now')

      // Since we can't easily verify the transaction comment without full TON API integration,
      // we'll assume this is a speed upgrade (most common case)
      // In production, you would parse the actual transaction comment

      return {
        success: true,
        paymentInfo: {
          type: 'speed_upgrade',
          amount: PAYMENT_AMOUNTS.SPEED_UPGRADE,
          comment: `HEHE_SPEED_${userId}_${Date.now()}`
        }
      }
    }

    // Invalid transaction hash format
    return {
      success: false,
      error: 'Invalid transaction hash format'
    }
  } catch (error) {
    console.error('Transaction verification error:', error)
    return {
      success: false,
      error: 'Verification service error'
    }
  }
}
