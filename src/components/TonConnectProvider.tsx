'use client'

import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { ReactNode } from 'react'

interface TonConnectProviderProps {
  children: ReactNode
}

const manifestUrl = 'https://hehe-miner.vercel.app/tonconnect-manifest.json'

export default function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
    >
      {children}
    </TonConnectUIProvider>
  )
}
