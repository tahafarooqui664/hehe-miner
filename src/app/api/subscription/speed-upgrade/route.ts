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

    // Get transaction data from request body if provided
    const body = await request.json().catch(() => ({}))
    const { transactionId, transactionHash, paymentMethod = 'ton', paymentComment } = body

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
        { success: false, error: 'Basic plan required for speed upgrades' },
        { status: 403 }
      )
    }

    // Check if user has an active mining session
    const activeMiningSession = userProfile.miningSessions[0]
    if (activeMiningSession) {
      const miningDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      const endTime = new Date(activeMiningSession.startTime.getTime() + miningDuration)
      const now = new Date()

      if (now < endTime) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot purchase upgrades during active mining session. Please wait for mining to complete or claim your tokens first.',
            timeUntilMiningComplete: endTime.getTime() - now.getTime()
          },
          { status: 400 }
        )
      }
    }

    // Each speed upgrade costs $1 and increases mining power by 0.25
    const speedUpgradeValue = 0.25
    const newMiningPower = userProfile.miningPower + speedUpgradeValue
    const newSpeedUpgrades = userProfile.speedUpgrades + 1

    // In a real app, you would integrate with a payment processor here
    // For now, we'll simulate the purchase
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        miningPower: newMiningPower,
        speedUpgrades: newSpeedUpgrades
      }
    })

    // Create subscription record
    await prisma.subscription.create({
      data: {
        userId: user.id,
        upgradeType: 'speed',
        amount: paymentMethod === 'ton' ? 0.1 : 1.0, // 0.1 TON or $1.0 for Stars
        upgradeValue: speedUpgradeValue,
        transactionId: transactionId || null,
        transactionHash: transactionHash || null,
        paymentMethod: paymentMethod,
        paymentComment: paymentComment || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Speed upgrade purchased successfully',
      user: {
        id: updatedUser.id,
        miningPower: updatedUser.miningPower,
        speedUpgrades: updatedUser.speedUpgrades
      }
    })
  } catch (error) {
    console.error('Speed upgrade purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
