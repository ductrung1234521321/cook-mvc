import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@local';
  const plain = process.env.ADMIN_PASSWORD || 'admin123';
  const name  = process.env.ADMIN_NAME || 'Admin';

  const password = await bcrypt.hash(plain, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName: name,      
      role: Role.ADMIN,    
    },
    create: {
      email,
      password,
      fullName: name,      
      role: Role.ADMIN,     
    },
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
