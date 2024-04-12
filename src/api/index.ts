import { env } from '@/env';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { serveStatic } from 'hono/bun';
import { wrapped } from './routers/wrapped';

const app = new Hono();
app.use('/static/*', serveStatic({ root: './' }));

const api = app.basePath('/api/v2/');
api.get('/healthcheck', (c) => {
  return c.text('API Operational!');
});
api.use('/*', bearerAuth({ token: env.MAPI_AUTH_TOKEN }));
api.route('/wrapped', wrapped);
// api.route('/messages', messages);

export { app };
