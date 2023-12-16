import { env } from '@/env';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { messages } from './routers/messages';

const api = new Hono().basePath('/api/v2/');

api.use('/*', bearerAuth({ token: env.AUTH_TOKEN }));

// api.get('/', (c) => {
//   return c.text('Hello Hono!');
// });

api.route('/messages', messages);

export { api };
