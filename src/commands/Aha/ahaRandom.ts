import { Message } from 'discord.js';
import { ahaGifs } from './ahaGifs';

export const ahaRandom = async (message: Message) => {
  try {
    const randomIndex = Math.floor(Math.random() * ahaGifs.length);
    const randomAha = ahaGifs[randomIndex][1];
    message.channel.send(randomAha);
  } catch (error) {
    console.log(error);
  }
};
