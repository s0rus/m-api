import { EmbedBuilder, Message } from 'discord.js';
import { COMMANDS } from '../../commandHelpers';
import {
  fetchDayTotalCount,
  getAverageMessageCount,
  getMessageCountByUserId,
} from './messageCountManager';
import { prisma } from '../../index';

export const messageCount = async (message: Message) => {
  try {
    const [todayCount, avgCount] = await Promise.all([
      fetchDayTotalCount(),
      getAverageMessageCount(),
    ]);
    const userAvatarUrl = message.author.avatarURL();

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription('Dziadkownia')
      .setThumbnail(
        'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      )

      .addFields({
        name: '```Dzisiaj```',
        value: `📩 ${JSON.stringify(todayCount, null, 0)}`,
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

export const individualMessageCount = async (message: Message) => {
  const match = message.content.match(COMMANDS.individualMessageCount);

  if (!match) return;

  const userMention = match[1];
  const userId = userMention.replace(/[<@!>]/g, '');

  try {
    const { todayCount, allTimeCount } = await getMessageCountByUserId(userId);
    const currentDate = new Date();

    const user = await prisma.user.findFirst({
      where: { userId },
    });

    if (!user) {
      return;
    }

    const avatarUrl = user.avatar;
    const username = user.name;

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription('Dawidownia')
      .setThumbnail(avatarUrl)
      .addFields({
        name: '```Dzisiaj```',
        value: `📩 ${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .addFields({
        name: '```Wszystkie```',
        value: `✉️ ${JSON.stringify(allTimeCount, null, 0)}`,
        inline: true,
      })
      .setFooter({
        iconURL: avatarUrl ?? undefined,
        text: `${username} | ${currentDate.toLocaleString()}`,
      });
    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    const err = error as Error;
    console.log(err);
    message.channel.send(err.message);
  }
};
