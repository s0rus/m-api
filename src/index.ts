import { api } from '@/api';
import '@/lib/discord-client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Warsaw');
process.env.TZ = 'Europe/Warsaw';

export default api;
