import { Message } from 'discord.js';
import { DiscordRole } from 'src/constants/discordIds';

export const hasPermissions = (message: Message, roleId: DiscordRole) => {
  const author = message?.member;

  if (!author) {
    throw new Error('Nie można odczytać informacji o użytkowniku.');
  }

  return author?.roles?.cache?.has(roleId as unknown as string);
};
