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

    if (userProfile.hasBasicPlan) {
      return NextResponse.json(
        { success: false, error: 'User already has basic plan' },
        { status: 400 }
      )
    }

    // Check if user has an active mining session (shouldn't happen for basic plan, but good to check)
    const activeMiningSession = userProfile.miningSessions[0]
    if (activeMiningSession) {
      const miningDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      const endTime = new Date(activeMiningSession.startTime.getTime() + miningDuration)
      const now = new Date()

      if (now < endTime) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot activate plan during active mining session. Please wait for mining to complete first.',
            timeUntilMiningComplete: endTime.getTime() - now.getTime()
          },
          { status: 400 }
        )
      }
    }

    // Activate basic plan for free
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        hasBasicPlan: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Basic plan activated successfully',
      user: {
        id: updatedUser.id,
        hasBasicPlan: updatedUser.hasBasicPlan,
        miningPower: updatedUser.miningPower
      }
    })
  } catch (error) {
    console.error('Basic plan activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
