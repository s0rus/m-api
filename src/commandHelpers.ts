import { Message } from 'discord.js';

export const COMMAND_PREFIX = '!' as const;

export const COMMANDS = {
  messageCount: '!w',
  individualMessageCount: /^!w\s+(.+)$/,
  aha: /^aha[0-9]{1,}/,
  ahaRandom: '!aharandom',
  ahaList: '!ahalista',
} as const;

export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

const isValidCommand = (command: string | RegExp, message: Message) => {
  if (typeof command === 'string') {
    return new RegExp(`^${command}$`).test(message.content.toLocaleLowerCase());
  }

  return command.test(message.content.toLocaleLowerCase());
};

export const buildCommand = (command: Command, message: Message) => {
  return isValidCommand(command, message);
};
