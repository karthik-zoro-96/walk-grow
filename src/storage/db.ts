import * as SQLite from 'expo-sqlite';

import { migrations } from './migrations';

const DATABASE_NAME = 'steps_garden.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

function runMigrations(db: SQLite.SQLiteDatabase): void {
  const versionRow = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  for (let i = currentVersion; i < migrations.length; i++) {
    db.withTransactionSync(() => {
      migrations[i].up(db);
      db.execSync(`PRAGMA user_version = ${i + 1}`);
    });
  }
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
    runMigrations(dbInstance);
  }
  return dbInstance;
}

/** Test-only: forces the next getDb() call to reopen (and re-migrate) the database. */
export function resetDbInstanceForTests(): void {
  dbInstance = null;
}
