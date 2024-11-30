import { env } from "@/env";
import { _WrappedManager } from "@/lib/_wrapped/wrapped-manager";
import { discordEmote, fallback, janapiRoutes } from "@/lib/constants";
import { getMentionedUserId, getTimeToReset, logger } from "@/lib/utils";
import type { IEssa, TClient, TCommand } from "@/types";
import dayjs from "dayjs";
import { EmbedBuilder, User } from "discord.js";

export const command: TCommand = {
  name: "essa",
  execute: async ({ client, message, args }) => {
    try {
      switch (args[0]) {
        case "ranking": {
          const essaList = await getEssaList();

          if (essaList) {
            const sortedEssaList = essaList.sort((a, b) => b.Value - a.Value);
            const essaRankingFields = await buildRankingFields(
              client,
              sortedEssaList,
            );
            const avgEssa =
              essaList.reduce((acc, curr) => acc + curr.Value, 0) /
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

          const essaById = await getEssaByUserId(
            mentionedUserId ?? messageAuthorId,
          );

          if (essaById) {
            const essaEmbed = await getUserEssaEmbed(client, essaById);

            message.reply({
              embeds: [essaEmbed],
            });

            await _WrappedManager.upsertEssaAggregation(
              mentionedUserId ?? messageAuthorId,
              essaById.Value,
            );

            return;
          } else {
            await fetch(
              `${env.ESSA_API_URL}${janapiRoutes.essa}/${mentionedUserId ?? messageAuthorId}`,
              {
                headers: {
                  Authorization: `Bearer ${env.ESSA_API_KEY}`,
                },
                method: "POST",
              },
            );

            const generatedEssaById = await getEssaByUserId(
              mentionedUserId ?? messageAuthorId,
            );
            if (generatedEssaById) {
              const essaEmbed = await getUserEssaEmbed(
                client,
                generatedEssaById,
              );

              message.reply({
                embeds: [essaEmbed],
              });

              await _WrappedManager.upsertEssaAggregation(
                mentionedUserId ?? messageAuthorId,
                generatedEssaById.Value,
              );
              return;
            }

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

const getEssaList = async (): Promise<IEssa[] | null> => {
  const response = await fetch(`${env.ESSA_API_URL}${janapiRoutes.essa}`, {
    headers: {
      Authorization: `Bearer ${env.ESSA_API_KEY}`,
    },
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  const essaList = (await response.json()) as IEssa[];

  return essaList;
};

const buildRankingFields = async (client: TClient, essaList: IEssa[]) => {
  function getFieldContent(user: User, index: number, essaField: IEssa) {
    return `${index + 1}. ${user.username ?? fallback.USERNAME}: **${essaField.Value}%** essy - ${essaField.Description}`;
  }

  const userPromises = essaList.map(async (essaField, index) => {
    const user = await client.users.fetch(essaField.User);

    if (index <= 2) {
      return `> ### ${getFieldContent(user, index, essaField)}`;
    }

    // ? Workaround for missing `4.` in the rankings on mobile
    if (index === 3) {
      return [`\u200b`, getFieldContent(user, index, essaField)].join("\n");
    }

    return getFieldContent(user, index, essaField);
  });

  const fields = await Promise.all(userPromises);
  return fields.join("\n");
};

const getEssaByUserId = async (userId: string): Promise<IEssa | null> => {
  const response = await fetch(
    `${env.ESSA_API_URL}${janapiRoutes.essa}/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${env.ESSA_API_KEY}`,
      },
      method: "GET",
    },
  );

  if (!response.ok) {
    return null;
  }

  const currentEssa = (await response.json()) as IEssa | null;

  if (!currentEssa) {
    return null;
  }

  return currentEssa;
};

const getUserEssaEmbed = async (client: TClient, essaData: IEssa) => {
  const user = await client.users.fetch(essaData.User);

  const { hours, minutes } = getTimeToReset();

  return new EmbedBuilder()
    .setTitle("Dzisiejsza essa:")
    .setDescription(
      `> # ${essaData.Value}%  
      ### ${essaData.Description}
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
