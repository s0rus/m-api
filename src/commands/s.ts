import { fallback } from "@/lib/constants";
import { janapi } from "@/lib/janapi";
import { getMentionedUserId } from "@/lib/utils";
import { DCClient, DiscordCommand, UserSummary } from "@/types";
import dayjs from "dayjs";
import { EmbedBuilder } from "discord.js";

export const command: DiscordCommand = {
  name: "s",
  execute: async ({ client, message, args: _args }) => {
    const mentionedUserId = getMentionedUserId(message);
    const messageAuthorId = message.author.id;

    try {
      const data = await janapi.get("/summarize/user/:userId", {
        userId: mentionedUserId ?? messageAuthorId,
      });

      const embed = await getEmbed(
        client,
        data,
        mentionedUserId ?? messageAuthorId,
      );

      await message.reply({
        embeds: [embed],
      });
    } catch (error) {
      message.reply(
        "Podsumowanie jest na cooldownie. Spróbuj ponownie później.",
      );
      throw error;
    }
  },
  prefixRequired: true,
};

async function getEmbed(
  client: DCClient,
  userSummary: UserSummary,
  userId: string,
) {
  const {
    date,
    message_stats: {
      count,
      peak_activity_hour,
      longest_message_length,
      average_length,
    },
    content_insight: { top_topics },
  } = userSummary;

  const user = await client.users.fetch(userId);

  return new EmbedBuilder()
    .setAuthor({
      name: user.username ?? fallback.USERNAME,
      iconURL: user.avatarURL() ?? fallback.AVATAR,
    })
    .setTitle(`Podsumowanie użytkownika | ${dayjs().format("DD/MM/YY")}`)
    .addFields(
      {
        name: "Ilość wiadomości",
        value: String(count),
        inline: true,
      },
      {
        name: "Najdłuższa wiadomość",
        value: String(longest_message_length),
        inline: true,
      },
    )
    .addFields(
      {
        name: "Śr. długość wiadomości",
        value: String(parseFloat(average_length.toFixed(2))),
        inline: true,
      },
      {
        name: "Największa aktywność",
        value: String(
          dayjs().hour(peak_activity_hour).minute(0).second(0).format("HH:mm"),
        ),
        inline: true,
      },
    )
    .addFields({
      name: "Tematy wiadomości",
      value: `*${top_topics.join(", ")}*`,
    })
    .setTimestamp();
}
