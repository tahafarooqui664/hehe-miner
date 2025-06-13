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

    const { sessionId } = await request.json()

    const miningSession = await prisma.miningSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
        isCompleted: false
      }
    })

    if (!miningSession) {
      return NextResponse.json(
        { success: false, error: 'Mining session not found or already completed' },
        { status: 404 }
      )
    }

    // Check if 4 hours have passed
    const miningDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
    const endTime = new Date(miningSession.startTime.getTime() + miningDuration)
    const now = new Date()

    if (now < endTime) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mining not completed yet',
          timeRemaining: endTime.getTime() - now.getTime()
        },
        { status: 400 }
      )
    }

    // Update mining session and user balance
    const [updatedSession, updatedUser] = await prisma.$transaction([
      prisma.miningSession.update({
        where: { id: sessionId },
        data: {
          isCompleted: true,
          endTime: now
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalBalance: {
            increment: miningSession.tokensEarned
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      tokensEarned: miningSession.tokensEarned,
      newBalance: updatedUser.totalBalance
    })
  } catch (error) {
    console.error('Mining claim error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
