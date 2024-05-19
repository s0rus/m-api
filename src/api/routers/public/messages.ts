import { fetchDayTotalCount } from '@/commands/w';
import { db } from '@/lib/db';
import { Hono } from 'hono';

const messages = new Hono();

messages.get('/', async (c) => {
  try {
    const todayMessageCount = await fetchDayTotalCount();

    const globalMessageCountAggregation = await db.user.aggregate({
      _sum: {
        totalMessageCount: true,
      },
    });

    const globalMessageCountAllTime = globalMessageCountAggregation._sum.totalMessageCount;

    return c.json({
      todayMessageCount,
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
