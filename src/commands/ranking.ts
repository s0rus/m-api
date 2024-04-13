import type { TCommand } from '@/types';
import { EmbedBuilder } from 'discord.js';

export const command: TCommand = {
  name: 'ranking',
  execute: async ({ client, message }) => {
    const essaRankingEmbed = new EmbedBuilder()
      .setTitle(`Komenda zdeprecjonowana`)
      .setDescription(
        [
          `Aby uzyskać konsekwentność formy komend, ta została przeniesiona do`,
          `\u200b`,
          `> ## !essa ranking`,
          `\u200b`,
          `Ta informacja zostanie usunięta przy następnym deployu, pozdrawiam!`,
        ].join('\n')
      );

    message.reply({
      embeds: [essaRankingEmbed],
    });
    return;
  },
  prefixRequired: true,
};
