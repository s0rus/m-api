import { db } from '@/lib/db';
import { Hono } from 'hono';

const messages = new Hono();

messages.get('/', async (c) => {
  try {
    const globalMessageCountAggregation = await db.user.aggregate({
      _sum: {
        totalMessageCount: true,
      },
    });

    const globalMessageCountAllTime = globalMessageCountAggregation._sum.totalMessageCount;

    if (!globalMessageCountAllTime) {
      return c.notFound();
    }

    return c.json({
      globalMessageCountAllTime,
    });
  } catch (err) {
    c.status(500);
    return c.json({
      message: 'Internal server error',
    });
  }
});

export { messages };
