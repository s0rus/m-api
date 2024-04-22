import { app } from '@/api';
import '@/lib/discord-client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import { env } from './env';

if (env.NODE_ENV === 'production') {
  await import('@/lib/stream-notifier');
}

dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Warsaw');
process.env.TZ = 'Europe/Warsaw';
dayjs.extend(customParseFormat);

export default {
  port: 5000,
  fetch: app.fetch,
} as {
  port: number;
  fetch: typeof app.fetch;
};
