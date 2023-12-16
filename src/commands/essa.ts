import { env } from '@/env';
import { fallback } from '@/lib/constants';
import { getTimeToReset } from '@/lib/utils';
import type { IEssa, TClient, TCommand } from '@/types';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'essa',
  execute: async ({ client, message }) => {
    const mentionedUserId = message.mentions.users.first()?.id;
    const messageAuthorId = message.author.id;

    const essaById = await getEssaByUserId(mentionedUserId ?? messageAuthorId);

    if (essaById) {
      const essaEmbed = await getUserEssaEmbed(client, essaById);

      message.reply({
        embeds: [essaEmbed],
      });
      return;
    } else {
      await fetch(`${env.ESSA_API_URL}/essa/${messageAuthorId}`, {
        headers: {
          Authorization: `Bearer ${env.ESSA_API_KEY}`,
        },
        method: 'POST',
      });

      const newEssa = await getEssaByUserId(messageAuthorId);
      if (newEssa) {
        const essaEmbed = await getUserEssaEmbed(client, newEssa);

        message.reply({
          embeds: [essaEmbed],
        });
        return;
      }

      message.reply({
        content: 'Wystąpił nieoczekiwany błąd przy pobieraniu essy xd',
      });
      throw new Error();
    }
  },
  prefixRequired: true,
};

const getEssaByUserId = async (userId: string): Promise<IEssa | null> => {
  const response = await fetch(`${env.ESSA_API_URL}/essa/${userId}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  const currentEssa = (await response.json()) as IEssa | null;

  if (!currentEssa) {
    return null;
  }

  return currentEssa;
};

const getUserEssaEmbed = async (client: TClient, essaData: IEssa) => {
  const user = await client.users.fetch(essaData.id);

  const { hours, minutes } = getTimeToReset();

  return new EmbedBuilder()
    .setTitle('Dzisiejsza essa:')
    .setDescription(
      `> # ${essaData.essa}%  
      ### ${essaData.quote}
      `
    )
    .setAuthor({
      name: user.username ?? fallback.USERNAME,
      iconURL: user.avatarURL() ?? fallback.AVATAR_FALLBACK,
    })
    .setFooter({
      text: `Następne użycie dostępne za: ${hours} godzin(y) i ${minutes} minut(y)`,
    })
    .setTimestamp();
};
