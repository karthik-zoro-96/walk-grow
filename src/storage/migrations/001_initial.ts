import type { SQLiteDatabase } from 'expo-sqlite';

export function up(db: SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS day_records (
      date TEXT PRIMARY KEY,
      step_count INTEGER,
      goal_snapshot INTEGER NOT NULL,
      is_rest_day_snapshot INTEGER NOT NULL,
      last_synced_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_day_records_date ON day_records(date);

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      daily_step_goal INTEGER NOT NULL DEFAULT 8000,
      rest_days_json TEXT NOT NULL DEFAULT '[]',
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      notifications_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT
    );

    CREATE TABLE IF NOT EXISTS garden_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      plant_start_date TEXT NOT NULL,
      current_stage INTEGER NOT NULL DEFAULT 0,
      cumulative_goal_met_days INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      last_computed_at TEXT NOT NULL
    );
  `);
}
