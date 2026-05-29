import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const rootEmail = 'root@system.com';
  const rootPassword = 'rootpassword123';
  const hashedPassword = await bcrypt.hash(rootPassword, 10);

  const root = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {},
    create: {
      email: rootEmail,
      name: 'System Root',
      password: hashedPassword,
      role: 'ROOT',
    },
  });

  console.log(' Root Owner berhasil dibuat:');
  console.log(`   Email    : ${root.email}`);
  console.log(`   Password : ${rootPassword}`);
  console.log(`   Role     : ${root.role}`);
}

main()
  .catch((e) => {
    console.error(' Gagal membuat seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
