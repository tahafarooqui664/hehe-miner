import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Debug: Get total user count and recent users
    const totalUsers = await prisma.user.count()
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('=== USER PROFILE DEBUG ===')
    console.log('Current user:', { id: user.id, telegramId: user.telegramId, username: user.username })
    console.log('Total users in database:', totalUsers)
    console.log('Recent users:', recentUsers)
    console.log('=========================')

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

    const currentMiningSession = userProfile.miningSessions[0]
    let canMine = true
    let timeUntilNextMining = 0

    if (currentMiningSession) {
      const miningDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      const endTime = new Date(currentMiningSession.startTime.getTime() + miningDuration)
      const now = new Date()

      if (now < endTime) {
        canMine = false
        timeUntilNextMining = endTime.getTime() - now.getTime()
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        telegramId: userProfile.telegramId,
        username: userProfile.username,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        totalBalance: userProfile.totalBalance,
        miningPower: userProfile.miningPower,
        hasBasicPlan: userProfile.hasBasicPlan,
        speedUpgrades: userProfile.speedUpgrades,
        canMine,
        timeUntilNextMining,
        currentMiningSession: currentMiningSession ? {
          id: currentMiningSession.id,
          startTime: currentMiningSession.startTime,
          tokensEarned: currentMiningSession.tokensEarned
        } : null
      },
      debug: {
        totalUsers,
        recentUsers: recentUsers.map(u => ({
          id: u.id,
          telegramId: u.telegramId,
          username: u.username,
          firstName: u.firstName,
          createdAt: u.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
