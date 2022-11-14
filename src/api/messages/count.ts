import express from 'express';
import { prisma } from '../..';

interface AggregatedData {
  date: string;
  count: number;
  id: string;
}

const countRouter = express.Router();

countRouter.get<{}, AggregatedData[]>('/', async (req, res) => {
  try {
    const records = await prisma.aggregatedData.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    res.json(records);
  } catch (error) {}
});

export default countRouter;
