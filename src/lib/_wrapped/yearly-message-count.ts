import { MessageAggregation } from '@prisma/client';

export function getYearlyMessageCount(aggregations: MessageAggregation[]) {
  const yearlyMessageCount = Object.entries(
    aggregations.reduce<Record<string, number>>((result, item) => {
      const year = item.date.split('.')[2];
      result[year] = (result[year] || 0) + item.dayCount;
      return result;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return yearlyMessageCount;
}
