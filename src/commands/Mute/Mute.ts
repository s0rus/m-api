import { Message } from 'discord.js';
import { discordRoles, discordEmotes } from '../../constants/discordIds';

export const muteUser = async (message: Message, args: string[]) => {
  if (!message.member?.roles.cache.has(discordRoles.ADMIN_ROLE)) {
    message.reply(`Nie masz uprawnień ${discordEmotes.SIGMA}`);
    return;
  }

  const targetUser = message.mentions.users.first();
  if (!targetUser) {
    message.reply(
      `Oznacz użytkownika aby go zmutować ${discordEmotes.SMIESZEK}`,
    );
    return;
  }

  const muteRole = message.guild?.roles.cache.find(
    (role) => role.id === discordRoles.MUTED_ROLE,
  );
  if (!muteRole) {
    message.reply(`Nie znaleziono rangi. <@&${discordRoles.MUTED_ROLE}>`);
    return;
  }

  const member = message.guild?.members.cache.get(targetUser.id);
  if (!member) {
    message.reply(
      `Nie ma takiego użytkownika na serwerze ${discordEmotes.AHA}`,
    );
    return;
  }

  if (member.roles.cache.has(muteRole.id)) {
    message.reply(
      `${member.nickname} jest już zmutowany ${discordEmotes.SIGMA}`,
    );
    return;
  }

  const duration = args[2];
  if (!duration || !/^\d+[smhd]$/.test(duration)) {
    message.reply(
      `Nieprawidłowy format czasu. Podaj prawidłowy format czasu (np. 10s, 1m, 2h).`,
    );
    return;
  }

  const timeUnit = duration.slice(-1);
  const timeValue = parseInt(duration.slice(0, -1));

  let muteDuration = 0;
  switch (timeUnit) {
    case 's':
      muteDuration = timeValue * 1000;
      break;
    case 'm':
      muteDuration = timeValue * 60 * 1000;
      break;
    case 'h':
      muteDuration = timeValue * 60 * 60 * 1000;
      break;
    case 'd':
      muteDuration = timeValue * 24 * 60 * 60 * 1000;
      break;
    default:
      break;
  }

  await member.roles.add(muteRole);
  message.reply(
    `Użytkownik ${targetUser} został zmutowany na ${duration} ${discordEmotes.JASPER_HAPPY}`,
  );

  setTimeout(async () => {
    if (member.roles.cache.has(muteRole.id)) {
      await member.roles.remove(muteRole);
      message.channel.send(
        `Użytkownik ${targetUser} został odmutowany po upływie czasu ${duration} ${discordEmotes.JASPER_WEIRD}`,
      );
    }
  }, muteDuration);
};

export const unmuteUser = async (message: Message) => {
  if (!message.member?.roles.cache.has(discordRoles.ADMIN_ROLE)) {
    message.reply(`Nie masz uprawnień ${discordEmotes.OSTRZEZENIE}`);
    return;
  }

  const targetUser = message.mentions.users.first();
  if (!targetUser) {
    message.reply(
      `Oznacz użytkownika aby go odmutować ${discordEmotes.JASPER_WEIRD}`,
    );
    return;
  }

  const muteRole = message.guild?.roles.cache.get(discordRoles.MUTED_ROLE);
  if (!muteRole) {
    message.reply(`Nie znaleziono rangi. <@&${discordRoles.MUTED_ROLE}>`);
    return;
  }

  const member = message.guild?.members.cache.get(targetUser.id);
  if (!member) {
    message.reply(
      `Nie ma takiego użytkownika na serwerze ${discordEmotes.AHA}`,
    );
    return;
  }

  if (!member.roles.cache.has(muteRole.id)) {
    message.reply(
      `${member.nickname} jest już odmutowany ${discordEmotes.JASPER_HAPPY}`,
    );
    return;
  }

  await member.roles.remove(muteRole);
  message.reply(
    `Użytkownik ${targetUser} został odmutowany ${discordEmotes.JASPER_HAPPY}`,
  );
};
