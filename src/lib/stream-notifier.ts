import { env } from '@/env';
import { INotifierItem } from '@/types';
import { ApiClient, HelixUser } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { EventSubHttpListener, ReverseProxyAdapter } from '@twurple/eventsub-http';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';
import { discordId, fallback, streamNotifierList } from './constants';
import { DiscordClient } from './discord-client';
import { getRoleMentionString, logger } from './utils';

const twitchAuthProvider = new AppTokenAuthProvider(env.TWITCH_CLIENT_ID, env.TWITCH_CLIENT_SECRET);
const twitchApiClient = new ApiClient({ authProvider: twitchAuthProvider });

function getDevAdapter() {
  return new NgrokAdapter({
    ngrokConfig: {
      authtoken: env.__DEV__NGROK_TOKEN,
    },
  });
}

function getProdAdapter() {
  return new ReverseProxyAdapter({
    hostName: env.MAPI_HOSTNAME,
    port: env.NODE_ENV === 'production' ? 8000 : 5000,
  });
}

async function setupStreamNotifier() {
  await twitchApiClient.eventSub.deleteAllSubscriptions();

  const listener = new EventSubHttpListener({
    apiClient: twitchApiClient,
    adapter: env.NODE_ENV === 'production' ? getProdAdapter() : getDevAdapter(),
    secret: env.NOTIFIER_SECRET,
  });

  listener.start();

  const channel = await DiscordClient.getInstance().channels.fetch(
    env.NODE_ENV === 'production' ? discordId.MAIN_CHANNEL_ID : discordId.TEST_CHANNEL_ID
  );

  streamNotifierList.forEach(async (streamer) => {
    try {
      const onlineSub = listener.onStreamOnline(streamer.twitchId, async (e) => {
        if (channel && channel.isTextBased()) {
          if (env.NODE_ENV === 'development') {
            await channel.send({
              content: `${getRoleMentionString(discordId.TEST_ROLE_ID)} Stream notify for ${streamer.twitchName} works correctly!`,
            });
            return;
          }

          const streamerTwitchInfo = await e.getBroadcaster();
          await sendStreamNotifyMessage({
            channel: channel as TextChannel,
            streamerTwitchInfo,
            streamer,
          });
        }
      });

      // onlineSub._verify();
      // if (onlineSub.verified) {
      //   logger.info(`Stream notifier for ${streamer.twitchName} is online!`);
      // }

      logger.info(`[${streamer.twitchName} test command]: ${await onlineSub.getCliTestCommand()}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`[STREAM-NOTIFIER-ERROR]: ${err.message}`);
    }
  });
}

env.NODE_ENV === 'production' && (await setupStreamNotifier());

async function sendStreamNotifyMessage({
  channel,
  streamerTwitchInfo,
  streamer,
}: {
  channel: TextChannel;
  streamerTwitchInfo: HelixUser;
  streamer: INotifierItem;
}) {
  const streamLinkButton = new ButtonBuilder()
    .setLabel('Oglądaj')
    .setURL(`https://www.twitch.tv/${streamerTwitchInfo.name ?? streamer.twitchName}`)
    .setStyle(ButtonStyle.Link);

  const streamInfoEmbed = new EmbedBuilder()
    .setThumbnail(streamerTwitchInfo.profilePictureUrl ?? fallback.AVATAR)
    .setDescription(`## ${streamerTwitchInfo.name ?? streamer.twitchName} odpalił streama!`);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(streamLinkButton);

  await channel.send({
    content: `${getRoleMentionString(streamer.notifyRoleId)}`,
    embeds: [streamInfoEmbed],
    components: [actionRow],
  });
}
