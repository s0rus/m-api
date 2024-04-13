import { ImageResponse } from '@vercel/og';
import { User } from 'discord.js';
import path from 'node:path';

// ? To send generated image on discord:
// ?  const image = Bun.file(`${INTERNAL_DIR_URL}/w/${message.author.id}.png`);
// ?  const buffer = Buffer.from(await image.arrayBuffer());
// ?    message.reply({
// ?    files: [buffer],
// ?  });

export const INTERNAL_DIR_URL = path.join(import.meta.dir, '/__internal');

export async function generateImage(userId: string, username: string, user: User) {
  const avatar = user.displayAvatarURL();

  const image = new ImageResponse(
    {
      key: username,
      type: 'div',
      props: {
        tw: 'w-full h-full flex items-center justify-start relative px-24',
        style: {
          background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 100%)',
          backgroundImage: `url("http://localhost:5000/static/w_base.png"), linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 100%)`,
        },
        children: [
          {
            type: 'img',
            props: {
              tw: 'w-22 h-22 rounded-full absolute top-9 left-8',
              src: `${avatar}`,
            },
          },
        ],
      },
    },
    {
      width: 500,
      height: 180,
      headers: {
        'Content-Type': 'image/png',
      },
    }
  );

  const buffer = await image.arrayBuffer();
  Bun.write(`${INTERNAL_DIR_URL}/w/${userId}.png`, buffer);
}
