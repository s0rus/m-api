import { MessageAggregation } from '@prisma/client';
import dayjs from 'dayjs';

export function getWeekdayMessageCount(aggregations: MessageAggregation[]) {
  const thisYearWeekdayMessageCount = aggregations.reduce<Record<string, number>>((acc, agg) => {
    const year = dayjs(agg.date, 'DD.MM.YYYY').format('YYYY');
    const dayOfWeek = dayjs(agg.date, 'DD.MM.YYYY').format('dddd');

    if (year !== dayjs('01-01-2024').format('YYYY')) {
      return acc;
    }

    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + agg.dayCount;

    return acc;
  }, {});

  const daySums = aggregations.reduce<Record<string, number>>((acc, agg) => {
    const dayOfWeek = dayjs(agg.date, 'DD.MM.YYYY').format('dddd');

    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + agg.dayCount;

    return acc;
  }, {});

  return Object.keys(daySums).map((dayOfWeek) => ({
    name: dayOfWeek,
    allTimeValue: daySums[dayOfWeek],
    thisYearValue: thisYearWeekdayMessageCount[dayOfWeek],
  }));
}
