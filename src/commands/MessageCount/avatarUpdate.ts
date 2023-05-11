import { Prisma, PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error'],
});

export async function updateAvatar(userId: string, avatarUrl: string) {
  await prisma.user.update({
    where: { userId },
    data: { avatar: avatarUrl } as Prisma.UserUpdateInput,
  });
}
