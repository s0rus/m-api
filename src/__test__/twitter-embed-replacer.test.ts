import { fixTwitterLinks, replaceTwitterPostLink } from '@/lib/twitter-embed-replacer';
import { describe, expect, jest, test } from 'bun:test';
import { Message } from 'discord.js';

describe('replaceTwitterPostLink', () => {
  test('should replace twitter links', async () => {
    const originalMessageContent = `@soruse https://twitter.com/soruse/status/1501203200236620992 xD`;
    const expectedMessageContent = '@soruse https://fxtwitter.com/soruse/status/1501203200236620992 xD';
    const result = fixTwitterLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should replace twitter links with random parameters', async () => {
    const originalMessageContent = `@soruse https://fxtwitter.com/soruse/status/1777618404892946501?t=av2hCPYPqBn2yYm5R4SeiA&s=19 xD`;
    const expectedMessageContent =
      '@soruse https://fxtwitter.com/soruse/status/1777618404892946501?t=av2hCPYPqBn2yYm5R4SeiA&s=19 xD';
    const result = fixTwitterLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should replace multiple twitter links', async () => {
    const originalMessageContent = `@soruse https://twitter.com/soruse/status/1501203200236620992 https://twitter.com/soruse/status/1501203200236620992 xD`;
    const expectedMessageContent =
      '@soruse https://fxtwitter.com/soruse/status/1501203200236620992 https://fxtwitter.com/soruse/status/1501203200236620992 xD';
    const result = fixTwitterLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should not replace non-twitter links', async () => {
    const originalMessageContent =
      '@soruse https://discord.com/channels/1046777564775067728/1048729482627907624/1050427251394625586 xD';
    const expectedMessageContent =
      '@soruse https://discord.com/channels/1046777564775067728/1048729482627907624/1050427251394625586 xD';
    const result = fixTwitterLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should send message with fixed twitter link', async () => {
    const message = {
      content: '@soruse https://twitter.com/soruse/status/1501203200236620992 xD',
      author: {
        id: '1234567890',
      },
      channel: {
        send: jest.fn(),
      },
      delete: jest.fn(),
    };

    await replaceTwitterPostLink(message as unknown as Message);

    expect(message.channel.send).toHaveBeenCalledWith(
      `<@${message.author.id}> wysłał: @soruse https://fxtwitter.com/soruse/status/1501203200236620992 xD`
    );
  });
});
