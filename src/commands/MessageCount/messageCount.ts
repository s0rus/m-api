import { EmbedBuilder, Message } from 'discord.js';
import { prisma } from '../../index';
import {
  fetchDayTotalCount,
  getAverageMessageCount,
  getMessageCountByUserId,
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
        name: '```Dzisiaj```',
        value: `📩 ${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .setFooter({
        text: `Średnia: ${avgCount ? Math.floor(avgCount) : '--'}`,
        iconURL:
          'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    console.log(error);
    message.channel.send('Wystąpił błąd podczas pobierania danych...');
  }
};

export const individualMessageCount = async (
  message: Message,
  userMention: string,
) => {
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

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription('Dawidownia')
      .setThumbnail(user.avatar)
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
        iconURL: user.avatar ?? undefined,
        text: `${user.name} | ${currentDate.toLocaleString()}`,
      });
    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    const err = error as Error;
    console.log(err);
    message.channel.send(err.message);
  }
};
