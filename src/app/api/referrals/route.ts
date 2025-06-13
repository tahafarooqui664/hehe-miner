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

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalReferrals = referrals.length
    const totalRewards = referrals.reduce((sum, ref) => sum + ref.reward, 0)

    return NextResponse.json({
      success: true,
      referrals: referrals.map(ref => ({
        id: ref.id,
        reward: ref.reward,
        createdAt: ref.createdAt,
        referred: {
          username: ref.referred.username,
          firstName: ref.referred.firstName,
          lastName: ref.referred.lastName,
          joinedAt: ref.referred.createdAt
        }
      })),
      stats: {
        totalReferrals,
        totalRewards
      },
      referralLink: `https://t.me/HeheMinerBot?start=${user.telegramId}`
    })
  } catch (error) {
    console.error('Referrals fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { referredTelegramId } = await request.json()

    // Find the referred user
    const referredUser = await prisma.user.findUnique({
      where: { telegramId: referredTelegramId }
    })

    if (!referredUser) {
      return NextResponse.json(
        { success: false, error: 'Referred user not found' },
        { status: 404 }
      )
    }

    if (referredUser.id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot refer yourself' },
        { status: 400 }
      )
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: user.id,
          referredId: referredUser.id
        }
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { success: false, error: 'User already referred' },
        { status: 400 }
      )
    }

    // Create referral and update referrer balance
    const referralReward = 0.5
    const [referral, updatedUser] = await prisma.$transaction([
      prisma.referral.create({
        data: {
          referrerId: user.id,
          referredId: referredUser.id,
          reward: referralReward
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalBalance: {
            increment: referralReward
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Referral successful',
      reward: referralReward,
      newBalance: updatedUser.totalBalance
    })
  } catch (error) {
    console.error('Referral creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
