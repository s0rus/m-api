import express from 'express';
import { fetchMessageCountData } from './../../fetchMessageCountData';
import { MessageCountData } from '../../interfaces/MessageCount';

const countRouter = express.Router();

countRouter.get<{}, MessageCountData>('/', async (req, res) => {
  try {
    const { content, todaysCount, maxCount, minCount, avgCount } = await fetchMessageCountData();
    res.json({
      content,
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
