import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== USERS DEBUG INFO ===')
    
    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 // Get last 10 users
    })
    
    console.log('Total users found:', users.length)
    console.log('Users:', users.map(u => ({
      id: u.id,
      telegramId: u.telegramId,
      username: u.username,
      firstName: u.firstName,
      createdAt: u.createdAt
    })))
    
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test:', dbTest)
    
    console.log('========================')

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        totalBalance: user.totalBalance,
        miningPower: user.miningPower,
        hasBasicPlan: user.hasBasicPlan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      dbConnectionTest: dbTest
    })
  } catch (error) {
    console.error('Users debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== MANUAL USER CREATION TEST ===')
    console.log('Request body:', body)
    
    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        telegramId: `test-${Date.now()}`,
        username: 'test_user',
        firstName: 'Test',
        lastName: 'User'
      }
    })
    
    console.log('Test user created:', testUser)
    console.log('================================')
    
    return NextResponse.json({
      success: true,
      testUser,
      message: 'Test user created successfully'
    })
  } catch (error) {
    console.error('Manual user creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
