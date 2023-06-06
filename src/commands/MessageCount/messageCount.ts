import { EmbedBuilder, Message } from 'discord.js';
import {
  fetchDayTotalCount,
  getAverageMessageCount,
  getMessageCountByUserId,
} from './messageCountManager';
import { embedFallback } from '../../helpers/embedFallback';
import { discordEmotes } from '../../constants/discordIds';

export const messageCount = async (message: Message) => {
  const guildName = message.guild
    ? message.guild.name
    : embedFallback.SERVER_NAME_FALLBACK;
  const guildIcon = message.guild
    ? message.guild.iconURL()
    : embedFallback.AVATAR_FALLBACK;

  const getStatus = {
    1: `${guildName} Umieralnia 💀`,
    2: 'Hujowo ale stabilnie ☝🏿',
    3: 'Norma wyrobiona 😮',
  };

  try {
    const todayCount = await fetchDayTotalCount();
    const avgCount = await getAverageMessageCount();
    const status = getStatusFunction(todayCount);

    function getStatusFunction(todayCount: number) {
      if (todayCount < 500) {
        return getStatus[1];
      } else if (todayCount >= 500 && todayCount < 2000) {
        return getStatus[2];
      } else if (todayCount >= 2000) {
        return getStatus[3];
      }
    }

    const discordEmote =
      todayCount < 1000
        ? discordEmotes.JASPER_WEIRD
        : discordEmotes.JASPER_HAPPY;

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription(`## ${guildName}`)
      .setThumbnail(guildIcon || '')
      .addFields({
        name: '```Dzisiaj```',
        value: `${discordEmote} ${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .addFields({
        name: '```Średnio```',
        value: `${discordEmotes.JASPER_HAPPY} ${
          avgCount ? Math.floor(avgCount) : '--'
        }`,
        inline: true,
      })
      .setFooter({
        text: status || embedFallback.FOOTER_FALLBACK,
        iconURL: guildIcon || embedFallback.AVATAR_FALLBACK,
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    console.log(error);
    message.channel.send(
      `${discordEmotes.OSTRZEZENIE} Wystąpił błąd podczas pobierania danych...`,
    );
  }
};

export const individualMessageCount = async (message: Message) => {
  const userMention = message.content.match(/<@(\d+)>/)?.[1];
  if (!userMention) {
    return;
  }
  const user = message.mentions.users.first();
  try {
    const { todayCount, allTimeCount } = await getMessageCountByUserId(
      userMention,
    );
    const currentDate = new Date();

    if (!user) {
      return;
    }
    const guildName = message.guild
      ? message.guild.name
      : embedFallback.SERVER_NAME_FALLBACK;
    const thumbnailUrl = user.avatarURL() ?? embedFallback.AVATAR_FALLBACK;
    const iconUrl = user.avatarURL() ?? embedFallback.AVATAR_FALLBACK;

    const todayEmote =
      todayCount < 200
        ? discordEmotes.JASPER_WEIRD
        : discordEmotes.JASPER_HAPPY;

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription(`# ${guildName}`)
      .setThumbnail(thumbnailUrl)
      .addFields({
        name: '```Dzisiaj```',
        value: `${todayEmote} ${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .addFields({
        name: '```Wszystkie```',
        value: `${discordEmotes.JASPER_HAPPY} ${JSON.stringify(
          allTimeCount,
          null,
          0,
        )}`,
        inline: true,
      })
      .setFooter({
        iconURL: iconUrl ? iconUrl.toString() : embedFallback.AVATAR_FALLBACK,
        text: `${user.username} | ${currentDate.toLocaleString()}`,
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    const err = error as Error;
    console.log(err);
    console.log(userMention);
    message.channel.send(err.message);
  }
};
