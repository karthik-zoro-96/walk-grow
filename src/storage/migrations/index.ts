import type { SQLiteDatabase } from 'expo-sqlite';

import * as m001 from './001_initial';

export interface Migration {
  up: (db: SQLiteDatabase) => void;
}

/** Ordered oldest-first; index + 1 is the resulting `PRAGMA user_version`. */
export const migrations: Migration[] = [m001];
