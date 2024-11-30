import { env } from "@/env";
import { logger } from "@/lib/utils";
import { TCommand } from "@/types";
import { writeFile, rm } from "node:fs/promises";
import path from "node:path";

export const command: TCommand = {
  name: "7tv",
  execute: async ({ client: _client, message, args }) => {
    // TODO: Remove this when completed
    if (env.NODE_ENV === "production") {
      return;
    }

    if (args[0]) {
      const uuid = crypto.randomUUID();
      const filePath = path.resolve(
        `${import.meta.dir}/../__internal__`,
        `${uuid}.gif`,
      );

      try {
        const imgBuffer = await getImageBufferFromUrl(args[0]);

        await writeFile(filePath, imgBuffer);

        await message.reply({ files: [filePath] });
        await rm(filePath);
      } catch (error) {
        const err = error as Error;
        logger.error(err.message);
        message.reply("Wystąpił błąd podczas pobierania emotki 7tv.");
      }
    }
  },
  prefixRequired: true,
};

async function getImageBufferFromUrl(url: string) {
  const res = await fetch(url, {
    method: "GET",
  });

  const contentType = res.headers.get("Content-type");
  console.log("CONTENT TYPE", contentType);

  const arrBuffer = await res.arrayBuffer();
  return Buffer.from(arrBuffer);
}
