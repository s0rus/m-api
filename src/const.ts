import { Message } from 'discord.js';

export const COMMAND_PREFIX = '!' as const;

export const COMMANDS = {
  messageCount: 'w',
  aha: 'aha',
  ahaRandom: 'aharandom',
  ahaList: 'ahalista',
} as const;

export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

const isValidCommand = (command: string, message: Message, customRegex?: string | RegExp) => {
  return new RegExp(customRegex ?? `^${command}$`).test(message.content.toLocaleLowerCase());
};

export const buildCommand = (
  command: Command,
  message: Message,
  customRegex?: string | RegExp,
  withoutPrefix?: boolean
) => {
  return isValidCommand(withoutPrefix ? command : `${COMMAND_PREFIX}${command}`, message, customRegex);
};
