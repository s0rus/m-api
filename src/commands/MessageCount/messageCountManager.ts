import dayjs from 'dayjs';
import { prisma } from '../../index';
import { COMMANDS } from '../../helpers/commandHelpers';
import { EmbedBuilder, Message } from 'discord.js';

export async function fetchDayTotalCount() {
  const todayRecords = await prisma.messageAggregation.findMany({
    where: {
      date: dayjs(new Date()).format('DD.MM.YYYY'),
    },
  });

  return todayRecords.reduce((acc, curr) => acc + curr.dayCount, 0);
}

export async function getAverageMessageCount() {
  const allTimeRecords = await prisma.messageAggregation.findMany();

  const recordsWithoutToday = allTimeRecords.filter(
    (record) => record.date !== dayjs(new Date()).format('DD.MM.YYYY'),
  );

  const countWithoutToday = recordsWithoutToday.reduce(
    (acc, curr) => acc + curr.dayCount,
    0,
  );

  const uniqueDays = recordsWithoutToday.reduce((acc, curr) => {
    if (!acc.includes(curr.date)) {
      acc.push(curr.date);
    }

    return acc;
  }, [] as string[]);

  return countWithoutToday / uniqueDays.length;
}

export async function incrementMessageCount(message: Message) {
  console.log(
    `[${dayjs(message.createdAt).format('DD/MM/YYYY hh:mm A')}] ${
      message.author.username
    }: ${message.content}`,
  );

  const potentialAggregation = await prisma.messageAggregation.findFirst({
    where: {
      date: dayjs(new Date()).format('DD.MM.YYYY'),
      userId: message.author.id,
    },
  });

  await prisma.user.upsert({
    where: {
      userId: message.author.id,
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
            date: dayjs(new Date()).format('DD.MM.YYYY'),
            dayCount: 1,
          },
          update: {
            dayCount: {
              increment: 1,
            },
          },
        },
      },
    },
    create: {
      userId: message.author.id,
      name: message.author.username,
      totalMessageCount: 1,
      aggregations: {
        create: {
          date: dayjs(new Date()).format('DD.MM.YYYY'),
          dayCount: 1,
        },
      },
    },
    include: {
      aggregations: true,
    },
  });
}

export async function getMessageCountByUsername(username: string) {
  const userData = await prisma.user.findFirst({
    where: {
      name: username,
    },
    include: {
      aggregations: true,
    },
  });

  if (!userData) throw new Error('Nie znaleziono użytkownika.');

  const todayCount = userData.aggregations.reduce((acc, curr) => {
    if (curr.date === dayjs(new Date()).format('DD.MM.YYYY')) {
      return acc + curr.dayCount;
    }

    return acc;
  }, 0);

  return {
    todayCount,
    allTimeCount: userData.totalMessageCount,
  };
}

export async function getMessageCountByUserId(userId: string) {
  const userData = await prisma.user.findFirst({
    where: {
      userId,
    },
    include: {
      aggregations: true,
    },
  });

  if (!userData) throw new Error('Nie znaleziono użytkownika.');

  const todayCount = userData.aggregations.reduce((acc, curr) => {
    if (curr.date === dayjs(new Date()).format('DD.MM.YYYY')) {
      return acc + curr.dayCount;
    }

    return acc;
  }, 0);

  return {
    todayCount,
    allTimeCount: userData.totalMessageCount,
  };
}

export const topMessageCount = async (message: Message) => {
  const match = message.content.match(COMMANDS.topMessageCount);

  if (!match) return;

  const users = await prisma.user.findMany({
    include: {
      aggregations: {
        select: {
          dayCount: true,
        },
      },
    },
  });

  if (users.length === 0) {
    message.channel.send('Nie znaleziono użytkowników.');
    return;
  }

  const topUsers = users
    .sort((a, b) => {
      const sumA = a.aggregations.reduce(
        (sum, aggregation) => sum + aggregation.dayCount,
        0,
      );
      const sumB = b.aggregations.reduce(
        (sum, aggregation) => sum + aggregation.dayCount,
        0,
      );
      return sumB - sumA;
    })
    .slice(0, 3);

  const fields = topUsers.map((user, index) => {
    const sumDayCount = user.aggregations.reduce(
      (sum, aggregation) => sum + aggregation.dayCount,
      0,
    );
    return {
      name: `Miejsce ${index + 1}`,
      value: `Użytkownik: ${user.name}\nLiczba wiadomości: ${sumDayCount}`,
      inline: false,
    };
  });
  const messageCountEmbed = new EmbedBuilder()
    .setColor('#6c42f5')
    .setTitle('Najaktywniejsi użytkownicy')
    .addFields(fields);

  message.channel.send({ embeds: [messageCountEmbed] });
};
