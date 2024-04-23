import { User } from '@prisma/client';
import { discordId } from '../constants';
import { db } from '../db';

export async function getStatComparisons(
  user: User,
  {
    userGifCount,
    userReplyCount,
    userAttachmentCount,
    userMentionCount,
    userReactionCount,
  }: {
    userGifCount: number;
    userReplyCount: number;
    userAttachmentCount: number;
    userMentionCount: number;
    userReactionCount: number;
  }
) {
  const gifCountLeaders = db.statAggregation.findMany({
    take: 3,
    orderBy: {
      gifCount: 'desc',
    },
    select: {
      gifCount: true,
      userWrapped: {
        select: {
          user: true,
        },
      },
    },
    where: {
      AND: {
        userWrappedId: {
          notIn: [discordId.BOT_ID, discordId.PROBOT_ID, discordId.CBOT_ID],
        },
      },
    },
  });

  const replyCountLeaders = db.statAggregation.findMany({
    take: 3,
    orderBy: {
      replyCount: 'desc',
    },
    select: {
      replyCount: true,
      userWrapped: {
        select: {
          user: true,
        },
      },
    },
    where: {
      AND: {
        userWrappedId: {
          notIn: [discordId.BOT_ID, discordId.PROBOT_ID, discordId.CBOT_ID],
        },
      },
    },
  });

  const attachmentCountLeaders = db.statAggregation.findMany({
    take: 3,
    orderBy: {
      attachmentCount: 'desc',
    },
    select: {
      attachmentCount: true,
      userWrapped: {
        select: {
          user: true,
        },
      },
    },
    where: {
      AND: {
        userWrappedId: {
          notIn: [discordId.BOT_ID, discordId.PROBOT_ID, discordId.CBOT_ID],
        },
      },
    },
  });

  const mentionCountLeaders = db.statAggregation.findMany({
    take: 3,
    orderBy: {
      mentionCount: 'desc',
    },
    select: {
      mentionCount: true,
      userWrapped: {
        select: {
          user: true,
        },
      },
    },
    where: {
      AND: {
        userWrappedId: {
          notIn: [discordId.BOT_ID, discordId.PROBOT_ID, discordId.CBOT_ID],
        },
      },
    },
  });

  const reactionCountLeaders = db.statAggregation.findMany({
    take: 3,
    orderBy: {
      reactionCount: 'desc',
    },
    select: {
      reactionCount: true,
      userWrapped: {
        select: {
          user: true,
        },
      },
    },
    where: {
      AND: {
        userWrappedId: {
          notIn: [discordId.BOT_ID, discordId.PROBOT_ID, discordId.CBOT_ID],
        },
      },
    },
  });

  const leaders = await Promise.all([
    gifCountLeaders,
    replyCountLeaders,
    attachmentCountLeaders,
    mentionCountLeaders,
    reactionCountLeaders,
  ]);

  return {
    gifCountLeaders: leaders[0]
      .map((i) => {
        return {
          value: i.gifCount,
          user: i.userWrapped.user,
          isWrappedUser: i.userWrapped.user.userId === user.userId,
        };
      })
      .concat(
        leaders[0].some((i) => i.userWrapped.user.userId === user.userId)
          ? []
          : [
              {
                value: userGifCount ?? 0,
                user: user,
                isWrappedUser: true,
              },
            ]
      ),
    replyCountLeaders: leaders[1]
      .map((i) => {
        return {
          value: i.replyCount,
          user: i.userWrapped.user,
          isWrappedUser: i.userWrapped.user.userId === user.userId,
        };
      })
      .concat(
        leaders[1].some((i) => i.userWrapped.user.userId === user.userId)
          ? []
          : [
              {
                value: userReplyCount ?? 0,
                user: user,
                isWrappedUser: true,
              },
            ]
      ),
    attachmentCountLeaders: leaders[2]
      .map((i) => {
        return {
          value: i.attachmentCount,
          user: i.userWrapped.user,
          isWrappedUser: i.userWrapped.user.userId === user.userId,
        };
      })
      .concat(
        leaders[2].some((i) => i.userWrapped.user.userId === user.userId)
          ? []
          : [
              {
                value: userAttachmentCount ?? 0,
                user: user,
                isWrappedUser: true,
              },
            ]
      ),
    mentionCountLeaders: leaders[3]
      .map((i) => {
        return {
          value: i.mentionCount,
          user: i.userWrapped.user,
          isWrappedUser: i.userWrapped.user.userId === user.userId,
        };
      })
      .concat(
        leaders[3].some((i) => i.userWrapped.user.userId === user.userId)
          ? []
          : [
              {
                value: userMentionCount ?? 0,
                user: user,
                isWrappedUser: true,
              },
            ]
      ),
    reactionCountLeaders: leaders[4]
      .map((i) => {
        return {
          value: i.reactionCount,
          user: i.userWrapped.user,
          isWrappedUser: i.userWrapped.user.userId === user.userId,
        };
      })
      .concat(
        leaders[4].some((i) => i.userWrapped.user.userId === user.userId)
          ? []
          : [
              {
                value: userReactionCount ?? 0,
                user: user,
                isWrappedUser: true,
              },
            ]
      ),
  };
}
