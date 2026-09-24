import { getDb } from './db';
import type { GardenState, GrowthStage } from '../domain/types';

interface GardenStateRow {
  id: number;
  plant_start_date: string;
  current_stage: number;
  cumulative_goal_met_days: number;
  current_streak: number;
  last_computed_at: string;
}

function rowToGardenState(row: GardenStateRow): GardenState {
  return {
    plantStartDate: row.plant_start_date,
    currentStage: row.current_stage as GrowthStage,
    cumulativeGoalMetDays: row.cumulative_goal_met_days,
    currentStreak: row.current_streak,
    lastComputedAt: row.last_computed_at,
  };
}

/** Reads the cached garden state. This is a cache, not the source of truth — see computeGardenState. */
export function getCachedGardenState(): GardenState | null {
  const row = getDb().getFirstSync<GardenStateRow>('SELECT * FROM garden_state WHERE id = 1');
  return row ? rowToGardenState(row) : null;
}

export function saveGardenState(state: GardenState): void {
  getDb().runSync(
    `INSERT INTO garden_state (id, plant_start_date, current_stage, cumulative_goal_met_days, current_streak, last_computed_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       plant_start_date = excluded.plant_start_date,
       current_stage = excluded.current_stage,
       cumulative_goal_met_days = excluded.cumulative_goal_met_days,
       current_streak = excluded.current_streak,
       last_computed_at = excluded.last_computed_at`,
    [
      state.plantStartDate,
      state.currentStage,
      state.cumulativeGoalMetDays,
      state.currentStreak,
      state.lastComputedAt,
    ],
  );
}

export function deleteGardenState(): void {
  getDb().runSync('DELETE FROM garden_state');
}
