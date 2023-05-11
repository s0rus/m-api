import { prisma } from '../../index';

export async function updateAvatar(userId: string, avatarUrl: string) {
  await prisma.user.update({
    where: { userId },
    data: { avatar: avatarUrl },
  });
}
