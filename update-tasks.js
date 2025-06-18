const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateTasks() {
  try {
    // Delete all existing tasks
    console.log('Deleting existing tasks...')
    await prisma.task.deleteMany({})
    
    // Add new tasks
    console.log('Adding new tasks...')
    const tasks = [
      {
        title: 'Subscribe to YouTube Channel',
        description: 'Subscribe to our official YouTube channel for tutorials, updates, and exclusive content!',
        reward: 1.0,
        link: 'https://www.youtube.com/@Hehe-Miner',
        attachment: 'https://www.youtube.com/@Hehe-Miner'
      },
      {
        title: 'Join Telegram Community',
        description: 'Join our official Telegram community for updates, discussions, and support',
        reward: 0.8,
        link: 'https://t.me/Hehe_miner_community',
        attachment: 'https://t.me/Hehe_miner_community'
      },
      {
        title: 'Visit Official Website',
        description: 'Check out our official website to learn more about Hehe Miner and our roadmap',
        reward: 0.5,
        link: 'https://hehe-miner-web.vercel.app',
        attachment: 'https://hehe-miner-web.vercel.app'
      }
    ]

    for (const task of tasks) {
      await prisma.task.create({
        data: task
      })
      console.log(`Created task: ${task.title}`)
    }

    console.log('Tasks updated successfully!')
  } catch (error) {
    console.error('Error updating tasks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTasks()
