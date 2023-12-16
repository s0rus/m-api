import type { TCommand } from '@/types';

export const command: TCommand = {
  name: 'ping',
  execute: async ({ client, message }) => {
    await message.reply('Pong!');
  },
  prefixRequired: true,
};
