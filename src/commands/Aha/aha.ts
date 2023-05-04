import { Message } from 'discord.js';
import { ahaGifs } from './ahaGifs';

export const aha = async (message: Message) => {
  try {
    const name = message.content.substring(3);
    const link = ahaGifs.find(([n]) => n === name)?.[1];
    if (link) {
      message.channel.send(link);
    } else {
      console.log(`Nie znaleziono aha o liczbie ${name}`);
    }
  } catch (error) {
    console.log(error);
  }
};
