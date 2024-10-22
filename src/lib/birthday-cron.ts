import cron from "node-cron";
import { DiscordClient } from "./discord-client";
import { discordId } from "./constants";
import { db } from "./db";
import dayjs from "dayjs";
import { logger } from "./utils";
import { BirthdayWithUser } from "@/commands/urodziny";
import { EmbedBuilder } from "discord.js";
import { TClient } from "@/types";

cron.schedule("0 1 * * *", async () => {
  try {
    await cleanBirthdayRoleList();
    await populateBirthdayRoleList();
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
});

async function populateBirthdayRoleList() {
  const birthdayPeople = await db.birthday.findMany({
    where: {
      day: {
        equals: dayjs().date(),
      },
      month: {
        // NOTE: month is indexed from 0 hence the +1
        equals: dayjs().month() + 1,
      },
    },
    include: {
      user: true,
    },
  });

  if (birthdayPeople.length <= 0) {
    return;
  }

  const client = DiscordClient.getInstance();
  const guild = await client.guilds.fetch(discordId.GUILD_ID);

  const members = await guild.members.fetch();

  birthdayPeople.forEach((person) => {
    const member = members.find((member) => member.user.id === person.userId);
    if (member) {
      member.roles.add(discordId.BIRTHDAY_ROLE_ID);
    }
  });

  notifyAboutBirthdays({
    client,
    birthdays: birthdayPeople,
  });
}

async function cleanBirthdayRoleList() {
  const guild = await DiscordClient.getInstance().guilds.fetch(
    discordId.GUILD_ID,
  );

  const members = await guild.members.fetch();

  const birthdayMembers = members.filter((member) =>
    member.roles.cache.has(discordId.BIRTHDAY_ROLE_ID),
  );

  birthdayMembers.forEach((member) => {
    member.roles.remove(discordId.BIRTHDAY_ROLE_ID);
  });
}

async function notifyAboutBirthdays({
  client,
  birthdays,
}: {
  client: TClient;
  birthdays: BirthdayWithUser[];
}) {
  const channel = await client.channels.fetch(discordId.MAIN_CHANNEL_ID);

  if (channel && channel.isTextBased()) {
    birthdays.forEach(async (birthday) => {
      const user = await client.users.fetch(birthday.userId);
      if (user) {
        const embed = new EmbedBuilder()
          .setTitle("Urodziny! 🎉")
          .setDescription(
            `## ${user.username} ma dzisiaj urodziny! Wszystkiego najlepszego!`,
          );
        channel.send({
          content: "@everyone",
          embeds: [embed],
        });
      }
    });
  } else {
    logger.error("Could not find main channel while notifying about birthdays");
    return;
  }
}
