import { getCommandUsageCount } from '@/lib/_wrapped/command-usage-count';
import { getWeekdayMessageCount } from '@/lib/_wrapped/weekday-message-count';
import { getYearlyMessageCount } from '@/lib/_wrapped/yearly-message-count';
import { discordId } from '@/lib/constants';
import { db } from '@/lib/db';
import { DiscordClient } from '@/lib/discord-client';
import dayjs from 'dayjs';
import { Hono } from 'hono';

const wrapped = new Hono();

wrapped.get('/:userId', async (c) => {
  const { userId } = c.req.param();

  try {
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
                usageCount: 'desc',
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

    const essaAggregations = await db.essaAggregation.aggregate({
      where: {
        userWrappedId: userId,
      },
      _avg: {
        essa: true,
      },
      _min: {
        essa: true,
      },
      _max: {
        essa: true,
      },
    });

    const globalStatAggregations = await db.statAggregation.aggregate({
      where: {
        NOT: {
          userWrappedId: userId || discordId.BOT_ID,
        },
      },
      _max: {
        gifCount: true,
        attachmentCount: true,
        mentionCount: true,
        reactionCount: true,
        replyCount: true,
      },
      _avg: {
        gifCount: true,
        attachmentCount: true,
        mentionCount: true,
        reactionCount: true,
        replyCount: true,
      },
    });

    const distinctDayCount = await db.messageAggregation.count({
      where: {
        userId,
        date: {
          endsWith: dayjs().format('YYYY'),
        },
      },
    });

    const globalMessageCountAggregation = await db.user.aggregate({
      _sum: {
        totalMessageCount: true,
      },
    });

    const allTimeMessageCount = globalMessageCountAggregation._sum.totalMessageCount;

    const messageCountAllTime = user.totalMessageCount;
    const messageContribution = allTimeMessageCount
      ? Number(((messageCountAllTime / allTimeMessageCount) * 100).toFixed(1))
      : null;
    const replyCount = user.userWrapped?.statAggregation?.replyCount ?? null;
    const reactionCount = user.userWrapped?.statAggregation?.reactionCount ?? null;
    const gifCount = user.userWrapped?.statAggregation?.gifCount ?? null;
    const attachmentCount = user.userWrapped?.statAggregation?.attachmentCount ?? null;
    const mentionCount = user.userWrapped?.statAggregation?.mentionCount ?? null;

    return c.json({
      messageCountAllTime,
      replyCount,
      reactionCount,
      gifCount,
      attachmentCount,
      mentionCount,
      distinctDayCount,
      yearlyMessageCount: getYearlyMessageCount(user.aggregations),
      weekdayMessageCount: getWeekdayMessageCount(user.aggregations),
      commandUsage: getCommandUsageCount(user.userWrapped?.commandAggregation),
      essa: {
        avg: essaAggregations._avg.essa,
        min: essaAggregations._min.essa,
        max: essaAggregations._max.essa,
      },
      global: {
        allTimeMessageCount,
        messageContribution,
        statComparisons: globalStatAggregations,
      },
    });
  } catch (error) {
    console.log(error);
    return c.notFound();
  }
});

wrapped.get('/member/:userId', async (c) => {
  const { userId } = c.req.param();

  try {
    const guild = await DiscordClient.getInstance().guilds.fetch(discordId.GUILD_ID);
    const member = await guild.members.fetch(userId);

    return c.json({
      userId: member.id,
      joinedTimestamp: member.joinedTimestamp,
    });
  } catch (error) {
    return c.notFound();
  }
});

export { wrapped };
