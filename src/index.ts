import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
});

import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

import { PrismaClient } from '@prisma/client';
import { fetchMessageCountData } from './fetchMessageCountData';

export const prisma = new PrismaClient({
  log: ['error'],
});

const token = process.env.DISCORD_BOT_TOKEN;
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Warsaw');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once(Events.ClientReady, async () => {
  console.log('Discord watcher ready');
});

client.on(Events.MessageCreate, async (message) => {
  try {
    console.log(`[${message.createdAt}] ${message.author.username}: ${message.content}`);
    const update = await prisma.aggregatedData.updateMany({
      data: {
        count: {
          increment: 1,
        },
      },
      where: {
        date: dayjs(new Date()).format('MM.DD.YYYY'),
      },
    });

    if (update.count === 0) {
      console.log(`[${message.createdAt}] ${message.author.username}: ${message.content} - CREATED NEW DATE`);
      await prisma.aggregatedData.create({
        data: {
          date: dayjs(new Date()).format('MM.DD.YYYY'),
          count: 1,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }

  if (message.content === '!w' || message.content === 'ile wiadomosci') {
    try {
      const { todaysCount, avgCount } = await fetchMessageCountData();

      console.log(`TODAY: ${todaysCount}`);

      const messageEmbed = new EmbedBuilder()
        .setColor(0x6c42f5)
        .setDescription('Dziadkownia')
        .setThumbnail('https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless')
        .addFields({
          name: '```Wiadomości dzisiaj```',
          value: `${JSON.stringify(todaysCount, null, 0)}`,
          inline: true,
        })
        .setFooter({
          text: `Średnio: ${JSON.stringify(parseFloat(avgCount.toFixed(2)), null, 0)}`,
          iconURL: 'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
        });
      message.channel.send({ embeds: [messageEmbed] });
    } catch (error) {
      console.log(error);
      message.channel.send('Wystąpił błąd podczas pobierania danych...');
    }
  }
});

client.login(token);
