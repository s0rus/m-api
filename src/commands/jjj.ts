import { fallback } from "@/lib/constants";
import { janapiV2 } from "@/lib/janapi";
import { getMentionedUserId } from "@/lib/utils";
import { DailyEmote, DCClient, DiscordCommand } from "@/types";
import dayjs from "dayjs";
import { EmbedBuilder } from "discord.js";

export const command: DiscordCommand = {
  name: "jjj",
  execute: async ({ client, message }) => {
    const mentionedUserId = getMentionedUserId(message);
    const messageAuthorId = message.author.id;

    const jjj = await janapiV2.get("/dailyemote/:userId", {
      userId: mentionedUserId ?? messageAuthorId,
    });

    if (jjj) {
      const jjjEmbed = await getJJEmbed(client, jjj);

      message.reply({
        embeds: [jjjEmbed],
      });
    } else {
      message.reply({
        content: "Wystąpił nieoczekiwany błąd przy pobieraniu jjj xd",
      });
      return;
    }
  },
  prefixRequired: true,
  documentation: {
    description: "Wyświetla jakim janem dzisiaj jest użytkownik.",
    variants: [
      {
        usage: "<@user>",
        description: "Wyświetla jakim janem dzisiaj jest oznaczony użytkownik.",
      },
    ],
  },
};

const getJJEmbed = async (client: DCClient, jjUser: DailyEmote) => {
  const user = await client.users.fetch(jjUser.discord_id);
  const username = user.username ?? fallback.USERNAME;

  return new EmbedBuilder()
    .setTitle(`Jakim Janem Jesteś | ${dayjs().format("DD/MM/YY")}`)
    .setDescription(`## ${username}`)
    .setThumbnail(jjUser.emote);
};
