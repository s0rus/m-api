import { Client, Message } from 'discord.js';
import { discordIds } from 'src/constants/discordIds';
import { prisma } from '../index';

export default async function handleAvatarUpdate(
  client: Client,
  message: Message,
) {
  const guild = client.guilds.cache.get(discordIds.GUILD_ID);
  if (!guild) return;

  const user = message.author;

  const avatarUrl = user.avatarURL();
  if (!avatarUrl) return;

  const dbUser = await prisma.user.findUnique({
    where: { userId: user.id },
  });

  if (!dbUser) return;

  if (dbUser.avatar !== avatarUrl) {
    await prisma.user.update({
      where: { userId: user.id },
      data: {
        avatar: avatarUrl,
      },
    });

    console.log(dbUser.name, 'avatar has been updated');
  }
}
