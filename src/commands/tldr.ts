import { env } from "@/env";
import { janapiRoutes } from "@/lib/constants";
import { TCommand } from "@/types";

export const command: TCommand = {
  name: "tldr",
  execute: async ({ client: _client, message, args: _args }) => {
    const res = await fetch(
      `${env.ESSA_API_V2_URL}/api/v1${janapiRoutes.summarize}`,
      {
        headers: {
          Authorization: `Bearer ${env.ESSA_API_KEY_V2}`,
        },
        method: "GET",
      },
    );

    if (!res.ok) {
      message.reply("TLDR jest na cooldownie. Spróbuj ponownie później.");
      return;
    }

    const text = await res.text();
    message.reply(text);
  },
  prefixRequired: true,
};
