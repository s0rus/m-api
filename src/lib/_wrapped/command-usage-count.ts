import { CommandAggregation } from '@prisma/client';

export function getCommandUsageCount(commandAggregation?: CommandAggregation[]) {
  if (!commandAggregation) {
    return [];
  }

  return commandAggregation;
}
