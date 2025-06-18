import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create official tasks
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
    const existingTask = await prisma.task.findFirst({
      where: { title: task.title }
    })

    if (!existingTask) {
      await prisma.task.create({
        data: task
      })
    }
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
