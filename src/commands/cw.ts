import { env } from '@/env';
import { fallback } from '@/lib/constants';
import { logger } from '@/lib/utils';
import { TClient, TCommand } from '@/types';
import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'cw',
  execute: async ({ client, message }) => {
    const cwId = await getCwUserId();

    if (!cwId) {
      logger.error('There was an error during getting cw of the day.');
      message.reply('Wystąpił błąd podczas pobierania cwela dnia xd');
      return;
    }

    const cwEmbed = await getCwEmbed(client, cwId);

    message.reply({
      embeds: [cwEmbed],
    });
  },
  prefixRequired: true,
};

const getCwUserId = async (): Promise<string | null> => {
  const response = await fetch(`${env.ESSA_API_URL}/cweldnia`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  const currentCwUserId = (await response.json()) as string | null;

  if (!currentCwUserId) {
    return null;
  }

  return currentCwUserId;
};

const getCwEmbed = async (client: TClient, userId: string) => {
  const cw = await client.users.fetch(userId);
  const username = cw.username ?? fallback.USERNAME;
  const avatar = cw.avatarURL() ?? fallback.AVATAR;

  return new EmbedBuilder()
    .setTitle(`Cwel dnia | ${dayjs().format('DD/MM/YY')}`)
    .setDescription(`## ${username}`)
    .setThumbnail(avatar);
};
