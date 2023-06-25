export const channelIds = {
  GUILD_ID: '1046777564775067728',
  MAIN_CHANNEL_ID: '1048729482627907624',
} as const;

export const discordRoles = {
  ADMIN_ROLE: '1049323068104921098',
  MUTED_ROLE: '1063888306053578772',
} as const;

export const discordEmotes = {
  OSTRZEZENIE: '<:ostrzezenie:1108028955220512838>',
  SMIESZEK: '<:Smieszek:1050427251394625586>',
  OSTATNIA_SZANSA: '<:ostatniaszansa:1078048819075354715>',
  AHA: '<:aha:1047239820528853042>',
  JASPER_HAPPY: '<:jasperHappy:1047239809208426656>',
  JASPER_WEIRD: '<:Weird:1047239828095389737>',
  SIGMA: '<:sigma:1080595607120511016>',
} as const;

export type DiscordId = (typeof channelIds)[keyof typeof channelIds];
export type DiscordRole = (typeof discordRoles)[keyof typeof discordRoles];
export type DiscordEmote = (typeof discordEmotes)[keyof typeof discordEmotes];
