import { db } from "@/lib/db";
import type { TCommand } from "@/types";
import { EmbedBuilder } from "discord.js";
import { z } from "zod";

export const command: TCommand = {
  name: "urodziny",
  execute: async ({ client, message, args }) => {
    if (args[0]) {
      const birthdayRegex = /^(0?[1-9]|[12][0-9]|3[01])[./](0?[1-9]|1[0-2])$/;
      if (birthdayRegex.test(args[0])) {
        const [d, m] = args[0].split(/[./]/);
        const { success: dayIsValid } = z.coerce.number().safeParse(d);
        const { success: monthIsValid } = z.coerce.number().safeParse(m);

        if (!dayIsValid || !monthIsValid) {
          message.reply("Podaj poprawny format daty urodzin: DD/MM");
          return;
        }

        const birthday = {
          day: Number(d),
          month: Number(m),
        };

        try {
          await db.birthday.upsert({
            where: {
              userId: message.author.id,
            },
            update: {
              day: birthday.day,
              month: birthday.month,
            },
            create: {
              userId: message.author.id,
              day: birthday.day,
              month: birthday.month,
            },
          });
        } catch (e) {
          const error = e as Error;
          message.reply(error.message);
          return;
        }

        message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Sukces!")
              .setDescription(
                `Twoje urodziny zostały zapisane: **${stringifyBirthdayDate({ day: birthday.day, month: birthday.month })}**`,
              ),
          ],
        });
      } else {
        message.reply("Podaj poprawny format daty urodzin: DD/MM");
      }
    } else {
      const birthdays = await getBirthdays();

      if (birthdays.length <= 0) {
        message.reply("Lista urodzin jest pusta.");
      }
      const birthdayList = buildBirthdaysList(birthdays);
      const listEmbed = new EmbedBuilder()
        .setTitle("Lista urodzin")
        .setDescription(birthdayList);
      message.reply({ embeds: [listEmbed] });
    }
  },
  prefixRequired: true,
};

async function getBirthdays() {
  const birthdays = await db.birthday.findMany({
    include: {
      user: true,
    },
  });

  return birthdays;
}

export type BirthdayWithUser = Awaited<ReturnType<typeof getBirthdays>>[number];

function buildBirthdaysList(birthdays: BirthdayWithUser[]) {
  const sortedBirthdayList = birthdays.sort((a, b) => {
    const aTime = getTimeToNextBirthday(a);
    const bTime = getTimeToNextBirthday(b);
    return aTime - bTime;
  });

  const birthdaysList = sortedBirthdayList.map((birthday) => {
    const user = birthday.user;
    return `**${user.name}** — ${stringifyBirthdayDate({ day: birthday.day, month: birthday.month })} - Urodziny za **${getTimeToNextBirthday(birthday)}** dni`;
  });

  return birthdaysList.join("\n");
}

function getTimeToNextBirthday(birthday: BirthdayWithUser) {
  const today = new Date();
  const currentYear = today.getFullYear();

  let nextOccurance = new Date(currentYear, birthday.month - 1, birthday.day);

  if (nextOccurance < today) {
    nextOccurance = new Date(currentYear + 1, birthday.month - 1, birthday.day);
  }

  const diffInMs = nextOccurance.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

function stringifyBirthdayDate({ day, month }: { day: number; month: number }) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}
