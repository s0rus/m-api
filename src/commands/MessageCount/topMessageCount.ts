import { COMMANDS } from '../../commandHelpers';
import { EmbedBuilder, Message } from 'discord.js';
import { prisma } from '../../index';

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

  const sortedUsers = users.sort((a, b) => {
    const sumA = a.aggregations.reduce(
      (sum, aggregation) => sum + aggregation.dayCount,
      0,
    );
    const sumB = b.aggregations.reduce(
      (sum, aggregation) => sum + aggregation.dayCount,
      0,
    );
    return sumB - sumA;
  });

  const topUsers = sortedUsers.slice(0, 3);

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
