import { StreamNotifierItem } from "@/types";

export const fallback = {
  AVATAR: "https://cdn.discordapp.com/embed/avatars/1.png",
  USERNAME: "<unknown user>",
  SERVER: "<unknown server>",
} as const;

export const discordId = {
  GUILD_ID: "1046777564775067728",
  BOT_ID: "1295322289415651378",
  PROBOT_ID: "282859044593598464",
  CBOT_ID: "1155092553067147336",
  BIRTHDAY_ROLE_ID: "1217053821759651942",
  MAIN_CHANNEL_ID: "1048729482627907624",
  TEST_CHANNEL_ID: "1126048496194179142",
  TEST_ROLE_ID: "1197515184596598884",
} as const;

export const discordEmote = {
  OSTRZEZENIE: "<:ostrzezenie:1108028955220512838>",
  SMIESZEK: "<:Smieszek:1050427251394625586>",
  OSTATNIA_SZANSA: "<:ostatniaszansa:1078048819075354715>",
  AHA: "<:aha:1047239820528853042>",
  JASPER_HAPPY: "<:jasperHappy:1047239809208426656>",
  JASPER_WEIRD: "<:Weird:1243163283234492507>",
} as const;

export const EMBED_SPACER = "\u200b";

export const janapiRoutes = {
  message: "/message",
  summarize: "/summarize",
} as const;

export const streamNotifierList: StreamNotifierItem[] = [
  {
    twitchId: 8822303,
    twitchName: "overpow",
    notifyRoleId: "1196440740994220094",
  },
  {
    twitchId: 36954803,
    twitchName: "h2p_gucio",
    notifyRoleId: "1195704091389730826",
  },
  {
    twitchId: 106318725,
    twitchName: "demonzz1",
    notifyRoleId: "1196440907105435758",
  },
  {
    twitchId: 268563714,
    twitchName: "fvlvte",
    notifyRoleId: "1351970539912036352",
  },
  {
    twitchId: 736170345,
    twitchName: "klaun__0k",
    notifyRoleId: "1351970539912036352",
  },
];
