import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample tasks
  const tasks = [
    {
      title: 'Follow us on Twitter',
      description: 'Follow our official Twitter account for updates and news',
      reward: 0.5,
      link: 'https://twitter.com/heheminer',
      attachment: 'https://twitter.com/heheminer'
    },
    {
      title: 'Join our Telegram Channel',
      description: 'Join our official Telegram channel for community updates',
      reward: 0.5,
      link: 'https://t.me/heheminer',
      attachment: 'https://t.me/heheminer'
    },
    {
      title: 'Like our Facebook Page',
      description: 'Like and follow our Facebook page for latest news',
      reward: 0.3,
      link: 'https://facebook.com/heheminer',
      attachment: 'https://facebook.com/heheminer'
    },
    {
      title: 'Subscribe to YouTube Channel',
      description: 'Subscribe to our YouTube channel for tutorials and updates',
      reward: 0.7,
      link: 'https://youtube.com/heheminer',
      attachment: 'https://youtube.com/heheminer'
    },
    {
      title: 'Join Discord Community',
      description: 'Join our Discord server and participate in discussions',
      reward: 0.4,
      link: 'https://discord.gg/heheminer',
      attachment: 'https://discord.gg/heheminer'
    },
    {
      title: 'Follow us on Facebook',
      description: 'Follow our official Facebook page for the latest updates, news, and exclusive content! Stay connected with our community.',
      reward: 0.6,
      link: 'https://facebook.com',
      attachment: 'https://facebook.com'
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
