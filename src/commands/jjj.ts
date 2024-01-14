import { env } from '@/env';
import { fallback, janapiRoutes } from '@/lib/constants';
import { IJakiJan, TClient, TCommand } from '@/types';
import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'jjj',
  execute: async ({ client, message }) => {
    const mentionedUserId = message.mentions.users.first()?.id;
    const messageAuthorId = message.author.id;

    const jj = await getJJ(mentionedUserId ?? messageAuthorId);

    if (jj) {
      const jjEmbed = await getJJEmbed(client, jj);

      message.reply({
        embeds: [jjEmbed],
      });
    } else {
      await fetch(`${env.ESSA_API_URL}${janapiRoutes.jakiJan}/${mentionedUserId ?? messageAuthorId}`, {
        headers: {
          Authorization: `Bearer ${env.ESSA_API_KEY}`,
        },
        method: 'POST',
      });

      const generatedJJ = await getJJ(mentionedUserId ?? messageAuthorId);

      if (generatedJJ) {
        const jjEmbed = await getJJEmbed(client, generatedJJ);
        message.reply({
          embeds: [jjEmbed],
        });
        return;
      }

      message.reply({
        content: 'Wystąpił nieoczekiwany błąd przy pobieraniu cwela dnia xd',
      });
      return;
    }
  },
  prefixRequired: true,
};

const getJJ = async (userId: string): Promise<IJakiJan | null> => {
  const response = await fetch(`${env.ESSA_API_URL}${janapiRoutes.jakiJan}/${userId}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  const jj = (await response.json()) as IJakiJan | null;

  if (!jj) {
    return null;
  }

  return jj;
};

const getJJEmbed = async (client: TClient, jjUser: IJakiJan) => {
  const user = await client.users.fetch(jjUser.User);
  const username = user.username ?? fallback.USERNAME;

  return new EmbedBuilder()
    .setTitle(`Jakim Janem Jesteś | ${dayjs().format('DD/MM/YY')}`)
    .setDescription(`## ${username}`)
    .setThumbnail(jjUser.JakiJan);
};
