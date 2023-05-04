import { EmbedBuilder, Message } from 'discord.js';
import { fetchMessageCountData } from './fetchMessageCountData';

export const messageCount = async (message: Message) => {
  try {
    const { todaysCount, avgCount } = await fetchMessageCountData();

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription('Dziadkownia')
      .setThumbnail('https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless')
      .addFields({
        name: '```Wiadomości dzisiaj```',
        value: `${JSON.stringify(todaysCount, null, 0)}`,
        inline: true,
      })
      .setFooter({
        text: `Średnio: ${JSON.stringify(parseFloat(avgCount.toFixed(2)), null, 0)}`,
        iconURL: 'https://cdn.discordapp.com/emojis/1047234305191063702.webp?size=96&quality=lossless',
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    console.log(error);
    message.channel.send('Wystąpił błąd podczas pobierania danych...');
  }
};
