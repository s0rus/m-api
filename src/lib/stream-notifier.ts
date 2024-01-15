import { env } from '@/env';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { EventSubHttpListener, ReverseProxyAdapter } from '@twurple/eventsub-http';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { discordId, streamerId } from './constants';
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
    port: 8000,
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

  listener.onVerify((e: boolean) => {
    if (e) {
      logger.info('Stream notifier is online!');
    }
  });

  const gucciSub = listener.onStreamOnline(streamerId.GUCCI, async (_e) => {
    const channel = await DiscordClient.getInstance().channels.fetch(
      env.NODE_ENV === 'production' ? discordId.MAIN_CHANNEL_ID : discordId.TEST_CHANNEL_ID
    );
    if (channel?.isTextBased()) {
      channel.send(`${getRoleMentionString(discordId.GUCCI_ROLE_ID)} Gucio odpalił streama!`);
    }
  });

  const demonzSub = listener.onStreamOnline(streamerId.DEMONZ, async (_e) => {
    const channel = await DiscordClient.getInstance().channels.fetch(
      env.NODE_ENV === 'production' ? discordId.MAIN_CHANNEL_ID : discordId.TEST_CHANNEL_ID
    );
    if (channel?.isTextBased()) {
      channel.send(`${getRoleMentionString(discordId.DEMONZ_ROLE_ID)} Demonz odpalił streama!`);
    }
  });

  const overpowSub = listener.onStreamOnline(streamerId.OVERPOW, async (_e) => {
    const channel = await DiscordClient.getInstance().channels.fetch(
      env.NODE_ENV === 'production' ? discordId.MAIN_CHANNEL_ID : discordId.TEST_CHANNEL_ID
    );
    if (channel?.isTextBased()) {
      channel.send(`${getRoleMentionString(discordId.OVERPOW_ROLE_ID)} Overpow odpalił streama!`);
    }
  });

  logger.info(`[h2p_gucio listener test command]: ${await gucciSub.getCliTestCommand()}`);
  logger.info(`[demonzz1 listener test command]: ${await demonzSub.getCliTestCommand()}`);
  logger.info(`[overpow listener test command]: ${await overpowSub.getCliTestCommand()}`);
}

await setupStreamNotifier();
