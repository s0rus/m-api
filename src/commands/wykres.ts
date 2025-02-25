import { janapi } from "@/lib/janapi";
import { getMentionedUserId, logger } from "@/lib/utils";
import { DiscordCommand } from "@/types";

export const command: DiscordCommand = {
  name: "wykres",
  execute: async ({ client: _client, message }) => {
    try {
      const mentionedUserId = getMentionedUserId(message);
      const messageAuthorId = message.author.id;

      const chart = await janapi.get("/chart/:userId", {
        userId: mentionedUserId ?? messageAuthorId,
      });

      message.reply({
        files: [
          {
            attachment: chart.url,
          },
        ],
      });
    } catch (error) {
      const err = error as Error;
      logger.error(err.message);
      message.reply("Wystąpił błąd podczas pobierania wykresu xd");
    }
  },
  prefixRequired: true,
  documentation: {
    description: "Wyświetla wykres essy dla użytkownika.",
    variants: [
      {
        usage: "<@user>",
        description: "Wyświetla wykres essy oznaczonego użytkownika.",
      },
    ],
  },
};
