import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, firstName, lastName, username } = await request.json()
    
    console.log('🔧 Creating user with:', { telegramId, firstName, lastName, username })
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { telegramId: telegramId.toString() }
    })
    
    if (user) {
      console.log('✅ User already exists:', user.id)
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegramId: telegramId.toString(),
          username: username || `user_${telegramId}`,
          firstName: firstName || 'Telegram',
          lastName: lastName || 'User',
          hasBasicPlan: true
        }
      })
      console.log('✅ Created new user:', user.id)
    }
    
    // Generate token
    const token = generateToken({
      id: user.id,
      telegramId: user.telegramId,
      username: user.username || undefined
    })
    
    return NextResponse.json({
      success: true,
      message: 'User created/found successfully',
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        totalBalance: user.totalBalance,
        miningPower: user.miningPower,
        hasBasicPlan: user.hasBasicPlan
      },
      token
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
