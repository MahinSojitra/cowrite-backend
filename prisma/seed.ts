import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'owner@cowrite.dev' },
    update: {},
    create: {
      email: 'owner@cowrite.dev',
      name: 'Workspace Owner',
      provider: 'LOCAL'
    }
  });

  await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      slug: 'default',
      name: 'Default Workspace',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
