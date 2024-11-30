import { getStatComparisons } from "@/lib/_wrapped/stat-comparisons";
import { getWeekdayMessageCount } from "@/lib/_wrapped/weekday-message-count";
import { getYearlyMessageCount } from "@/lib/_wrapped/yearly-message-count";
import { discordId } from "@/lib/constants";
import { db } from "@/lib/db";
import { DiscordClient } from "@/lib/discord-client";
import { User } from "@prisma/client";
import { Hono } from "hono";

const wrapped = new Hono();

wrapped.get("/:userId", async (c) => {
  const { userId } = c.req.param();

  try {
    const guild = await DiscordClient.getInstance().guilds.fetch(
      discordId.GUILD_ID,
    );
    const member = await guild.members.fetch(userId);

    if (!member) {
      return c.notFound();
    }

    const isUserBoosting = await guild.members
      .fetch(userId)
      .then((u) => !!u.premiumSinceTimestamp);

    const user = await db.user.findUnique({
      where: {
        userId,
      },
      include: {
        aggregations: true,
        userWrapped: {
          include: {
            commandAggregation: {
              orderBy: {
                usageCount: "desc",
              },
            },
            essaAggregation: true,
            statAggregation: true,
          },
        },
      },
    });

    if (!user) {
      return c.notFound();
    }

    const globalMessageCountAggregation = await db.user.aggregate({
      _sum: {
        totalMessageCount: true,
      },
    });

    const globalMessageCountAllTime =
      globalMessageCountAggregation._sum.totalMessageCount ?? 0;

    const userMessageCountByYear =
      getYearlyMessageCount(user.aggregations) ?? [];
    const userMessageCountAllTime = user.totalMessageCount ?? 0;
    const userMessageCountThisYear =
      userMessageCountByYear.find((item) => item.name === "2024")?.value ?? 0;

    const userDistinctMessageDayCount = await db.messageAggregation.count({
      where: {
        userId,
        date: {
          endsWith: "2024",
        },
      },
    });

    const userMostMessagesDayThisYear = await db.messageAggregation.findMany({
      where: {
        userId,
        date: {
          endsWith: "2024",
        },
      },
      orderBy: {
        dayCount: "desc",
      },
      take: 1,
    });

    const userMostMessagesDayAllTime = await db.messageAggregation.findMany({
      where: {
        userId,
      },
      orderBy: {
        dayCount: "desc",
      },
      // ? We take two here in case of sutiation where this year's message count
      // ? is bigger and we can show the previous record
      take: 2,
    });

    const globalMessageRecordCount = await db.messageAggregation.count();

    const globalMessageDayCountLeadersThisYear =
      await db.messageAggregation.findMany({
        where: {
          date: {
            endsWith: "2024",
          },
        },
        orderBy: {
          dayCount: "desc",
        },
        include: {
          user: true,
        },
        take: 3,
      });

    const globalMessageDayCountLeadersAllTime =
      await db.messageAggregation.findMany({
        orderBy: {
          dayCount: "desc",
        },
        include: {
          user: true,
        },
        take: 3,
      });

    const globalMessageCountLeadersAllTime = await db.user.findMany({
      orderBy: {
        totalMessageCount: "desc",
      },
      take: 3,
    });

    const globalMessageCountLeadersThisYear = await db.$queryRaw<
      {
        user: User;
        daycount: bigint | number;
      }[]
    >`
      SELECT 
        SUM(ma."dayCount") as dayCount,
        json_build_object(
          'id', u."id",
          'userId', u."userId",
          'avatar', u."avatar",
          'name', u."name",
          'totalMessageCount', u."totalMessageCount"
        ) as user
      FROM 
        "MessageAggregation" ma
      LEFT JOIN 
        "User" u ON ma."userId" = u."userId"
      WHERE 
        ma.date LIKE '%2024'
      GROUP BY 
        u."id", u."userId", u."avatar", u."name", u."totalMessageCount"
      ORDER BY 
        dayCount DESC
      LIMIT 
        3;
    `;

    const globalMessageDayCountAllTime = await db.messageAggregation.groupBy({
      by: ["date"],
      _sum: {
        dayCount: true,
      },
      orderBy: {
        _sum: {
          dayCount: "desc",
        },
      },
      take: 3,
    });

    const globalMessageDayCountThisYear = await db.messageAggregation.groupBy({
      by: ["date"],
      where: {
        date: {
          endsWith: "2024",
        },
      },
      _sum: {
        dayCount: true,
      },
      orderBy: {
        _sum: {
          dayCount: "desc",
        },
      },
      take: 3,
    });

    const userGifCount = user.userWrapped?.statAggregation?.gifCount ?? null;
    const userReplyCount =
      user.userWrapped?.statAggregation?.replyCount ?? null;
    const userAttachmentCount =
      user.userWrapped?.statAggregation?.attachmentCount ?? null;
    const userMentionCount =
      user.userWrapped?.statAggregation?.mentionCount ?? null;
    const userReactionCount =
      user.userWrapped?.statAggregation?.reactionCount ?? null;

    const chatStatLeaders = await getStatComparisons(
      {
        avatar: user.avatar,
        name: user.name,
        userId: user.userId,
        id: user.id,
        totalMessageCount: user.totalMessageCount,
      },
      {
        userReplyCount: userReplyCount ?? 0,
        userMentionCount: userMentionCount ?? 0,
        userAttachmentCount: userAttachmentCount ?? 0,
        userGifCount: userGifCount ?? 0,
        userReactionCount: userReactionCount ?? 0,
      },
    );

    const userEssa = await db.essaAggregation.aggregate({
      where: {
        userWrappedId: userId,
      },
      _avg: {
        essa: true,
      },
    });

    const userEssaMaxCount = await db.essaAggregation.count({
      where: {
        essa: 100,
        userWrappedId: userId,
      },
    });

    const globalEssa = await db.essaAggregation.aggregate({
      _avg: {
        essa: true,
      },
    });
    const essaRecordCount = await db.essaAggregation.count();

    return c.json({
      user: {
        userId: user.userId,
        username: user.name,
        avatar: user.avatar,
        joinedTimestamp: member.joinedTimestamp,
        isUserBoosting,
      },
      wrapped: {
        messages: {
          userSpecific: {
            userMessageCountAllTime,
            userMessageCountThisYear,
            userMessageCountByYear,
            userMessageCountByWeekday: getWeekdayMessageCount(
              user.aggregations,
            ),
            userDistinctMessageDayCount,
            userMostMessagesDayThisYear: userMostMessagesDayThisYear[0] ?? null,
            userMostMessagesDayAllTime: userMostMessagesDayAllTime,
          },
          serverSpecific: {
            globalMessageRecordCount,
            globalMessageCountAllTime,
            globalMessageCountLeadersThisYear:
              globalMessageCountLeadersThisYear.map((i) => ({
                totalMessageCount:
                  typeof i.daycount === "bigint"
                    ? Number(i.daycount.toString())
                    : i.daycount,
                id: i.user.id,
                userId: i.user.userId,
                avatar: i.user.avatar,
                name: i.user.name,
              })),
            globalMessageCountLeadersAllTime,
            globalMessageDayCountLeadersThisYear,
            globalMessageDayCountLeadersAllTime,
            globalMessageDayCountThisYear: globalMessageDayCountThisYear.map(
              (i) => ({
                date: i.date,
                dayCount: i._sum.dayCount,
              }),
            ),
            globalMessageDayCountAllTime: globalMessageDayCountAllTime.map(
              (i) => ({
                date: i.date,
                dayCount: i._sum.dayCount,
              }),
            ),
          },
        },
        stats: {
          chat: {
            ...chatStatLeaders,
          },
          commands: {
            userCommandUsage:
              user.userWrapped?.commandAggregation?.map((i) => ({
                name: i.commandName,
                usageCount: i.usageCount,
              })) ?? [],
          },
          essa: {
            essaRecordCount: essaRecordCount,
            userAvg: userEssa._avg.essa,
            userEssaMaxCount,
            globalAvg: globalEssa._avg.essa,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return c.notFound();
  }
});

wrapped.get("/member/:userId", async (c) => {
  const { userId } = c.req.param();

  try {
    const guild = await DiscordClient.getInstance().guilds.fetch(
      discordId.GUILD_ID,
    );
    const member = await guild.members.fetch(userId);

    return c.json({
      userId: member.id,
    });
  } catch (_error) {
    return c.notFound();
  }
});

export { wrapped };
