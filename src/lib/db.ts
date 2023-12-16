import { env } from '@/env';

// ! Workaround to satisfy bun errors after build
// ! https://github.com/prisma/prisma/issues/4816
import type { PrismaClient as ImportedPrismaClient } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url ?? __filename);

const { PrismaClient: RequiredPrismaClient } = require('@prisma/client');

const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient;

export class PrismaClient extends _PrismaClient {}

export const db = new _PrismaClient({
  log: env.NODE_ENV === 'production' ? ['error'] : ['info', 'warn', 'error'],
});
