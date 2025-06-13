import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('=== TELEGRAM DEBUG INFO ===')
    console.log('Request body:', JSON.stringify(body, null, 2))
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    console.log('Environment variables:')
    console.log('- TELEGRAM_BOT_TOKEN exists:', !!process.env.TELEGRAM_BOT_TOKEN)
    console.log('- ENABLE_MOCK_AUTH:', process.env.ENABLE_MOCK_AUTH)
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('=========================')

    return NextResponse.json({
      success: true,
      debug: {
        receivedData: body,
        environment: {
          hasBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
          enableMockAuth: process.env.ENABLE_MOCK_AUTH,
          nodeEnv: process.env.NODE_ENV
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram Debug Endpoint',
    environment: {
      hasBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
      enableMockAuth: process.env.ENABLE_MOCK_AUTH,
      nodeEnv: process.env.NODE_ENV
    }
  })
}
