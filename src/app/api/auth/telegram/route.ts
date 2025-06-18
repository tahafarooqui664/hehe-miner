import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { validateTelegramAuth, isTelegramAuthExpired, TelegramUser } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🚨🚨🚨 AUTH REQUEST RECEIVED 🚨🚨🚨')
    console.log('🔍 Full request body:', JSON.stringify(body, null, 2))
    console.log('🔍 Body keys:', Object.keys(body))
    console.log('🔍 Has referralId:', !!body.referralId)
    console.log('🔍 Has ref:', !!body.ref)
    console.log('🔍 Has initData:', !!body.initData)

    // ONLY allow mock authentication in development with explicit mock flag
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_AUTH === 'true' && body.mock === true) {
      console.log('🔧 Using mock authentication for development')

      // Check for referral in mock auth too
      const referralId = body.referralId || body.ref
      console.log('🔧 Mock auth referral ID:', referralId)

      let user = await prisma.user.findUnique({
        where: { telegramId: 'mock-telegram-id' }
      })

      if (!user) {
        // Create mock user in transaction to handle referral
        const result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              telegramId: 'mock-telegram-id',
              username: 'mock_user',
              firstName: 'Mock',
              lastName: 'User',
              hasBasicPlan: true
            }
          })

          // Handle referral for mock user if provided
          if (referralId) {
            console.log('🔧 Processing mock referral:', referralId)
            const referrer = await tx.user.findUnique({
              where: { telegramId: referralId }
            })

            if (referrer && referrer.id !== newUser.id) {
              const referralReward = 0.5
              await tx.referral.create({
                data: {
                  referrerId: referrer.id,
                  referredId: newUser.id,
                  reward: referralReward
                }
              })

              await tx.user.update({
                where: { id: referrer.id },
                data: {
                  totalBalance: {
                    increment: referralReward
                  }
                }
              })

              console.log('🔧 Mock referral created successfully')
            }
          }

          return newUser
        })
        user = result
      }

      const token = generateToken({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username || undefined
      })

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          totalBalance: user.totalBalance,
          miningPower: user.miningPower,
          hasBasicPlan: user.hasBasicPlan
        }
      })
    }

    // Handle Telegram Web App authentication
    let telegramData: TelegramUser

    // Check if this is initData from Telegram Web App
    if (body.initData) {
      console.log('Processing Telegram Web App initData')
      console.log('🚨 RAW INITDATA:', body.initData)

      // Parse initData from Telegram Web App
      const urlParams = new URLSearchParams(body.initData)
      const userParam = urlParams.get('user')
      const authDate = urlParams.get('auth_date')
      const hash = urlParams.get('hash')
      const startParam = urlParams.get('start_param')

      console.log('🚨 INITDATA PARSED:')
      console.log('  - user:', userParam)
      console.log('  - auth_date:', authDate)
      console.log('  - hash:', hash)
      console.log('  - start_param:', startParam)
      console.log('  - ALL PARAMS:', Array.from(urlParams.entries()))

      if (!userParam || !authDate || !hash) {
        return NextResponse.json(
          { success: false, error: 'Invalid Telegram Web App data' },
          { status: 401 }
        )
      }

      const userData = JSON.parse(userParam)
      telegramData = {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        auth_date: parseInt(authDate),
        hash: hash
      }

      // Extract start_param from initData and use as referral ID
      if (startParam) {
        body.referralId = startParam
        console.log('🚨 FOUND REFERRAL IN START_PARAM:', startParam)
      } else {
        console.log('🚨 NO START_PARAM FOUND IN INITDATA')
      }
    } else {
      // Direct user data
      telegramData = body as TelegramUser
    }

    console.log('Telegram data:', telegramData)

    // Check if we have basic required data
    if (!telegramData || !telegramData.id) {
      console.log('❌ Missing required Telegram data:', {
        hasData: !!telegramData,
        hasId: telegramData?.id,
        data: telegramData
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Missing user data. Please ensure you opened this app from Telegram Web App.',
          debug: {
            hasData: !!telegramData,
            hasId: telegramData?.id,
            receivedKeys: telegramData ? Object.keys(telegramData) : []
          }
        },
        { status: 401 }
      )
    }

    // Validate Telegram authentication
    const isValidAuth = validateTelegramAuth(telegramData)
    if (!isValidAuth) {
      console.log('❌ Telegram auth validation failed for user:', telegramData.id)
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram authentication. Please try again or contact support.' },
        { status: 401 }
      )
    }

    // Check if auth is expired (but be lenient)
    if (telegramData.auth_date && isTelegramAuthExpired(telegramData.auth_date)) {
      console.log('⚠️ Telegram auth expired for user:', telegramData.id, 'but allowing anyway')
      // Don't reject expired auth in production - just log it
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          { success: false, error: 'Authentication expired. Please refresh and try again.' },
          { status: 401 }
        )
      }
    }

    // Find or create user
    const telegramIdString = telegramData.id.toString()
    console.log('Looking for user with telegramId:', telegramIdString)

    let user = await prisma.user.findUnique({
      where: { telegramId: telegramIdString }
    })

    console.log('Existing user found:', !!user)

    // Check for referral information - EXTRACT FROM MULTIPLE SOURCES
    let referralId = body.referralId || body.ref
    console.log('🚨 REFERRAL EXTRACTION:')
    console.log('  - body.referralId:', body.referralId)
    console.log('  - body.ref:', body.ref)
    console.log('  - Initial referralId:', referralId)

    // Check for pending referral in database
    if (!referralId) {
      try {
        const pendingReferral = await prisma.pendingReferral.findUnique({
          where: { telegramId: telegramIdString }
        })
        if (pendingReferral) {
          referralId = pendingReferral.referrerId
          console.log('🚨 FOUND PENDING REFERRAL IN DATABASE:', referralId)

          // Delete the pending referral since we're using it now
          await prisma.pendingReferral.delete({
            where: { telegramId: telegramIdString }
          })
          console.log('🚨 DELETED PENDING REFERRAL FROM DATABASE')
        } else {
          console.log('🚨 NO PENDING REFERRAL FOUND IN DATABASE')
        }
      } catch (error) {
        console.error('🚨 Error checking pending referral:', error)
      }
    }

    if (!user) {
      console.log('Creating new user with data:', {
        telegramId: telegramIdString,
        username: telegramData.username,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        referralId: referralId
      })

      try {
        // Create user in a transaction to handle referral
        const result = await prisma.$transaction(async (tx) => {
          // Create the new user with basic plan automatically activated
          const newUser = await tx.user.create({
            data: {
              telegramId: telegramIdString,
              username: telegramData.username,
              firstName: telegramData.first_name,
              lastName: telegramData.last_name,
              hasBasicPlan: true
            }
          })

          // If there's a referral ID, create the referral relationship
          if (referralId) {
            console.log('🚨 PROCESSING REFERRAL FOR NEW USER:', referralId)

            // Find the referrer
            const referrer = await tx.user.findUnique({
              where: { telegramId: referralId }
            })

            console.log('🔍 Referrer lookup result:', referrer ? `Found: ${referrer.firstName} (${referrer.telegramId})` : 'Not found')

            if (referrer && referrer.id !== newUser.id) {
              console.log('🚨 CREATING REFERRAL RELATIONSHIP:', {
                referrerId: referrer.id,
                referredId: newUser.id,
                referrerName: referrer.firstName,
                referredName: newUser.firstName
              })

              // Create referral record
              const referralReward = 0.5
              const referralRecord = await tx.referral.create({
                data: {
                  referrerId: referrer.id,
                  referredId: newUser.id,
                  reward: referralReward
                }
              })

              console.log('🚨 REFERRAL RECORD CREATED:', referralRecord.id)

              // Update referrer's balance
              const updatedReferrer = await tx.user.update({
                where: { id: referrer.id },
                data: {
                  totalBalance: {
                    increment: referralReward
                  }
                }
              })

              console.log(`🚨🚨🚨 REFERRAL SUCCESS! ${referrer.firstName} earned ${referralReward} tokens for referring ${newUser.firstName}`)
              console.log(`🚨 Referrer new balance: ${updatedReferrer.totalBalance}`)
            } else {
              console.log('🚨❌ REFERRAL FAILED:', referrer ? 'Self-referral attempted' : 'Referrer not found', referralId)
            }
          } else {
            console.log('🚨 NO REFERRAL ID PROVIDED')
          }

          return newUser
        })

        user = result
        console.log('User created successfully:', {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName
        })
      } catch (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }
    } else {
      console.log('Using existing user:', {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName
      })
    }

    const token = generateToken({
      id: user.id,
      telegramId: user.telegramId,
      username: user.username || undefined
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        totalBalance: user.totalBalance,
        miningPower: user.miningPower,
        hasBasicPlan: user.hasBasicPlan
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
