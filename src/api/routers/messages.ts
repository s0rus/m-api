import { Hono } from 'hono';

const messages = new Hono();

messages.get('/', async (c) => {
  const messages = null;
  if (!messages) {
    return c.notFound();
  }
  return c.json(messages);
});

export { messages };
