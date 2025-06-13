/**
 * TON Connect Integration
 * 
 * This file contains utilities for integrating with TON wallets using TON Connect 2.0
 */

import { Address, beginCell, toNano } from '@ton/core'

// Your TON wallet address for receiving payments
export const MERCHANT_WALLET_ADDRESS = 'UQB5SucbE_v2p08QI7bVx5EBvIeDS6SMEmG05m7zqLkjEI9j'

// Payment amounts in TON
export const PAYMENT_AMOUNTS = {
  BASIC_PLAN: '0.1', // 0.1 TON
  SPEED_UPGRADE: '0.1' // 0.1 TON
} as const

export interface TonPaymentOptions {
  amount: string
  comment: string
  validUntil?: number
}

/**
 * Creates a TON payment transaction
 */
export function createTonPayment(options: TonPaymentOptions) {
  const { amount, comment, validUntil } = options
  
  // Create comment cell
  const commentCell = beginCell()
    .storeUint(0, 32) // Text comment opcode
    .storeStringTail(comment)
    .endCell()

  return {
    validUntil: validUntil || Math.floor(Date.now() / 1000) + 600, // 10 minutes
    messages: [
      {
        address: MERCHANT_WALLET_ADDRESS,
        amount: toNano(amount).toString(),
        payload: commentCell.toBoc().toString('base64')
      }
    ]
  }
}

/**
 * Validates a TON address
 */
export function isValidTonAddress(address: string): boolean {
  try {
    Address.parse(address)
    return true
  } catch {
    return false
  }
}

/**
 * Formats TON amount for display
 */
export function formatTonAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${num.toFixed(2)} TON`
}

/**
 * Generates a unique payment comment for tracking
 */
export function generatePaymentComment(type: 'basic_plan' | 'speed_upgrade', userId: string): string {
  const timestamp = Date.now()
  return `HEHE_${type.toUpperCase()}_${userId}_${timestamp}`
}

/**
 * Parses payment comment to extract payment info
 */
export function parsePaymentComment(comment: string): {
  type: 'basic_plan' | 'speed_upgrade' | null
  userId: string | null
  timestamp: number | null
} {
  const parts = comment.split('_')
  
  if (parts.length !== 4 || parts[0] !== 'HEHE') {
    return { type: null, userId: null, timestamp: null }
  }
  
  const type = parts[1].toLowerCase() as 'basic_plan' | 'speed_upgrade'
  const userId = parts[2]
  const timestamp = parseInt(parts[3])
  
  if (!['basic', 'speed'].includes(parts[1].toLowerCase()) || !userId || isNaN(timestamp)) {
    return { type: null, userId: null, timestamp: null }
  }
  
  return {
    type: parts[1].toLowerCase() === 'basic' ? 'basic_plan' : 'speed_upgrade',
    userId,
    timestamp
  }
}
