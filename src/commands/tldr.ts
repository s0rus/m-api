import { janapi } from "@/lib/janapi";
import { DiscordCommand } from "@/types";

export const command: DiscordCommand = {
  name: "tldr",
  execute: async ({ client: _client, message, args: _args }) => {
    try {
      const data = await janapi.get("/summarize");

      message.reply(data.output);
    } catch (error) {
      message.reply("TLDR jest na cooldownie. Spróbuj ponownie później.");
      throw error;
    }
  },
  prefixRequired: true,
};
