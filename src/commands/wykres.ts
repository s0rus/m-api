import { env } from '@/env';
import { janapiRoutes } from '@/lib/constants';
import { getMentionedUserId, logger } from '@/lib/utils';
import { TCommand } from '@/types';

export const command: TCommand = {
  name: 'wykres',
  execute: async ({ client, message }) => {
    try {
      const mentionedUserId = getMentionedUserId(message);
      const messageAuthorId = message.author.id;

      await updateChartByUserId(mentionedUserId ?? messageAuthorId);

      const chartUrl = getChartUrlByUserId(mentionedUserId ?? messageAuthorId);

      if (!isValidImage(chartUrl)) {
        throw new Error('Invalid chart image url!');
      }

      message.reply({
        files: [
          {
            attachment: chartUrl,
          },
        ],
      });
    } catch (error) {
      const err = error as Error;
      logger.error(err.message);
      message.reply('Wystąpił błąd podczas pobierania wykresu xd');
    }
  },
  prefixRequired: true,
};

async function updateChartByUserId(userId: string) {
  await fetch(`${env.ESSA_API_URL}${janapiRoutes.chartUpdate}/${userId}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: 'POST',
  });
}

function getChartUrlByUserId(userId: string) {
  return `${env.ESSA_API_URL}${janapiRoutes.chart}/${userId}.png`;
}

async function isValidImage(imageUrl: string) {
  const res = await fetch(imageUrl);
  const buff = await res.blob();

  return buff.type.startsWith('image/');
}
