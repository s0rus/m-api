import dayjs from 'dayjs';
import express from 'express';
import { MessageCountData } from 'src/interfaces/MessageCount';
import { prisma } from '../..';

const countRouter = express.Router();

countRouter.get<{}, MessageCountData>('/', async (req, res) => {
  try {
    const records = await prisma.aggregatedData.findMany();

    const parseRecords = () => {
      return records
        .map((record) => {
          return {
            ...record,
            date: dayjs(record.date).add(1, 'day').toDate(),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const data = parseRecords();

    const todaysCount = [...records].pop()?.count || 0;

    const messageCountSum = data.reduce((acc, curr) => {
      return acc + curr.count;
    }, 0);

    const maxCount = data.reduce((acc, curr) => (acc > curr.count ? acc : curr.count), 0) || 0;

    const minCount = data.reduce((acc, curr) => (acc < curr.count ? acc : curr.count), maxCount) || 0;

    const avgCount = messageCountSum / data.length || 0;

    res.json({
      content: [...data],
      todaysCount,
      maxCount,
      minCount,
      avgCount,
    });
  } catch (error) {
    res.status(500);
  }
});

export default countRouter;
