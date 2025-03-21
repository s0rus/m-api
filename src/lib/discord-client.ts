import { incrementMessageCount } from "@/commands/w";
import { env } from "@/env";
import { DCClient, DiscordCommand, CommandDocs } from "@/types";
import {
  Client,
  Collection,
  EmbedBuilder,
  EmbedType,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { _WrappedManager } from "./_wrapped/wrapped-manager";
import handleAvatarUpdate, { logger, postMessageLog } from "./utils";
import { containsXPostLink, replaceXPostLink } from "./x-embed-replacer";

export class DiscordClient {
  private static instance: DCClient | null = null;
  private static isSetup = false;

  private static COMMAND_PREFIX =
    env.NODE_ENV === "development" ? ("?" as const) : ("!" as const);

  private constructor() {}

  static getInstance(): DCClient {
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
      }) as DCClient;
    }
    return DiscordClient.instance;
  }

  static setup() {
    if (!this.isSetup) {
      this.getInstance().login(env.DISCORD_BOT_TOKEN);

      this.getInstance().commands = new Collection();

      const commandsPath = path.join(import.meta.dir, "../commands");
      const commandsFolder = fs.readdirSync(commandsPath);

      async function getCommands() {
        const c = await Promise.all(
          commandsFolder.map(async (file) => {
            const { command }: { command: DiscordCommand } = await import(
              `${commandsPath}/${file}`
            );
            return command;
          }),
        );
        return c;
      }

      const documentation: CommandDocs[] = [];

      getCommands().then((commands) => {
        commands.forEach((command) => {
          this.getInstance().commands.set(command.name, command);
          if (command.documentation) {
            documentation.push({
              name: command.name,
              description: command.documentation.description,
              variants: command.documentation.variants,
            });
          }
        });
      });

      this.getInstance().commands.set("h", {
        name: "h",
        execute: async ({ client: _client, message, args: _args }) => {
          const embed = new EmbedBuilder().setTitle("Komendy").setDescription(
            documentation.length <= 0
              ? "Brak dokumentacji komend."
              : documentation
                  .map((doc) => {
                    const variants = doc.variants ?? [];

                    if (variants.length > 0) {
                      return `**${this.COMMAND_PREFIX}${doc.name}** - ${doc.description}\n${
                        variants.length > 0 &&
                        variants
                          .map((variant) => {
                            return `> **${this.COMMAND_PREFIX}${doc.name} ${variant.usage}** - ${variant.description}`;
                          })
                          .join("\n")
                      }`;
                    } else {
                      return `**${this.COMMAND_PREFIX}${doc.name}** - ${doc.description}`;
                    }
                  })
                  .join("\n\n"),
          );

          message.reply({ embeds: [embed] });
        },
        prefixRequired: true,
      });

      this.getInstance().on(Events.ClientReady, (client) => {
        client.on(Events.MessageCreate, async (message) => {
          await Promise.all([
            incrementMessageCount(message),
            handleAvatarUpdate(this.getInstance(), message),
          ]);

          if (env.NODE_ENV === "production") {
            postMessageLog(message);
          }

          if (message.content.startsWith(this.COMMAND_PREFIX)) {
            const [commandName, ...args] = message.content.split(" ");
            const prefixedCommand = this.getInstance().commands.get(
              commandName.toLowerCase().replace(this.COMMAND_PREFIX, ""),
            );

            if (prefixedCommand) {
              try {
                await prefixedCommand.execute({
                  client: this.getInstance(),
                  message,
                  args,
                });
                await _WrappedManager.incrementCommandUsageCount(
                  message.author.id,
                  prefixedCommand.name,
                );
              } catch (error) {
                const err = error as Error;
                logger.error(
                  `[COMMAND-ERROR]: Command ${this.COMMAND_PREFIX}${prefixedCommand.name} could not be executed: ${err.message}`,
                );
              }
            }
          }

          if (message.reference) {
            await _WrappedManager.incrementReplyCount(message.author.id);
          }

          if (message.attachments.size > 0) {
            await _WrappedManager.incrementAttachmentCount(
              message.author.id,
              message.attachments.size,
            );
          }

          if (message.embeds.length > 0) {
            const gifCount = message.embeds.filter(
              (embed) =>
                embed.data.type === EmbedType.Image ||
                embed.data.type === EmbedType.GIFV,
            ).length;
            if (gifCount > 0) {
              await _WrappedManager.incrementGifCount(
                message.author.id,
                gifCount,
              );
            }
          }

          if (message.mentions.users.size > 0 && !message.reference) {
            await _WrappedManager.incrementMentionCount(
              message.author.id,
              message.mentions.users.size,
            );
          }

          if (containsXPostLink(message.content)) {
            await replaceXPostLink(message);
          }
        });

        client.on(Events.MessageReactionAdd, async (reaction, user) => {
          if (reaction.partial) {
            try {
              await reaction.fetch();
            } catch (error) {
              const err = error as Error;
              logger.error(
                `[FETCH-REACTION-ERROR]: Something went wrong when fetching the message: ${err.message}`,
              );
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
              logger.error(
                `[FETCH-REACTION-ERROR]: Something went wrong when fetching the message: ${err.message}`,
              );
              return;
            }
          }

          await _WrappedManager.decrementReactionCount(user.id);
        });
      });

      logger.info("Discord watcher is ready");

      this.isSetup = true;
    } else {
      logger.warn(
        "Discord watcher is already setup, please remove the duplicate setup call.",
      );
    }
  }
}

DiscordClient.setup();
