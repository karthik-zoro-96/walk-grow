export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export const GROWTH_STAGE_LABELS = ['seed', 'sprout', 'bud', 'bloom', 'full-bloom'] as const;

export type DayStatus = 'grew' | 'missed' | 'rest' | 'today_in_progress' | 'future';

export interface DayRecord {
  /** Device-local calendar date, 'YYYY-MM-DD'. */
  date: string;
  stepCount: number | null;
  /** Step goal that applied on this date, snapshotted at record creation. */
  goalSnapshot: number;
  /** Whether this date was a scheduled rest day, snapshotted at record creation. */
  isRestDaySnapshot: boolean;
}

export interface UserSettings {
  dailyStepGoal: number;
  /** 0 = Sunday .. 6 = Saturday */
  restDays: number[];
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  reminderTime: string | null;
}

export interface GardenState {
  plantStartDate: string;
  currentStage: GrowthStage;
  cumulativeGoalMetDays: number;
  currentStreak: number;
  lastComputedAt: string;
}
