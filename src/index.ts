import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

import { Client, Events, GatewayIntentBits } from 'discord.js';
import dayjs from 'dayjs';

import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

const token = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, () => {
  console.log('Discord watcher ready');
});

client.on(Events.MessageCreate, async (message) => {
  try {
    console.log(`${message.author.username}: ${message.content}`);
    const update = await prisma.aggregatedData.updateMany({
      data: {
        count: {
          increment: 1,
        },
      },
      where: {
        date: dayjs().format('DD.MM.YYYY'),
      },
    });

    if (update.count === 0) {
      await prisma.aggregatedData.create({
        data: {
          date: dayjs().format('DD.MM.YYYY'),
          count: 1,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(token);
