import dayjs from 'dayjs';
import { EmbedBuilder, Message } from 'discord.js';
import { embedFallback } from '../../helpers/embedFallback';
import { client } from '../../index';

const ESSA_API_URL = new URL(process.env.ESSA_API_URL ?? '');

interface Essa {
  id: string;
  essa: number;
  quote: string;
}

const getTimeToEssaReset = () => {
  const now = dayjs();
  const endOfDay = now.endOf('day');
  const duration = endOfDay.diff(now);

  const hours = Math.floor(duration / (60 * 60 * 1000));
  const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));

  return `Następne użycie dostępne za: ${hours} godzin(y) i ${minutes} minut(y)
  `;
};

const getEssa = async (): Promise<Essa[] | null> => {
  const currentEssaResponse = await fetch(`${ESSA_API_URL}`);

  if (!currentEssaResponse.ok) {
    return null;
  }

  const currentEssa = await currentEssaResponse.json();

  if (!currentEssa) {
    return null;
  }

  return currentEssa;
};

const getEssaByUserId = async (userId: string): Promise<Essa | null> => {
  const currentEssaResponse = await fetch(`${ESSA_API_URL}/${userId}`);

  if (!currentEssaResponse.ok) {
    return null;
  }

  const currentEssa = await currentEssaResponse.json();

  if (!currentEssa) {
    return null;
  }

  return currentEssa;
};

const getUserEssaEmbed = async (essaJson: Essa) => {
  const user = await client.users.fetch(essaJson.id);

  return new EmbedBuilder()
    .setTitle('Dzisiejsza essa:')
    .setDescription(
      `> # ${essaJson.essa}%  
      ### ${essaJson.quote}
      `,
    )
    .setAuthor({
      name: user.username ?? '<unknown user>',
      iconURL: user.avatarURL() ?? embedFallback.AVATAR_FALLBACK,
    })
    .setFooter({
      text: `${getTimeToEssaReset()}`,
    })
    .setTimestamp();
};

export const handleEssa = async (message: Message) => {
  try {
    const messageAuthorId = message.author.id;

    const essaJson = await getEssaByUserId(messageAuthorId);

    if (essaJson) {
      const essaEmbed = await getUserEssaEmbed(essaJson);

      message.reply({
        embeds: [essaEmbed],
      });
      return;
    } else {
      await fetch(`${ESSA_API_URL}/${messageAuthorId}`, {
        method: 'POST',
      });

      const addedEssaJson = await getEssaByUserId(messageAuthorId);
      if (addedEssaJson) {
        const essaEmbed = await getUserEssaEmbed(addedEssaJson);

        message.reply({
          embeds: [essaEmbed],
        });
        return;
      }

      message.reply({
        content: 'Wystąpił nieoczekiwany błąd przy pobieraniu essy xd',
      });
      return;
    }
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
  }
};

export const handleEssaRanking = async (message: Message) => {
  const buildEmbedFields = async (essaList: Essa[]) => {
    const userPromises = essaList.map(async (essaField, index) => {
      const user = await client.users.fetch(essaField.id);

      return `${index <= 2 ? '> ###' : ''} ${index + 1}. ${
        user.username ?? '<unknown user>'
      }: **${essaField.essa}%** essy - ${essaField.quote}`;
    });

    const fields = await Promise.all(userPromises);
    return fields.join('\n');
  };

  try {
    const essaList = await getEssa();
    if (essaList) {
      const sortedEssaList = essaList.sort((a, b) => b.essa - a.essa);

      const essaRankingFields = await buildEmbedFields(sortedEssaList);

      const essaRankingEmbed = new EmbedBuilder()
        .setTitle(`Ranking essy z dnia ${dayjs().format('DD/MM/YY')}`)
        .setDescription(`${essaRankingFields}`)
        .setTimestamp();

      message.reply({
        embeds: [essaRankingEmbed],
      });
    } else {
      message.reply({
        content: 'Ranking jest pusty.',
      });
    }
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
  }
};
