import { INTERNAL_DIR_URL, generateImage } from '@/lib/image-generator';
import { TCommand } from '@/types';

export const command: TCommand = {
  name: 'sigma',
  execute: async ({ client, message }) => {
    // const mention = message.mentions.users.first();

    // if (!mention) {
    //   return;
    // }

    try {
      await generateImage(message.author.id, 'soruse', message.author);
    } catch (error) {
      console.log(error);
    }

    const image = Bun.file(`${INTERNAL_DIR_URL}/w/${message.author.id}.png`);
    const buffer = Buffer.from(await image.arrayBuffer());

    message.reply({
      files: [buffer],
    });
  },
  prefixRequired: true,
};
