import { EmbedBuilder, Message } from 'discord.js';
import { COMMANDS } from '../../commandHelpers';
import {
  fetchDayTotalCount,
  getAverageMessageCount,
  getMessageCountByUsername,
} from './messageCountManager';

export const messageCount = async (message: Message) => {
  try {
    const [todayCount, avgCount] = await Promise.all([
      fetchDayTotalCount(),
      getAverageMessageCount(),
    ]);

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription('Dziadkownia')
      .setThumbnail(
        'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      )
      .addFields({
        name: '```Wiadomości dzisiaj```',
        value: `${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .setFooter({
        text: `Średnia: ${JSON.stringify(
          parseFloat(avgCount.toFixed(2)),
          null,
          0,
        )}`,
        iconURL:
          'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    console.log(error);
    message.channel.send('Wystąpił błąd podczas pobierania danych...');
  }
};

export const individialMessageCount = async (message: Message) => {
  const match = message.content.match(COMMANDS.individualMessageCount);

  if (!match) return;

  const username = match[1];

  console.log(username);

  try {
    const { todayCount, allTimeCount } = await getMessageCountByUsername(
      username,
    );

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription(username)
      .setThumbnail(
        'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      )
      .addFields({
        name: '```Wiadomości dzisiaj```',
        value: `${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .addFields({
        name: '```Wiadomości ogółem```',
        value: `${JSON.stringify(allTimeCount, null, 0)}`,
        inline: true,
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    const err = error as Error;
    console.log(err);
    message.channel.send(err.message);
  }
};
