import { Message, userMention } from 'discord.js';
import { logger } from './utils';

const X_POST_URL_REGEX = /(https?:\/\/x\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+))/g;

export function containsXPostLink(text: string): boolean {
  const found = text.match(X_POST_URL_REGEX);

  return found !== null;
}

export function fixXLinks(text: string) {
  return text.replace(X_POST_URL_REGEX, 'https://fixupx.com/$2/status/$4');
}

export async function replaceXPostLink(message: Message) {
  try {
    const originalMessageContent = message.content;
    const messageAuthorId = message.author.id;

    await message.delete();

    const fixedMessageContent = fixXLinks(originalMessageContent);
    await message.channel.send(`${userMention(messageAuthorId)} wysłał: ${fixedMessageContent}`);
  } catch (error) {
    logger.error(`[X-EMBED-ERROR]: Error while fixing X embed: ${error}`);
  }
}
