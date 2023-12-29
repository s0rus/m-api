import { MessageAggregation } from '@prisma/client';
import dayjs from 'dayjs';

export function getWeekdayMessageCount(aggregations: MessageAggregation[]) {
  const daySums = aggregations.reduce<Record<string, number>>((acc, agg) => {
    const dayOfWeek = dayjs(agg.date, 'DD.MM.YYYY').format('dddd');

    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + agg.dayCount;

    return acc;
  }, {});

  return Object.keys(daySums).map((dayOfWeek) => ({
    name: dayOfWeek,
    value: daySums[dayOfWeek],
  }));
}
