'use client'

import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useState, useEffect } from 'react'

interface TonWalletButtonProps {
  onWalletConnected?: (address: string) => void
  onWalletDisconnected?: () => void
}

export default function TonWalletButton({ onWalletConnected, onWalletDisconnected }: TonWalletButtonProps) {
  const address = useTonAddress()
  const [tonConnectUI] = useTonConnectUI()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (address && !isConnected) {
      setIsConnected(true)
      onWalletConnected?.(address)
    } else if (!address && isConnected) {
      setIsConnected(false)
      onWalletDisconnected?.()
    }
  }, [address, isConnected, onWalletConnected, onWalletDisconnected])

  const formatAddress = (addr: string) => {
    if (addr.length <= 8) return addr
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {address ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
            <p className="text-blue-400 text-sm font-medium">
              Connected: {formatAddress(address)}
            </p>
          </div>
          <button
            onClick={() => tonConnectUI.disconnect()}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <TonConnectButton />
          <p className="text-gray-400 text-xs text-center">
            Connect your TON wallet to make payments
          </p>
        </div>
      )}
    </div>
  )
}

export function TonWalletStatus() {
  const address = useTonAddress()
  
  if (!address) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
        <p className="text-yellow-400 text-sm">
          ⚠️ Connect your TON wallet to make purchases
        </p>
      </div>
    )
  }

  return (
    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
      <p className="text-green-400 text-sm">
        ✅ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
      </p>
    </div>
  )
}
