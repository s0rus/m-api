import { env } from '@/env';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { wrapped } from './routers/wrapped';

const api = new Hono().basePath('/api/v2/');

api.get('/healthcheck', (c) => {
  return c.text('API Operational!');
});

api.use('/*', bearerAuth({ token: env.AUTH_TOKEN }));
// api.route('/messages', messages);
api.route('/wrapped', wrapped);

export { api };
