import { EmbedBuilder, Message } from 'discord.js';
import {
  fetchDayTotalCount,
  getAverageMessageCount,
  // getMessageCountByUserId,
} from './messageCountManager';

export const messageCount = async (message: Message) => {
  const guildName = message.guild ? message.guild.name : 'Nazwa Serwera';
  const guildIcon = message.guild ? message.guild.iconURL() : '';

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

    const messageCountEmbed = new EmbedBuilder()
      .setColor(0x6c42f5)
      .setDescription(`## ${guildName}`)
      .setThumbnail(`${guildIcon}`)
      .addFields({
        name: '```Dzisiaj```',
        value: `📩 ${JSON.stringify(todayCount, null, 0)}`,
        inline: true,
      })
      .addFields({
        name: '```Średnio```',
        value: `📩 ${avgCount ? Math.floor(avgCount) : '--'}`,
        inline: true,
      })
      .setFooter({
        text: `${status}`,
        iconURL: `${guildIcon}`,
      });

    message.channel.send({ embeds: [messageCountEmbed] });
  } catch (error) {
    console.log(error);
    message.channel.send('Wystąpił błąd podczas pobierania danych...');
  }
};

// export const individualMessageCount = async (
//   message: Message,
//   userMention: string,
// ) => {
//   const userId = userMention.substring(2);
//   const user = message.mentions.users.first();

//   try {
//     const { todayCount, allTimeCount } = await getMessageCountByUserId(userId);
//     const currentDate = new Date();

//     if (!user) {
//       return;
//     }
//     const guildName = message.guild ? message.guild.name : 'Nazwa Serwera';

//     const messageCountEmbed = new EmbedBuilder()
//       .setColor(0x6c42f5)
//       .setDescription(`# ${guildName}`)
//       .setThumbnail(user.avatar)
//       .addFields({
//         name: '```Dzisiaj```',
//         value: `📩 ${JSON.stringify(todayCount, null, 0)}`,
//         inline: true,
//       })
//       .addFields({
//         name: '```Wszystkie```',
//         value: `✉️ ${JSON.stringify(allTimeCount, null, 0)}`,
//         inline: true,
//       })
//       .setFooter({
//         iconURL: user.avatar ?? undefined,
//         text: `${user.username} | ${currentDate.toLocaleString()}`, // lub `${user.tag} | ${currentDate.toLocaleString()}`
//       });

//     message.channel.send({ embeds: [messageCountEmbed] });
//   } catch (error) {
//     const err = error as Error;
//     console.log(err);
//     console.log(userId);
//     message.channel.send(err.message);
//   }
// };
