import { Client, TextChannel } from 'discord.js';
import { discordIds } from '../constants/discordIds';

export const pingInstantBattle = (client: Client) => {
  const targetRole = client.guilds.cache
    .get(discordIds.GUILD_ID)
    ?.roles.cache.get(discordIds.NOSTALE_ROLE);
  const mainChannel = client.guilds.cache
    .get(discordIds.GUILD_ID)
    ?.channels.cache.get(discordIds.MAIN_CHANNEL_ID);

  if (targetRole && mainChannel && mainChannel instanceof TextChannel) {
    const currentDate = new Date();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const milliseconds = currentDate.getMilliseconds();
    const remainingTime =
      (60 - minutes - 2) * 60000 - seconds * 1000 - milliseconds;

    setTimeout(() => {
      mainChannel.send(`<@&${discordIds.NOSTALE_ROLE}> BB zaraz się zacznie!`);
    }, remainingTime);
  }
};
