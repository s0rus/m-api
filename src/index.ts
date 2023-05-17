import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { incrementMessageCount } from './commands/MessageCount/messageCountManager';
import { handleCommand } from './commands/commandManager';
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
  // pingInstantBattle(client);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await Promise.all([
      incrementMessageCount(message),
      handleAvatarUpdate(client, message),
    ]);
    handleCommand(message);
  } catch (error) {
    console.log(error);
    // message.channel.send('Wystąpił błąd podczas zapisywania wiadomości...');
  }
});

client.login(token);
