import { db } from '@/lib/db';
import dayjs from 'dayjs';
import { EmbedBuilder, type Message } from 'discord.js';

import { env } from '@/env';
import { discordEmote, fallback } from '@/lib/constants';
import { handleError, logger } from '@/lib/utils';
import type { TCommand } from '@/types';

export const command: TCommand = {
  name: 'w',
  execute: async ({ client, message }) => {
    try {
      const mentionedUserId = message.mentions.users.first()?.id;

      if (mentionedUserId) {
        const { todayCount, allTimeCount } = await getMessageCountByUserId(mentionedUserId);

        const messageCountEmbed = getMessageCountEmbed({
          message,
          firstValue: todayCount,
          secondValue: allTimeCount,
          type: 'individual',
        });

        message.reply({
          embeds: [messageCountEmbed],
        });
      } else {
        const [todayCount, avgCount] = await Promise.all([fetchDayTotalCount(), getAverageMessageCount()]);

        const messageCountEmbed = getMessageCountEmbed({
          message,
          firstValue: todayCount,
          secondValue: avgCount,
          type: 'global',
        });

        message.reply({
          embeds: [messageCountEmbed],
        });
      }
    } catch (error) {
      console.log(error);
      const err = error as Error;
      logger.error(err.message);
      message.reply(`${discordEmote.OSTRZEZENIE} Wystąpił błąd podczas pobierania danych...`);
    }
  },
  prefixRequired: true,
};

export async function fetchDayTotalCount() {
  const dayTotalAggregation = await db.messageAggregation.aggregate({
    where: {
      date: dayjs(new Date()).format('DD.MM.YYYY'),
    },
    _sum: {
      dayCount: true,
    },
  });

  return dayTotalAggregation._sum.dayCount;
}

export async function getAverageMessageCount() {
  const daySumAggregation = await db.messageAggregation.groupBy({
    where: {
      date: {
        not: {
          equals: dayjs(new Date()).format('DD.MM.YYYY'),
        },
      },
    },
    by: 'date',
    _sum: {
      dayCount: true,
    },
  });

  return (
    daySumAggregation.reduce((acc, v) => {
      return acc + (v?._sum?.dayCount ?? 0);
    }, 0) / daySumAggregation.length
  );
}

export async function getMessageCountByUserId(userId: string) {
  const userData = await db.user.findFirst({
    where: {
      userId,
    },
    include: {
      aggregations: true,
    },
  });

  if (!userData) {
    throw new Error(`User of id ${userId} not found.`);
  }

  const today = dayjs(new Date()).format('DD.MM.YYYY');

  const todayCount = userData.aggregations.reduce((acc, curr) => {
    if (curr.date === today) {
      return acc + curr.dayCount;
    }
    return acc;
  }, 0);

  return {
    todayCount,
    allTimeCount: userData.totalMessageCount,
  };
}

export async function incrementMessageCount(message: Message) {
  if (env.NODE_ENV === 'development' && env.DATABASE_URL.startsWith('mysql')) {
    return;
  }

  try {
    logger.chatlog(message);

    const date = dayjs(new Date()).format('DD.MM.YYYY');

    const messageAuthorId = message.author.id;
    const messageAuthorUsername = message.author.username;

    const potentialAggregation = await db.messageAggregation.findFirst({
      where: {
        date,
        userId: messageAuthorId,
      },
    });

    if (!messageAuthorId) {
      throw new Error(`Message author could not be found!`);
    }

    await db.user.upsert({
      where: {
        userId: messageAuthorId,
      },
      update: {
        totalMessageCount: {
          increment: 1,
        },
        aggregations: {
          upsert: {
            where: {
              id: potentialAggregation?.id ?? '',
            },
            create: {
              date,
              dayCount: 1,
            },
            update: {
              dayCount: {
                increment: 1,
              },
            },
          },
        },
        userWrapped: {
          upsert: {
            where: {
              userId: messageAuthorId,
            },
            create: {},
            update: {},
          },
        },
      },
      create: {
        userId: messageAuthorId,
        name: messageAuthorUsername,
        totalMessageCount: 1,
        aggregations: {
          create: {
            date,
            dayCount: 1,
          },
        },
        userWrapped: {
          create: {},
        },
      },
      include: {
        aggregations: true,
      },
    });
  } catch (error) {
    handleError(error);
  }
}

export const getMessageCountEmbed = ({
  message,
  firstValue,
  secondValue,
  type,
}: {
  message: Message;
  firstValue: number | null;
  secondValue: number | null;
  type: 'individual' | 'global';
}) => {
  if (type === 'individual') {
    const username = message.mentions.users.first()?.username ?? fallback.USERNAME;
    const avatar = message.mentions.users.first()?.avatarURL() ?? fallback.AVATAR;

    return new EmbedBuilder()
      .setTitle(`Liczba wiadomości | ${dayjs().format('DD/MM/YY HH:mm')}`)
      .setDescription(`## ${username}`)
      .setThumbnail(avatar)
      .addFields([
        {
          name: '`Dzisiaj`',
          value: `${discordEmote.JASPER_WEIRD} ${firstValue ? Math.floor(firstValue) : '--'}`,
          inline: true,
        },
        {
          name: '`Wszystkie`',
          value: `${discordEmote.JASPER_HAPPY} ${secondValue ? Math.floor(secondValue) : '--'}`,
          inline: true,
        },
      ]);
  }

  const guildIcon = message?.guild?.iconURL() ?? fallback.AVATAR;
  const status = getCountStatus({
    todayCount: firstValue,
    avgCount: secondValue,
  });

  return new EmbedBuilder()
    .setTitle(`Liczba wiadomości | ${dayjs().format('DD/MM/YY HH:mm')}`)
    .setThumbnail(guildIcon)
    .addFields([
      {
        name: '`Dzisiaj`',
        value: `${discordEmote.JASPER_WEIRD} ${firstValue ? Math.floor(firstValue) : '--'}`,
        inline: true,
      },
      {
        name: '`Średnio`',
        value: `${discordEmote.JASPER_HAPPY} ${secondValue ? Math.floor(secondValue) : '--'}`,
        inline: true,
      },
    ])
    .setFooter({
      text: status,
    });
};

const getCountStatus = ({ todayCount, avgCount }: { todayCount: number | null; avgCount: number | null }) => {
  if (!todayCount || !avgCount) {
    return '--';
  }

  if (todayCount >= avgCount) {
    return 'Norma wyrobiona 😮';
  } else if (todayCount >= avgCount / 2 && todayCount < avgCount) {
    return 'Chujowo ale stabilnie ☝🏿';
  } else if (todayCount < avgCount / 2) {
    return 'Umieralnia 💀';
  }

  return '--';
};
