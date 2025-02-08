import { _WrappedManager } from "@/lib/_wrapped/wrapped-manager";
import { discordEmote, fallback } from "@/lib/constants";
import { janapi } from "@/lib/janapi";
import { getMentionedUserId, getTimeToReset, logger } from "@/lib/utils";
import type { Essa, DCClient, DiscordCommand } from "@/types";
import dayjs from "dayjs";
import { EmbedBuilder, User } from "discord.js";

export const command: DiscordCommand = {
  name: "essa",
  execute: async ({ client, message, args }) => {
    try {
      switch (args[0]) {
        case "ranking": {
          const essaList = await janapi.get("/essa");

          if (essaList) {
            const sortedEssaList = essaList.sort(
              (a, b) => b.essa_value - a.essa_value,
            );

            const essaRankingFields = await buildRankingFields(
              client,
              sortedEssaList,
            );

            const avgEssa =
              essaList.reduce((acc, curr) => acc + curr.essa_value, 0) /
              essaList.length;

            const { hours, minutes } = getTimeToReset();

            const essaRankingEmbed = new EmbedBuilder()
              .setTitle(
                `Ranking essy z dnia ${dayjs().format("DD/MM/YY")} (Średnia: ${parseFloat(avgEssa.toFixed(2))}%)`,
              )
              .setDescription(`${essaRankingFields}`)
              .setFooter({
                text: `Reset rankingu za: ${hours} godzin(y) i ${minutes} minut(y)`,
              })
              .setTimestamp();

            message.reply({
              embeds: [essaRankingEmbed],
            });
            return;
          } else {
            message.reply({
              content:
                "Ranking jest pusty lub wystąpił błąd podczas pobierania.",
            });
            return;
          }
        }
        default: {
          const mentionedUserId = getMentionedUserId(message);
          const messageAuthorId = message.author.id;

          const essaById = await janapi.get("/essa/:userId", {
            userId: mentionedUserId ?? messageAuthorId,
          });

          if (essaById) {
            const essaEmbed = await getUserEssaEmbed(client, essaById);

            message.reply({
              embeds: [essaEmbed],
            });

            await _WrappedManager.upsertEssaAggregation(
              mentionedUserId ?? messageAuthorId,
              essaById.essa_value,
            );

            return;
          } else {
            message.reply({
              content: "Wystąpił nieoczekiwany błąd przy pobieraniu essy xd",
            });
            return;
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      logger.error(`[ESSA-ERROR]: ${err.message}`);
      message.reply(
        `${discordEmote.OSTRZEZENIE} Wystąpił błąd podczas pobierania danych o essie...`,
      );
    }
  },
  prefixRequired: true,
  documentation: {
    description: "Wyświetla dzisiejszą essę użytkownika.",
    variants: [
      {
        usage: "ranking",
        description: "Wyświetla ranking dzisiejszej essy serwera.",
      },
      {
        usage: "<@user>",
        description: "Wyświetla essę oznaczonego użytkownika.",
      },
    ],
  },
};

const buildRankingFields = async (client: DCClient, essaList: Essa[]) => {
  function getFieldContent(user: User, index: number, essaField: Essa) {
    return `${index + 1}. ${user.username ?? fallback.USERNAME}: **${essaField.essa_value}%** essy - ${essaField.value_description}`;
  }

  const userPromises = essaList.map(async (essaField, index) => {
    const user = await client.users.fetch(essaField.discord_id);

    if (index <= 2) {
      return `> ### ${getFieldContent(user, index, essaField)}`;
    }

    // ? Workaround for missing `4.` in the rankings on mobile
    if (index === 3) {
      return [`\u200b`, getFieldContent(user, index, essaField)].join("\n");
    }

    return getFieldContent(user, index, essaField);
  });

  type FulfilledResult<T> = {
    status: "fulfilled";
    value: T;
  };

  const results = await Promise.allSettled(userPromises);

  const fields = results
    .filter(
      (result): result is FulfilledResult<string> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  return fields.join("\n");
};

const getUserEssaEmbed = async (client: DCClient, essaData: Essa) => {
  const user = await client.users.fetch(essaData.discord_id);

  const { hours, minutes } = getTimeToReset();

  return new EmbedBuilder()
    .setTitle("Dzisiejsza essa:")
    .setDescription(
      `> # ${essaData.essa_value}%  
      ### ${essaData.value_description}
      `,
    )
    .setAuthor({
      name: user.username ?? fallback.USERNAME,
      iconURL: user.avatarURL() ?? fallback.AVATAR,
    })
    .setFooter({
      text: `Następne użycie dostępne za: ${hours} godzin(y) i ${minutes} minut(y)`,
    })
    .setTimestamp();
};
