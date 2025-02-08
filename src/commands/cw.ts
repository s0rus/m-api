import { env } from "@/env";
import { fallback } from "@/lib/constants";
import { janapi } from "@/lib/janapi";
import { tryCatch } from "@/lib/utils";
import { DCClient, DiscordCommand } from "@/types";
import dayjs from "dayjs";
import { EmbedBuilder } from "discord.js";

export const command: DiscordCommand = {
  name: "cw",
  execute: async ({ client, message }) => {
    const { data: personOfTheDay, error } = await tryCatch(
      janapi.get("/person"),
    );

    if (error || !personOfTheDay?.discord_id) {
      message.reply({
        content: `Wystąpił nieoczekiwany błąd przy pobieraniu ${env.EXPLICIT_WORDS?.split(",")[1] ?? "osoby"} dnia xd`,
      });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        `Unknown error - body: ${JSON.stringify(personOfTheDay)}`,
      );
    }

    const personOfTheDayEmbed = await getPersonOfTheDayEmbed(
      client,
      personOfTheDay.discord_id,
    );

    message.reply({
      embeds: [personOfTheDayEmbed],
    });
  },
  prefixRequired: true,
  documentation: {
    description: `Wyświetla ${env.EXPLICIT_WORDS?.split(",")[1] ?? "osobę"} dnia.`,
  },
};

const getPersonOfTheDayEmbed = async (client: DCClient, userId: string) => {
  const personOfTheDay = await client.users.fetch(userId);
  const username = personOfTheDay.username ?? fallback.USERNAME;
  const avatar = personOfTheDay.avatarURL() ?? fallback.AVATAR;

  return new EmbedBuilder()
    .setTitle(
      `${env.EXPLICIT_WORDS?.split(",")[0] ?? "Osoba"} dnia | ${dayjs().format("DD/MM/YY")}`,
    )
    .setDescription(`## ${username}`)
    .setThumbnail(avatar);
};
