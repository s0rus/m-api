import { env } from '@/env';
import { _WrappedManager } from '@/lib/_wrapped/wrapped-manager';
import { fallback, janapiRoutes } from '@/lib/constants';
import { getMentionedUserId, getTimeToReset } from '@/lib/utils';
import type { IEssa, TClient, TCommand } from '@/types';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'essa',
  execute: async ({ client, message }) => {
    const mentionedUserId = getMentionedUserId(message);
    const messageAuthorId = message.author.id;

    const essaById = await getEssaByUserId(mentionedUserId ?? messageAuthorId);

    if (essaById) {
      const essaEmbed = await getUserEssaEmbed(client, essaById);

      message.reply({
        embeds: [essaEmbed],
      });

      await _WrappedManager.upsertEssaAggregation(mentionedUserId ?? messageAuthorId, essaById.Value);

      return;
    } else {
      await fetch(`${env.ESSA_API_URL}${janapiRoutes.essa}/${mentionedUserId ?? messageAuthorId}`, {
        headers: {
          Authorization: `Bearer ${env.ESSA_API_KEY}`,
        },
        method: 'POST',
      });

      const generatedEssaById = await getEssaByUserId(mentionedUserId ?? messageAuthorId);
      if (generatedEssaById) {
        const essaEmbed = await getUserEssaEmbed(client, generatedEssaById);

        message.reply({
          embeds: [essaEmbed],
        });

        await _WrappedManager.upsertEssaAggregation(mentionedUserId ?? messageAuthorId, generatedEssaById.Value);
        return;
      }

      message.reply({
        content: 'Wystąpił nieoczekiwany błąd przy pobieraniu essy xd',
      });
      return;
    }
  },
  prefixRequired: true,
};

const getEssaByUserId = async (userId: string): Promise<IEssa | null> => {
  const response = await fetch(`${env.ESSA_API_URL}${janapiRoutes.essa}/${userId}`, {
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
  const user = await client.users.fetch(essaData.User);

  const { hours, minutes } = getTimeToReset();

  return new EmbedBuilder()
    .setTitle('Dzisiejsza essa:')
    .setDescription(
      `> # ${essaData.Value}%  
      ### ${essaData.Description}
      `
    )
    .setAuthor({
      name: user.username ?? fallback.USERNAME,
      iconURL: user.avatarURL() ?? fallback.AVATAR,
    })
    .setFooter({
      text: `Następne użycie dostępne za: ${hours} godzin(y) i ${minutes} minut(y)`,
    })
    .setTimestamp();
};
