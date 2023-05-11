import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { COMMANDS, buildCommand } from './helpers/commandHelpers';
import { aha } from './commands/Aha/aha';
import { ahaList } from './commands/Aha/ahaList';
import { ahaRandom } from './commands/Aha/ahaRandom';
import {
  individualMessageCount,
  messageCount,
} from './commands/MessageCount/messageCount';
import {
  incrementMessageCount,
  topMessageCount,
} from './commands/MessageCount/messageCountManager';
import handleAvatarUpdate from './helpers/avatarUpdate';

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
  await handleAvatarUpdate(client, message);

  try {
    await incrementMessageCount(message);
  } catch (error) {
    console.log(error);
    message.channel.send('Wystąpił błąd podczas zapisywania wiadomości...');
  }

  switch (true) {
    case buildCommand(COMMANDS.messageCount, message):
      await messageCount(message);
      break;
    case buildCommand(COMMANDS.individualMessageCount, message):
      await individualMessageCount(message);
      break;
    case buildCommand(COMMANDS.topMessageCount, message):
      await topMessageCount(message);
      break;
    case buildCommand(COMMANDS.ahaRandom, message):
      await ahaRandom(message);
      break;
    case buildCommand(COMMANDS.ahaList, message):
      await ahaList(message);
      break;
    case buildCommand(COMMANDS.aha, message):
      await aha(message);
      break;
    default:
      break;
  }
});

client.login(token);
