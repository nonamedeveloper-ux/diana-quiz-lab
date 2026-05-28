require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password: hashedPassword, role: 'admin' },
  });

  const subjects = [
    { name: 'Matematika', description: 'Algebra, geometriya va arifmetika' },
    { name: 'Fizika', description: 'Mexanika, optika va elektr' },
    { name: 'Kimyo', description: 'Organik va anorganik kimyo' },
    { name: 'Biologiya', description: 'Botanika, zoologiya va anatomiya' },
    { name: 'Ingliz tili', description: 'Grammar, vocabulary va reading' },
    { name: 'Tarix', description: "O'zbekiston va dunyo tarixi" },
    { name: 'Ona tili', description: "O'zbek tili grammatikasi" },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('─'.repeat(40));
  console.log(`  Username : ${username}`);
  console.log(`  Password : ${password}`);
  console.log('─'.repeat(40));
  console.log(`  URL      : http://localhost:${process.env.PORT || 3000}`);
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
