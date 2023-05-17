import { Message } from 'discord.js';
import {
  individualMessageCount,
  messageCount,
} from './MessageCount/messageCount';
import { ahaAdd, ahaRemove, ahaList, ahaRandom } from './Aha/ahaGifsManager';
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
    minArgs: 0,
    handler: async (message, args) => {
      const subCommand = args[0];
      switch (subCommand) {
        case 'remove':
          await ahaRemove(message, args.slice(1));
          break;
        case 'add':
          await ahaAdd(message, args.slice(1));
          break;
        case 'list':
          await ahaList(message);
          break;
        case 'random':
          await ahaRandom(message);
          break;
        default:
          console.log('Nieprawidłowe polecenie `aha`');
          break;
      }
    },
  },
  komendy: {
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
  const prefixedRegex = new RegExp(`^(${COMMAND_PREFIX})?([a-z]+)(\\s.*)?$`);
  const unprefixedRegex = new RegExp('^([a-z]+)(\\s.*)?$');

  if (prefixedRegex.test(input)) {
    const commandName = input.replace(COMMAND_PREFIX, '').split(/\s+/)[0];
    return (
      commands.hasOwnProperty(commandName) &&
      (!commands[commandName].prefixRequired ||
        input.startsWith(COMMAND_PREFIX))
    );
  } else if (unprefixedRegex.test(input)) {
    const commandName = input.split(/\s+/)[0];
    return commands.hasOwnProperty(commandName);
  }
  return false;
};

export const handleCommand = (message: Message) => {
  const { content: input } = message;

  if (!isValidCommand(input)) {
    return;
  }

  const commandRegex = new RegExp(`^(${COMMAND_PREFIX})?([a-z]+)(.*)?$`);
  const match = input.match(commandRegex)!;
  const commandName = match[2];
  const argsString = match[3] || '';
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
  command.handler(message, args);
};
