import { compareDateKeys } from './dateUtils';
import type { DayRecord, DayStatus, GardenState, GrowthStage } from './types';

/** Cumulative goal-met days required to reach each stage; index is the stage. */
export const STAGE_THRESHOLDS: readonly number[] = [0, 3, 7, 14, 21];

/**
 * Growth is a monotonic function of *cumulative* goal-met days, never a streak that can
 * reset to zero. This is what guarantees the plant stalls on a miss but never regresses.
 */
export function stageForCumulativeDays(cumulativeDays: number): GrowthStage {
  let stage: GrowthStage = 0;
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (cumulativeDays >= STAGE_THRESHOLDS[i]) {
      stage = i as GrowthStage;
      break;
    }
  }
  return stage;
}

export function computeDayStatus(params: {
  date: string;
  today: string;
  stepCount: number | null;
  goal: number;
  isScheduledRestDay: boolean;
}): DayStatus {
  const { date, today, stepCount, goal, isScheduledRestDay } = params;

  if (compareDateKeys(date, today) > 0) return 'future';
  if (isScheduledRestDay) return 'rest';

  const metGoal = stepCount !== null && stepCount >= goal;

  if (date === today) {
    return metGoal ? 'grew' : 'today_in_progress';
  }
  return metGoal ? 'grew' : 'missed';
}

/**
 * Replays a day's history to derive garden state. Cheap at this app's data volume and
 * avoids the drift bugs an incrementally-mutated counter would be prone to.
 */
export function computeGardenState(records: DayRecord[], today: string): GardenState {
  const sorted = [...records].sort((a, b) => compareDateKeys(a.date, b.date));

  let cumulativeGoalMetDays = 0;
  let currentStreak = 0;

  for (const record of sorted) {
    const status = computeDayStatus({
      date: record.date,
      today,
      stepCount: record.stepCount,
      goal: record.goalSnapshot,
      isScheduledRestDay: record.isRestDaySnapshot,
    });

    if (status === 'grew') {
      cumulativeGoalMetDays += 1;
      currentStreak += 1;
    } else if (status === 'missed') {
      currentStreak = 0;
    }
    // 'rest', 'today_in_progress', and 'future' leave currentStreak unchanged.
  }

  return {
    plantStartDate: sorted[0]?.date ?? today,
    currentStage: stageForCumulativeDays(cumulativeGoalMetDays),
    cumulativeGoalMetDays,
    currentStreak,
    lastComputedAt: new Date().toISOString(),
  };
}
