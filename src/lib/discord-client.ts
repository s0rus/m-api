import { incrementMessageCount } from '@/commands/w';
import { env } from '@/env';
import { TClient, TCommand } from '@/types';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import handleAvatarUpdate, { logger } from './utils';

export class DiscordClient {
  private static instance: TClient | null = null;
  private static isSetup = false;

  private static COMMAND_PREFIX = env.NODE_ENV === 'development' ? ('?' as const) : ('!' as const);

  private constructor() {}

  static getInstance(): TClient {
    if (!DiscordClient.instance) {
      DiscordClient.instance = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessageTyping,
          GatewayIntentBits.GuildMessageReactions,
        ],
      }) as TClient;
    }
    return DiscordClient.instance;
  }

  static setup() {
    if (!this.isSetup) {
      this.getInstance().login(env.DISCORD_BOT_TOKEN);

      this.getInstance().commands = new Collection();

      const commandsPath = path.join(import.meta.dir, '../commands');
      const commandsFolder = fs.readdirSync(commandsPath);

      commandsFolder.forEach(async (file) => {
        const { command }: { command: TCommand } = await import(`${commandsPath}/${file}`);
        this.getInstance().commands.set(command.name, command);
      });

      this.getInstance().on(Events.ClientReady, (client) => {
        client.on(Events.MessageCreate, async (message) => {
          Promise.all([incrementMessageCount(message), handleAvatarUpdate(this.getInstance(), message)]);

          if (message.content.startsWith(this.COMMAND_PREFIX)) {
            const [commandName, ...args] = message.content.split(' ');
            const prefixedCommand = this.getInstance().commands.get(
              commandName.toLowerCase().replace(this.COMMAND_PREFIX, '')
            );

            if (!prefixedCommand) {
              return;
            }

            try {
              await prefixedCommand.execute({
                client: this.getInstance(),
                message,
                args,
              });
            } catch (error) {
              logger.error(`Command ${this.COMMAND_PREFIX}${prefixedCommand.name} could not be executed`);
            }
          }
        });
      });

      logger.info('Discord watcher is ready');

      this.isSetup = true;
    } else {
      logger.warn('Discord watcher is already setup, please remove the duplicate setup call.');
    }
  }
}

DiscordClient.setup();
