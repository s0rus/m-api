import dayjs from 'dayjs';
import { db } from '../db';
import { handleError } from '../utils';

export abstract class _WrappedManager {
  static async incrementReactionCount(userId: string) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {
              reactionCount: 1,
            },
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {
                reactionCount: 1,
              },
              update: {
                reactionCount: {
                  increment: 1,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async decrementReactionCount(userId: string) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {},
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {},
              update: {
                reactionCount: {
                  decrement: 1,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async incrementAttachmentCount(userId: string, incrementValue: number = 1) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {
              attachmentCount: incrementValue,
            },
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {
                attachmentCount: incrementValue,
              },
              update: {
                attachmentCount: {
                  increment: incrementValue,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async incrementGifCount(userId: string, incrementValue: number = 1) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {
              gifCount: incrementValue,
            },
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {
                gifCount: incrementValue,
              },
              update: {
                gifCount: {
                  increment: incrementValue,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async incrementReplyCount(userId: string) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {
              replyCount: 1,
            },
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {
                replyCount: 1,
              },
              update: {
                replyCount: {
                  increment: 1,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async incrementCommandUsageCount(userId: string, commandName: string) {
    try {
      const potentialAggregation = await db.commandAggregation.findFirst({
        where: {
          userWrappedId: userId,
          commandName,
        },
      });

      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          commandAggregation: {
            create: {
              commandName,
              usageCount: 1,
            },
          },
        },
        update: {
          commandAggregation: {
            upsert: {
              where: {
                id: potentialAggregation?.id ?? '',
              },
              create: {
                commandName,
                usageCount: 1,
              },
              update: {
                usageCount: {
                  increment: 1,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async incrementMentionCount(userId: string, incrementValue: number = 1) {
    try {
      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          statAggregation: {
            create: {
              mentionCount: incrementValue,
            },
          },
        },
        update: {
          statAggregation: {
            upsert: {
              where: {
                userWrappedId: userId,
              },
              create: {
                mentionCount: incrementValue,
              },
              update: {
                mentionCount: {
                  increment: incrementValue,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  static async upsertEssaAggregation(userId: string, essa: number) {
    const date = dayjs().format('DD.MM.YYYY');

    try {
      const potentialAggregation = await db.essaAggregation.findFirst({
        where: {
          date,
          userWrappedId: userId,
        },
      });

      await db.userWrapped.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          essaAggregation: {
            create: {
              date,
              essa,
            },
          },
        },
        update: {
          essaAggregation: {
            upsert: {
              where: {
                id: potentialAggregation?.id ?? '',
                date,
                userWrappedId: userId,
              },
              create: {
                date,
                essa,
              },
              update: {},
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
