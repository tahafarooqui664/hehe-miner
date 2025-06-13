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

    const tasks = await prisma.task.findMany({
      where: { isActive: true },
      include: {
        userTasks: {
          where: { userId: user.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const tasksWithStatus = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      reward: task.reward,
      link: task.link,
      attachment: task.attachment,
      isCompleted: task.userTasks.length > 0 && task.userTasks[0].completedAt !== null,
      isRewardClaimed: task.userTasks.length > 0 && task.userTasks[0].rewardClaimed
    }))

    return NextResponse.json({
      success: true,
      tasks: tasksWithStatus
    })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Admin endpoint to create tasks
export async function POST(request: NextRequest) {
  try {
    const { title, description, reward, link, attachment } = await request.json()

    const task = await prisma.task.create({
      data: {
        title,
        description,
        reward,
        link,
        attachment
      }
    })

    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
