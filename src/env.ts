import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    MAPI_HOSTNAME: z.string().min(1),
    MAPI_AUTH_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    DISCORD_BOT_TOKEN: z.string().min(1),
    ESSA_API_URL: z.string().url(),
    ESSA_API_KEY: z.string().min(1),
    ESSA_API_V2_URL: z.string().url(),
    ESSA_API_KEY_V2: z.string().min(1),
    TWITCH_CLIENT_ID: z.string().min(1),
    TWITCH_CLIENT_SECRET: z.string().min(1),
    NOTIFIER_SECRET: z.string().min(1),
    __DEV__NGROK_TOKEN: z.string().optional(),
    EXPLICIT_WORDS: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
