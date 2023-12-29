import { TClient } from '@/types';
import { Prisma } from '@prisma/client';
import chalk from 'chalk';
import dayjs from 'dayjs';
import type { Message } from 'discord.js';
import { discordId } from './constants';
import { db } from './db';

export function getTimeToReset() {
  const now = dayjs();
  const endOfDay = now.endOf('day');
  const duration = endOfDay.diff(now);

  const hours = Math.floor(duration / (60 * 60 * 1000));
  const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));

  return {
    hours,
    minutes,
  };
}

export default async function handleAvatarUpdate(client: TClient, message: Message) {
  try {
    const guild = client.guilds.cache.get(discordId.GUILD_ID);
    if (!guild) {
      throw new Error('Guild could not be found during avatar update.');
    }

    const user = message.author;
    const avatarUrl = user.avatarURL();
    if (!avatarUrl) {
      return;
    }

    const currentUser = await db.user.findUnique({
      where: { userId: user.id },
    });

    if (!currentUser) {
      return;
    }

    if (currentUser.avatar !== avatarUrl) {
      await db.user.update({
        where: { userId: user.id },
        data: {
          avatar: avatarUrl,
        },
      });

      logger.info(`Avatar for ${user.username} has been updated.`);
    }
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
}

export const logger = {
  info: (message: string) => {
    console.log(`${chalk.bgBlueBright('[INFO]')}: ${message}`);
  },
  warn: (message: string) => {
    console.log(`${chalk.bgYellow.black('[WARN]')}: ${message}`);
  },
  error: (message: string) => {
    console.log(`${chalk.bgRedBright.black('[ERROR]')}: ${message}`);
  },
  chatlog: (message: Message) => {
    console.log(
      `${chalk.bgCyan.white(`[${dayjs(message.createdAt).format('DD/MM/YYYY hh:mm A')}]`)} ${chalk.bold.bgGrey.white(
        message.author.username
      )}: ${message.content}`
    );
  },
};

export function handleError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(e.message);
  } else {
    logger.error(`There was unexpected error: ${e}`);
  }
}
