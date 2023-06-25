import { Message } from 'discord.js';
import { addAha, getAha, getRandomAha, listAha, removeAha } from './Aha/aha';
import {
  individualMessageCount,
  messageCount,
  topThreeDays,
} from './MessageCount/messageCount';
export const COMMAND_PREFIX = '!' as const;
import { muteUser, unmuteUser } from './Mute/Mute';
import { getTopThreeDays } from './MessageCount/messageCountManager';
export type Command = {
  prefixRequired?: boolean;
  minArgs?: number;
  maxArgs?: number;
  handler: (message: Message, args: string[]) => void;
};
/*
  ! If you are adding a command that can either take arguments or not,
  ! you have to start taking the arguments from index 1, not 0 because
  ! the argument at index 0 is the dynamic value - this however you can
  ! utilize when you want to create a dynamic command like aha42 or aha69
*/
const commands: { [key: string]: Command } = {
  w: {
    prefixRequired: true,
    maxArgs: 1,
    handler: async (message, args) => {
      switch (args.length) {
        case 1:
          await messageCount(message);
          break;
        case 2:
          await individualMessageCount(message);
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
  mute: {
    prefixRequired: true,
    handler: async (message, args) => {
      await muteUser(message, args);
    },
  },
  unmute: {
    prefixRequired: true,
    handler: async (message) => {
      await unmuteUser(message);
    },
  },
  top: {
    prefixRequired: true,
    handler: async (message) => {
      await topThreeDays(message);
    },
  },
  komendy: {
    prefixRequired: true,
    handler: async (message) => {
      const commandList = [
        '!aha add `[numer]` `[url.gif]`',
        '!aha remove `[numer]`',
        '!aha list',
        '!aha random',
        '!w / <@1054784342251024425> ---- pokazuje ilość wiadomości ogólną / użytkownika',
        '!mute <@1054784342251024425> ---- wycisza / odcisza użytkownika',
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
