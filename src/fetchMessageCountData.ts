import dayjs from 'dayjs';
import { prisma } from './index';
import { MessageCountData, Record } from './interfaces/MessageCount';

export async function fetchMessageCountData(): Promise<MessageCountData> {
  const records = await prisma.aggregatedData.findMany();

  const parseRecords = () => {
    return records
      .map((record: { id: string; count: number; date: string }) => {
        return {
          ...record,
          date: dayjs(record.date).add(1, 'day').toDate(),
        };
      })
      .sort((a: Record, b: Record) => a.date.getTime() - b.date.getTime());
  };

  const data = parseRecords();
  const dataWithoutToday = data.slice(0, -1);

  const todaysCount = [...data].pop()?.count || 0;

  const messageCountSum = dataWithoutToday.reduce((acc: number, curr: Record) => {
    return acc + curr.count;
  }, 0);

  const maxCount =
    dataWithoutToday.reduce((acc: number, curr: Record) => (acc > curr.count ? acc : curr.count), 0) || 0;

  const minCount =
    dataWithoutToday.reduce((acc: number, curr: Record) => (acc < curr.count ? acc : curr.count), maxCount) || 0;

  const avgCount = messageCountSum / dataWithoutToday.length || 0;

  return {
    content: [...dataWithoutToday],
    todaysCount,
    maxCount,
    minCount,
    avgCount,
  };
}
