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
    const milliseconds = currentDate.getUTCMilliseconds();
    const remainingTime = calculateRemainingTime(
      minutes,
      seconds,
      milliseconds,
    );

    setTimeout(() => {
      mainChannel.send(`<@&${discordIds.NOSTALE_ROLE}> BB zaraz się zacznie!`);
    }, remainingTime);
  }
};

const calculateRemainingTime = (
  minutes: number,
  seconds: number,
  milliseconds: number,
) => {
  const minutesInHour = 60;
  const minutesOffset = 2;
  const evenHourOffset = 2;
  const millisecondsPerMinute = 60000;
  const millisecondsPerSecond = 1000;

  const remainingMinutes = (minutes + minutesOffset) % evenHourOffset;
  const remainingTime =
    (evenHourOffset - remainingMinutes) *
      minutesInHour *
      millisecondsPerMinute -
    minutes * millisecondsPerMinute -
    seconds * millisecondsPerSecond -
    milliseconds;

  return remainingTime;
};
