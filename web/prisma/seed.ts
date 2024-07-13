import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SYSTEM_USER_ID = 1

async function main() {
  // システムユーザーの作成
  await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      name: 'gemini',
      email: 'gemini@example.com',
    },
  })

  console.log('Seed data inserted successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })