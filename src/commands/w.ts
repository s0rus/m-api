import { db } from "@/lib/db";
import dayjs from "dayjs";
import { EmbedBuilder, type Message } from "discord.js";

import { env } from "@/env";
import { discordEmote, fallback } from "@/lib/constants";
import {
  getMentionedUserAvatar,
  getMentionedUserId,
  getMentionedUserUsername,
  getTimeToReset,
  handleError,
  logger,
} from "@/lib/utils";
import type { DiscordCommand, DiscordUserWithoutWrapped } from "@/types";

export const command: DiscordCommand = {
  name: "w",
  execute: async ({ client: _client, message, args }) => {
    try {
      switch (args[0]) {
        case "ranking": {
          const messageRankingData = await getDescendingMessageRanking();

          if (messageRankingData) {
            const mentionedUserId = getMentionedUserId(message);
            const rankingFields = buildRankingFields(
              messageRankingData,
              mentionedUserId ?? message.author.id,
            );

            const { hours, minutes } = getTimeToReset();

            message.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(
                    `Ranking wiadomości z dnia ${dayjs().format("DD/MM/YY")}`,
                  )
                  .setDescription(rankingFields)
                  .setFooter({
                    text: `Reset rankingu za: ${hours} godzin(y) i ${minutes} minut(y)`,
                  })
                  .setTimestamp(),
              ],
            });
          } else {
            message.reply({
              content: "Ranking jest pusty.",
            });
          }
          break;
        }
        default: {
          const mentionedUserId = getMentionedUserId(message);

          if (mentionedUserId) {
            const { todayCount, allTimeCount } =
              await getMessageCountByUserId(mentionedUserId);

            const messageCountEmbed = getMessageCountEmbed({
              message,
              firstValue: todayCount,
              secondValue: allTimeCount,
              type: "individual",
            });

            message.reply({
              embeds: [messageCountEmbed],
            });
          } else {
            const [todayCount, avgCount] = await Promise.all([
              fetchDayTotalCount(),
              getAverageMessageCount(),
            ]);

            const messageCountEmbed = getMessageCountEmbed({
              message,
              firstValue: todayCount,
              secondValue: avgCount,
              type: "global",
            });

            message.reply({
              embeds: [messageCountEmbed],
            });
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      logger.error(err.message);
      message.reply(
        `${discordEmote.OSTRZEZENIE} Wystąpił błąd podczas pobierania danych o wiadomościach...`,
      );
    }
  },
  prefixRequired: true,
  documentation: {
    description:
      "Wyświetla liczbę wiadomości serwera w dniu dzisiejszym oraz dzienną średnią ilość wiadomości.",
    variants: [
      {
        usage: "ranking",
        description:
          "Wyświetla ranking wiadomości napisanych w dniu dzisiejszym.",
      },
      {
        usage: "<@user>",
        description:
          "Wyświetla liczbę wiadomości użytkownika w dniu dzisiejszym oraz ogólnie.",
      },
    ],
  },
};

export async function fetchDayTotalCount() {
  const dayTotalAggregation = await db.messageAggregation.aggregate({
    where: {
      date: dayjs(new Date()).format("DD.MM.YYYY"),
    },
    _sum: {
      dayCount: true,
    },
  });

  return dayTotalAggregation._sum.dayCount;
}

export async function getAverageMessageCount() {
  const daySumAggregation = await db.messageAggregation.groupBy({
    where: {
      date: {
        not: {
          equals: dayjs(new Date()).format("DD.MM.YYYY"),
        },
      },
    },
    by: "date",
    _sum: {
      dayCount: true,
    },
  });

  return (
    daySumAggregation.reduce((acc, v) => {
      return acc + (v?._sum?.dayCount ?? 0);
    }, 0) / daySumAggregation.length
  );
}

export async function getMessageCountByUserId(userId: string) {
  const userData = await db.user.findFirst({
    where: {
      userId,
    },
    include: {
      aggregations: true,
    },
  });

  if (!userData) {
    throw new Error(`User of id ${userId} not found.`);
  }

  const today = dayjs(new Date()).format("DD.MM.YYYY");

  const todayCount = userData.aggregations.reduce((acc, curr) => {
    if (curr.date === today) {
      return acc + curr.dayCount;
    }
    return acc;
  }, 0);

  return {
    todayCount,
    allTimeCount: userData.totalMessageCount,
  };
}

export async function incrementMessageCount(message: Message) {
  if (
    env.NODE_ENV === "development" &&
    env.DATABASE_URL.startsWith("postgres")
  ) {
    return;
  }

  try {
    logger.chatlog(message);

    const date = dayjs(new Date()).format("DD.MM.YYYY");

    const messageAuthorId = message.author.id;
    const messageAuthorUsername = message.author.username;

    const potentialAggregation = await db.messageAggregation.findFirst({
      where: {
        date,
        userId: messageAuthorId,
      },
    });

    if (!messageAuthorId) {
      throw new Error(`Message author could not be found!`);
    }

    await db.user.upsert({
      where: {
        userId: messageAuthorId,
      },
      update: {
        totalMessageCount: {
          increment: 1,
        },
        aggregations: {
          upsert: {
            where: {
              id: potentialAggregation?.id ?? "",
            },
            create: {
              date,
              dayCount: 1,
            },
            update: {
              dayCount: {
                increment: 1,
              },
            },
          },
        },
        userWrapped: {
          upsert: {
            where: {
              userId: messageAuthorId,
            },
            create: {},
            update: {},
          },
        },
      },
      create: {
        userId: messageAuthorId,
        name: messageAuthorUsername,
        totalMessageCount: 1,
        aggregations: {
          create: {
            date,
            dayCount: 1,
          },
        },
        userWrapped: {
          create: {},
        },
      },
      include: {
        aggregations: true,
      },
    });
  } catch (error) {
    handleError(error);
  }
}

export const getMessageCountEmbed = ({
  message,
  firstValue,
  secondValue,
  type,
}: {
  message: Message;
  firstValue: number | null;
  secondValue: number | null;
  type: "individual" | "global";
}) => {
  if (type === "individual") {
    const username = getMentionedUserUsername(message);
    const avatar = getMentionedUserAvatar(message);

    return new EmbedBuilder()
      .setTitle(`Liczba wiadomości | ${dayjs().format("DD/MM/YY HH:mm")}`)
      .setDescription(`## ${username}`)
      .setThumbnail(avatar)
      .addFields([
        {
          name: "`Dzisiaj`",
          value: `${discordEmote.JASPER_WEIRD} ${firstValue ? Math.floor(firstValue) : "--"}`,
          inline: true,
        },
        {
          name: "`Wszystkie`",
          value: `${discordEmote.JASPER_HAPPY} ${secondValue ? Math.floor(secondValue) : "--"}`,
          inline: true,
        },
      ]);
  }

  const guildIcon = message?.guild?.iconURL() ?? fallback.AVATAR;
  const status = getCountStatus({
    todayCount: firstValue,
    avgCount: secondValue,
  });

  return new EmbedBuilder()
    .setTitle(`Liczba wiadomości | ${dayjs().format("DD/MM/YY HH:mm")}`)
    .setThumbnail(guildIcon)
    .addFields([
      {
        name: "`Dzisiaj`",
        value: `${discordEmote.JASPER_WEIRD} ${firstValue ? Math.floor(firstValue) : "--"}`,
        inline: true,
      },
      {
        name: "`Średnio`",
        value: `${discordEmote.JASPER_HAPPY} ${secondValue ? Math.floor(secondValue) : "--"}`,
        inline: true,
      },
    ])
    .setFooter({
      text: status,
    });
};

const getCountStatus = ({
  todayCount,
  avgCount,
}: {
  todayCount: number | null;
  avgCount: number | null;
}) => {
  if (!todayCount || !avgCount) {
    return "--";
  }

  if (todayCount >= avgCount) {
    return "Norma wyrobiona 😮";
  } else if (todayCount >= avgCount / 2 && todayCount < avgCount) {
    return `${env.EXPLICIT_WORDS?.split(",")[2] ?? "Słabo"} ale stabilnie ☝🏿`;
  } else if (todayCount < avgCount / 2) {
    return "Umieralnia 💀";
  }

  return "--";
};

const getDescendingMessageRanking = async () => {
  const userData = await db.user.findMany({
    include: {
      aggregations: {
        where: {
          date: {
            equals: dayjs(new Date()).format("DD.MM.YYYY"),
          },
        },
      },
    },
  });

  const sortedUserData = userData
    .filter(
      (user) =>
        user.aggregations[0] && !user.name.toLocaleLowerCase().includes("bot"),
    )
    .sort((a, b) => b.aggregations[0].dayCount - a.aggregations[0].dayCount);

  return sortedUserData;
};

const buildRankingFields = (
  rankingData: DiscordUserWithoutWrapped[],
  messageAuthorId: string,
) => {
  function getFieldContent(user: DiscordUserWithoutWrapped, index: number) {
    return `${index + 1}. ${user.name ?? fallback.USERNAME}: **${user.aggregations[0].dayCount}** wiadomości`;
  }

  const topTenRankingData = rankingData.slice(0, 10);
  const messageAuthorIndex = rankingData.findIndex(
    (user) => user.userId === messageAuthorId,
  );
  const isMessageAuthorOutsideTopTen = messageAuthorIndex > 9;

  const fields = topTenRankingData.map((user, index) => {
    const todayMessageAggregation = user.aggregations[0];
    if (!todayMessageAggregation) {
      return null;
    }

    if (index <= 2) {
      return `> ### ${getFieldContent(user, index)}`;
    }

    // ? Workaround for missing `4.` in the rankings on mobile
    if (index === 3) {
      return [`\u200b`, getFieldContent(user, index)].join("\n");
    }

    return getFieldContent(user, index);
  });

  if (isMessageAuthorOutsideTopTen && messageAuthorIndex) {
    const user = rankingData[messageAuthorIndex];

    fields.push(`...`, getFieldContent(user, messageAuthorIndex));
  }

  return fields.filter((field) => field !== null).join("\n");
};
