import { DCClient } from "@/types";
import { Prisma } from "@prisma/client";
import chalk from "chalk";
import dayjs from "dayjs";
import { Message } from "discord.js";
import { discordId, fallback } from "./constants";
import { db } from "./db";
import { janapiV2 } from "./janapi";

export function getRoleMentionString(roleId: string) {
  return `<@&${roleId}>`;
}

export function getMentionedUserId(message: Message) {
  const isReply = message.reference;

  if (!isReply) {
    const user = message.mentions.users.first();
    if (!user?.bot && user?.id) {
      return user.id;
    }
    return null;
  }

  const user = message.mentions.users.at(1);
  if (!user?.bot && user?.id) {
    return user.id;
  }
  return null;
}

export function getMentionedUserUsername(message: Message) {
  const isReply = message.reference;

  if (!isReply) {
    const user = message.mentions.users.first();
    if (!user?.bot && user?.id) {
      return user.username;
    }
    return fallback.USERNAME;
  }

  const user = message.mentions.users.at(1);
  if (!user?.bot && user?.id) {
    return user.username;
  }
  return fallback.USERNAME;
}

export function getMentionedUserAvatar(message: Message) {
  const isReply = message.reference;

  if (!isReply) {
    const user = message.mentions.users.first();
    if (!user?.bot && user?.id) {
      return user.avatarURL();
    }
    return fallback.AVATAR;
  }

  const user = message.mentions.users.at(1);
  if (!user?.bot && user?.id) {
    return user.avatarURL();
  }
  return fallback.AVATAR;
}

export function getTimeToReset() {
  const now = dayjs();
  const endOfDay = now.endOf("day");
  const duration = endOfDay.diff(now);

  const hours = Math.floor(duration / (60 * 60 * 1000));
  const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));

  return {
    hours,
    minutes,
  };
}

export default async function handleAvatarUpdate(
  client: DCClient,
  message: Message,
) {
  try {
    const guild = client.guilds.cache.get(discordId.GUILD_ID);
    if (!guild) {
      throw new Error("Guild could not be found during avatar update.");
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
          name: user.username,
        },
      });

      logger.info(`Avatar/Username for ${user.username} has been updated.`);
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`[AVATAR-UPDATE-ERROR]: ${err.message}`);
  }
}

export async function postMessageLog(message: Message) {
  try {
    if (message.content) {
      const messageData = {
        discord_id: message.author.id,
        content: message.content,
      };

      await janapiV2.post("/message", messageData);
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`[MESSAGE-LOG-ERROR]: ${err.message}`);
  }
}

export const logger = {
  info: (message: string) => {
    console.log(`${chalk.bgBlueBright("[INFO]")}: ${message}`);
  },
  warn: (message: string) => {
    console.log(`${chalk.bgYellow.black("[WARN]")}: ${message}`);
  },
  error: (message: string) => {
    console.log(`${chalk.bgRedBright.black("[ERROR]")}: ${message}`);
  },
  chatlog: (message: Message) => {
    console.log(
      `${chalk.bgCyan.white(`[${dayjs(message.createdAt).format("DD/MM/YYYY hh:mm A")}]`)} ${chalk.bold.bgGrey.white(
        message.author.username,
      )}: ${message.content}`,
    );
  },
};

export function handleError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(e.message);
  } else {
    logger.error(`[UNEXPECTED-ERROR]: ${e}`);
  }
}
