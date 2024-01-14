import { env } from '@/env';
import { fallback, janapiRoutes } from '@/lib/constants';
import { getTimeToReset } from '@/lib/utils';
import type { IEssa, TClient, TCommand } from '@/types';
import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'ranking',
  execute: async ({ client, message }) => {
    const essaList = await getEssaList();

    if (essaList) {
      const sortedEssaList = essaList.sort((a, b) => b.Value - a.Value);
      const essaRankingFields = await buildEmbedFields(client, sortedEssaList);
      const { hours, minutes } = getTimeToReset();

      const essaRankingEmbed = new EmbedBuilder()
        .setTitle(`Ranking essy z dnia ${dayjs().format('DD/MM/YY')}`)
        .setDescription(`${essaRankingFields}`)
        .setFooter({
          text: `Reset rankingu za: ${hours} godzin(y) i ${minutes} minut(y)`,
        })
        .setTimestamp();

      message.reply({
        embeds: [essaRankingEmbed],
      });
      return;
    } else {
      message.reply({
        content: 'Ranking jest pusty lub wystąpił błąd podczas pobierania.',
      });
      return;
    }
  },
  prefixRequired: true,
};

const getEssaList = async (): Promise<IEssa[] | null> => {
  const response = await fetch(`${env.ESSA_API_URL}${janapiRoutes.essa}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  const essaList = (await response.json()) as IEssa[];

  return essaList;
};

const buildEmbedFields = async (client: TClient, essaList: IEssa[]) => {
  const userPromises = essaList.map(async (essaField, index) => {
    const user = await client.users.fetch(essaField.User);

    return `${index <= 2 ? '> ###' : ''} ${index + 1}. ${user.username ?? fallback.USERNAME}: **${
      essaField.Value
    }%** essy - ${essaField.Description}`;
  });

  const fields = await Promise.all(userPromises);
  return fields.join('\n');
};
