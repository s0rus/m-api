import { Message } from 'discord.js';
import { addAha, getAha, getRandomAha, listAha, removeAha } from './Aha/aha';
import {
  individualMessageCount,
  messageCount,
} from './MessageCount/messageCount';
export const COMMAND_PREFIX = '!' as const;

export type Command = {
  prefixRequired?: boolean;
  minArgs?: number;
  maxArgs?: number;
  handler: (message: Message, args: string[]) => void;
};

const commands: { [key: string]: Command } = {
  w: {
    prefixRequired: true,
    maxArgs: 1,
    handler: async (message, args) => {
      switch (args.length) {
        case 0:
          await messageCount(message);
          break;
        case 1:
          await individualMessageCount(message, args[0]);
          break;
        default:
          break;
      }
    },
  },
  aha: {
    handler: async (message, args) => {
      const dynamicArg = args[0];

      if (args[0]) {
        await getAha(message, parseInt(dynamicArg));
        return;
      }

      const subCommand = args[1] as 'add' | 'remove' | 'list' | 'random';
      switch (subCommand) {
        case 'add':
          await addAha(message, {
            ahaNumber: parseInt(args[2]),
            ahaUrl: args[3],
          });
          break;
        case 'remove':
          await removeAha(message, parseInt(args[2]));
          break;
        case 'list':
          await listAha(message);
          break;
        case 'random':
          await getRandomAha(message);
          break;
        default:
          break;
      }
    },
  },
  komendy: {
    prefixRequired: true,
    handler: async (message) => {
      const commandList = [
        '!aha remove `[numer]` ---- usuwa aha o określonym numerze z bazy danych',
        '!aha add `[numer]` `[url]` ---- dodaje aha o określonym numerze i gifie z discorda do bazy danych',
        '!aha list ---- pokazuje wszystkie aha',
        '!aha random ---- randomowe aha',
        '!w / `[@mention]` ---- pokazuje ilość wiadomości ogólna / wskazanego użytkownika',
      ].join('\n');

      message.reply(`Oto dostępne komendy:\n${commandList}`);
    },
  },
};

const isValidCommand = (input: string) => {
  const prefixedRegex = new RegExp(
    `^(${COMMAND_PREFIX})?([a-z]+)(\\d+)?(\\s.*)?$`,
    'i',
  );
  const unprefixedRegex = new RegExp('^([a-z]+)(\\d+)?(\\s.*)?$', 'i');

  if (prefixedRegex.test(input)) {
    const commandName = input.replace(COMMAND_PREFIX, '').match(/^[a-z]+/i)![0];
    return (
      commands.hasOwnProperty(commandName) &&
      (!commands[commandName].prefixRequired ||
        input.startsWith(COMMAND_PREFIX))
    );
  } else if (unprefixedRegex.test(input)) {
    const commandName = input.match(/^[a-z]+/i)![0];
    return commands.hasOwnProperty(commandName);
  }
  return false;
};

export const handleCommand = (message: Message) => {
  const { content: input } = message;

  if (!isValidCommand(input)) {
    return;
  }

  const commandRegex = new RegExp(
    `^(${COMMAND_PREFIX})?([a-z]+)(\\d+)?(.*)?$`,
    'i',
  );
  const match = input.match(commandRegex)!;
  const commandName = match[2];
  const dynamicNumber = match[3] || '';
  const argsString = match[4] || '';
  const args = argsString
    .trim()
    .split(/\s+/)
    .filter((arg) => arg !== '');

  const command = commands[commandName];

  if (
    args.length < (command.minArgs || 0) ||
    args.length > (command.maxArgs || Infinity)
  ) {
    return;
  }
  command.handler(message, [dynamicNumber, ...args]);
};
