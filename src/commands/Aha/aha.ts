import { Message } from 'discord.js';
import { prisma } from '../../index';

// export const ahaGif = async (message: Message, gifId: string) => {
//   const ahaGif = await prisma.ahaGifs.findFirst({
//     where: {
//       id: gifId,
//     },
//   });

//   if (ahaGif) {
//     message.channel.send(ahaGif.url);
//   } else {
//     console.log(`Nie znaleziono aha o numerze ${gifId}`);
//   }
// };
// do fixu spk ok
