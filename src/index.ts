import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
});

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { Client, Events, GatewayIntentBits } from 'discord.js';

import { PrismaClient } from '@prisma/client';
import { aha } from './commands/Aha/aha';
import { ahaList } from './commands/Aha/ahaList';
import { ahaRandom } from './commands/Aha/ahaRandom';
import { messageCount } from './commands/MessageCount/messageCount';
import { COMMANDS, buildCommand } from './const';

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

  switch (true) {
    case buildCommand(COMMANDS.messageCount, message):
      await messageCount(message);
      break;
    case buildCommand(COMMANDS.ahaRandom, message):
      await ahaRandom(message);
      break;
    case buildCommand(COMMANDS.ahaList, message):
      await ahaList(message);
      break;
    case buildCommand(COMMANDS.aha, message, /^aha[0-9]{1,}/):
      await aha(message);
      break;
    default:
      break;
  }
});

client.login(token);
