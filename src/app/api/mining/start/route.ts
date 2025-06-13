import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        miningSessions: {
          where: { isCompleted: false },
          orderBy: { startTime: 'desc' },
          take: 1
        }
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userProfile.hasBasicPlan) {
      return NextResponse.json(
        { success: false, error: 'Basic plan required to start mining' },
        { status: 403 }
      )
    }

    // Check if user already has an active mining session
    const activeMiningSession = userProfile.miningSessions[0]
    if (activeMiningSession) {
      const miningDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      const endTime = new Date(activeMiningSession.startTime.getTime() + miningDuration)
      const now = new Date()

      if (now < endTime) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Mining session already active',
            timeUntilNextMining: endTime.getTime() - now.getTime()
          },
          { status: 400 }
        )
      }
    }

    // Start new mining session
    const miningSession = await prisma.miningSession.create({
      data: {
        userId: user.id,
        startTime: new Date(),
        tokensEarned: userProfile.miningPower
      }
    })

    return NextResponse.json({
      success: true,
      miningSession: {
        id: miningSession.id,
        startTime: miningSession.startTime,
        tokensEarned: miningSession.tokensEarned,
        duration: 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      }
    })
  } catch (error) {
    console.error('Mining start error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
