import { Message, userMention } from 'discord.js';
import { logger } from './utils';

const TWITTER_POST_URL_REGEX = /(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+))/g;

export function containsTwitterPostLink(text: string): boolean {
  const found = text.match(TWITTER_POST_URL_REGEX);

  return found !== null;
}

export function fixTwitterLinks(text: string) {
  return text.replace(TWITTER_POST_URL_REGEX, 'https://fxtwitter.com/$2/status/$4');
}

export async function replaceTwitterPostLink(message: Message) {
  try {
    const originalMessageContent = message.content;
    const messageAuthorId = message.author.id;

    await message.delete();

    const fixedMessageContent = fixTwitterLinks(originalMessageContent);
    await message.channel.send(`${userMention(messageAuthorId)} wysłał: ${fixedMessageContent}`);
  } catch (error) {
    logger.error(`[X-EMBED-ERROR]: Error while fixing twitter embed: ${error}`);
  }
}
