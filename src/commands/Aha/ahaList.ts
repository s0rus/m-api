import { Message } from 'discord.js';
import { ahaGifs } from './ahaGifs';

export const ahaList = async (message: Message) => {
  try {
    const numbers = ahaGifs.map(([n]) => n);
    message.channel.send(`Lista numerów aha: ${numbers.join(', ')}`);
  } catch (error) {
    console.log(error);
  }
};
