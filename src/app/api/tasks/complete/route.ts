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

    const { taskId } = await request.json()

    const task = await prisma.task.findUnique({
      where: { id: taskId, isActive: true }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user already completed this task
    const existingUserTask = await prisma.userTask.findUnique({
      where: {
        userId_taskId: {
          userId: user.id,
          taskId: taskId
        }
      }
    })

    if (existingUserTask) {
      if (existingUserTask.completedAt) {
        return NextResponse.json(
          { success: false, error: 'Task already completed' },
          { status: 400 }
        )
      }
    }

    // Complete the task and claim reward
    const [userTask, updatedUser] = await prisma.$transaction([
      prisma.userTask.upsert({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId: taskId
          }
        },
        update: {
          completedAt: new Date(),
          rewardClaimed: true
        },
        create: {
          userId: user.id,
          taskId: taskId,
          completedAt: new Date(),
          rewardClaimed: true
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalBalance: {
            increment: task.reward
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      reward: task.reward,
      newBalance: updatedUser.totalBalance
    })
  } catch (error) {
    console.error('Task completion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
