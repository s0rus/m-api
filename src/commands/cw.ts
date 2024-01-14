import { env } from '@/env';
import { fallback, janapiRoutes } from '@/lib/constants';
import { IPersonOfTheDay, TClient, TCommand } from '@/types';
import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'cw',
  execute: async ({ client, message }) => {
    const personOfTheDayId = await getPersonOfTheDayId();

    if (personOfTheDayId) {
      const personOfTheDayEmbed = await getPersonOfTheDayEmbed(client, personOfTheDayId);

      message.reply({
        embeds: [personOfTheDayEmbed],
      });
    } else {
      await fetch(`${env.ESSA_API_URL}${janapiRoutes.personOfTheDay}`, {
        headers: {
          Authorization: `Bearer ${env.ESSA_API_KEY}`,
        },
        method: 'POST',
      });

      const generatedPersonOfTheDayId = await getPersonOfTheDayId();

      if (generatedPersonOfTheDayId) {
        const personOfTheDayEmbed = await getPersonOfTheDayEmbed(client, generatedPersonOfTheDayId);
        message.reply({
          embeds: [personOfTheDayEmbed],
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

const getPersonOfTheDayId = async (): Promise<string | null> => {
  const response = await fetch(`${env.ESSA_API_URL}${janapiRoutes.personOfTheDay}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  const personOfTheDay = (await response.json()) as IPersonOfTheDay | null;

  if (!personOfTheDay) {
    return null;
  }

  return personOfTheDay.User;
};

const getPersonOfTheDayEmbed = async (client: TClient, userId: string) => {
  const personOfTheDay = await client.users.fetch(userId);
  const username = personOfTheDay.username ?? fallback.USERNAME;
  const avatar = personOfTheDay.avatarURL() ?? fallback.AVATAR;

  return new EmbedBuilder()
    .setTitle(`Cwel dnia | ${dayjs().format('DD/MM/YY')}`)
    .setDescription(`## ${username}`)
    .setThumbnail(avatar);
};
