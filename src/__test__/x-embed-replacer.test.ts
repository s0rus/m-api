import { fixXLinks, replaceXPostLink } from '@/lib/x-embed-replacer';
import { describe, expect, jest, test } from 'bun:test';
import { Message } from 'discord.js';

describe('replaceXPostLink', () => {
  test('should replace x links', async () => {
    const originalMessageContent = `@soruse https://x.com/soruse/status/1501203200236620992 xD`;
    const expectedMessageContent = '@soruse https://fixupx.com/soruse/status/1501203200236620992 xD';
    const result = fixXLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should replace x links with random parameters', async () => {
    const originalMessageContent = `@soruse https://x.com/soruse/status/1777618404892946501?t=av2hCPYPqBn2yYm5R4SeiA&s=19 xD`;
    const expectedMessageContent = '@soruse https://fixupx.com/soruse/status/1777618404892946501?t=av2hCPYPqBn2yYm5R4SeiA&s=19 xD';
    const result = fixXLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should replace multiple x links', async () => {
    const originalMessageContent = `@soruse https://x.com/soruse/status/1501203200236620992 https://x.com/soruse/status/1501203200236620992 xD`;
    const expectedMessageContent =
      '@soruse https://fixupx.com/soruse/status/1501203200236620992 https://fixupx.com/soruse/status/1501203200236620992 xD';
    const result = fixXLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should not replace non-x links', async () => {
    const originalMessageContent = '@soruse https://discord.com/channels/1046777564775067728/1048729482627907624/1050427251394625586 xD';
    const expectedMessageContent = '@soruse https://discord.com/channels/1046777564775067728/1048729482627907624/1050427251394625586 xD';
    const result = fixXLinks(originalMessageContent);

    expect(result).toBe(expectedMessageContent);
  });

  test('should send message with fixed x link', async () => {
    const message = {
      content: '@soruse https://fixupx.com/soruse/status/1501203200236620992 xD',
      author: {
        id: '1234567890',
      },
      channel: {
        send: jest.fn(),
      },
      delete: jest.fn(),
    };

    await replaceXPostLink(message as unknown as Message);

    expect(message.channel.send).toHaveBeenCalledWith(
      `<@${message.author.id}> wysłał: @soruse https://fixupx.com/soruse/status/1501203200236620992 xD`
    );
  });
});
