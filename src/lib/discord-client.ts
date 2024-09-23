import { incrementMessageCount } from '@/commands/w';
import { env } from '@/env';
import { TClient, TCommand } from '@/types';
import { Client, Collection, EmbedType, Events, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { _WrappedManager } from './_wrapped/wrapped-manager';
import handleAvatarUpdate, { logger, postMessageLog } from './utils';

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
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessageTyping,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.GuildEmojisAndStickers,
        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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
          await Promise.all([incrementMessageCount(message), handleAvatarUpdate(this.getInstance(), message)]);

          if (message.content.startsWith(this.COMMAND_PREFIX)) {
            const [commandName, ...args] = message.content.split(' ');
            const prefixedCommand = this.getInstance().commands.get(commandName.toLowerCase().replace(this.COMMAND_PREFIX, ''));

            if (prefixedCommand) {
              try {
                await prefixedCommand.execute({
                  client: this.getInstance(),
                  message,
                  args,
                });
                await _WrappedManager.incrementCommandUsageCount(message.author.id, prefixedCommand.name);
              } catch (error) {
                const err = error as Error;
                logger.error(
                  `[COMMAND-ERROR]: Command ${this.COMMAND_PREFIX}${prefixedCommand.name} could not be executed: ${err.message}`
                );
              }
            }
          }

          if (message.reference) {
            await _WrappedManager.incrementReplyCount(message.author.id);
          }

          if (message.attachments.size > 0) {
            await _WrappedManager.incrementAttachmentCount(message.author.id, message.attachments.size);
          }

          if (message.embeds.length > 0) {
            const gifCount = message.embeds.filter(
              (embed) => embed.data.type === EmbedType.Image || embed.data.type === EmbedType.GIFV
            ).length;
            if (gifCount > 0) {
              await _WrappedManager.incrementGifCount(message.author.id, gifCount);
            }
          }

          if (message.mentions.users.size > 0 && !message.reference) {
            await _WrappedManager.incrementMentionCount(message.author.id, message.mentions.users.size);
          }

          // ? TODO: UNCOMMENT WHEN READY
          // if (containsTwitterPostLink(message.content)) {
          //   await replaceTwitterPostLink(message);
          // }

          await postMessageLog(message);
        });

        client.on(Events.MessageReactionAdd, async (reaction, user) => {
          if (reaction.partial) {
            try {
              await reaction.fetch();
            } catch (error) {
              const err = error as Error;
              logger.error(`[FETCH-REACTION-ERROR]: Something went wrong when fetching the message: ${err.message}`);
              return;
            }
          }

          await _WrappedManager.incrementReactionCount(user.id);
        });

        client.on(Events.MessageReactionRemove, async (reaction, user) => {
          if (reaction.partial) {
            try {
              await reaction.fetch();
            } catch (error) {
              const err = error as Error;
              logger.error(`[FETCH-REACTION-ERROR]: Something went wrong when fetching the message: ${err.message}`);
              return;
            }
          }

          await _WrappedManager.decrementReactionCount(user.id);
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
