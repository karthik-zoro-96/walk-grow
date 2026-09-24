import { STAGE_THRESHOLDS, computeDayStatus, computeGardenState, stageForCumulativeDays } from './growth';
import type { DayRecord } from './types';

const TODAY = '2026-09-24';

describe('computeDayStatus', () => {
  it('returns grew when a past day met its goal', () => {
    expect(
      computeDayStatus({
        date: '2026-09-20',
        today: TODAY,
        stepCount: 9000,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('grew');
  });

  it('returns missed when a past day fell short of its goal', () => {
    expect(
      computeDayStatus({
        date: '2026-09-20',
        today: TODAY,
        stepCount: 4000,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('missed');
  });

  it('returns missed when a past day has no recorded steps', () => {
    expect(
      computeDayStatus({
        date: '2026-09-20',
        today: TODAY,
        stepCount: null,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('missed');
  });

  it('returns rest for a scheduled rest day, regardless of step count', () => {
    expect(
      computeDayStatus({
        date: '2026-09-20',
        today: TODAY,
        stepCount: 0,
        goal: 8000,
        isScheduledRestDay: true,
      }),
    ).toBe('rest');

    expect(
      computeDayStatus({
        date: '2026-09-20',
        today: TODAY,
        stepCount: 20000,
        goal: 8000,
        isScheduledRestDay: true,
      }),
    ).toBe('rest');
  });

  it('returns today_in_progress when today has not yet met its goal', () => {
    expect(
      computeDayStatus({
        date: TODAY,
        today: TODAY,
        stepCount: 2000,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('today_in_progress');
  });

  it('returns today_in_progress when today has no steps synced yet', () => {
    expect(
      computeDayStatus({
        date: TODAY,
        today: TODAY,
        stepCount: null,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('today_in_progress');
  });

  it('returns grew when today has already met its goal', () => {
    expect(
      computeDayStatus({
        date: TODAY,
        today: TODAY,
        stepCount: 8500,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('grew');
  });

  it('returns future for a date after today', () => {
    expect(
      computeDayStatus({
        date: '2026-09-25',
        today: TODAY,
        stepCount: null,
        goal: 8000,
        isScheduledRestDay: false,
      }),
    ).toBe('future');
  });

  it('treats future as taking priority over a scheduled rest day', () => {
    expect(
      computeDayStatus({
        date: '2026-09-25',
        today: TODAY,
        stepCount: null,
        goal: 8000,
        isScheduledRestDay: true,
      }),
    ).toBe('future');
  });
});

describe('stageForCumulativeDays', () => {
  it('is 0 below the first threshold', () => {
    expect(stageForCumulativeDays(0)).toBe(0);
    expect(stageForCumulativeDays(2)).toBe(0);
  });

  it.each(STAGE_THRESHOLDS.map((threshold, stage) => [threshold, stage] as const))(
    'is stage %i exactly at threshold %i',
    (threshold, stage) => {
      expect(stageForCumulativeDays(threshold)).toBe(stage);
    },
  );

  it('is one below the next stage just below its threshold', () => {
    for (let i = 1; i < STAGE_THRESHOLDS.length; i++) {
      expect(stageForCumulativeDays(STAGE_THRESHOLDS[i] - 1)).toBe(i - 1);
    }
  });

  it('caps at the final stage well past the last threshold', () => {
    expect(stageForCumulativeDays(1000)).toBe(STAGE_THRESHOLDS.length - 1);
  });
});

function record(partial: Partial<DayRecord> & { date: string }): DayRecord {
  return {
    stepCount: null,
    goalSnapshot: 8000,
    isRestDaySnapshot: false,
    ...partial,
  };
}

describe('computeGardenState', () => {
  it('starts at stage 0 with no history', () => {
    const state = computeGardenState([], TODAY);
    expect(state.currentStage).toBe(0);
    expect(state.cumulativeGoalMetDays).toBe(0);
    expect(state.currentStreak).toBe(0);
    expect(state.plantStartDate).toBe(TODAY);
  });

  it('counts each grown day toward the cumulative total and stage', () => {
    const records = [
      record({ date: '2026-09-18', stepCount: 9000 }),
      record({ date: '2026-09-19', stepCount: 9000 }),
      record({ date: '2026-09-20', stepCount: 9000 }),
    ];
    const state = computeGardenState(records, TODAY);
    expect(state.cumulativeGoalMetDays).toBe(3);
    expect(state.currentStage).toBe(1);
    expect(state.currentStreak).toBe(3);
    expect(state.plantStartDate).toBe('2026-09-18');
  });

  it('never decreases cumulative goal-met days as more days are replayed, even across misses', () => {
    const records = [
      record({ date: '2026-09-15', stepCount: 9000 }),
      record({ date: '2026-09-16', stepCount: 9000 }),
      record({ date: '2026-09-17', stepCount: 1000 }), // missed
      record({ date: '2026-09-18', stepCount: 9000 }),
      record({ date: '2026-09-19', stepCount: 500 }), // missed
      record({ date: '2026-09-20', stepCount: 9000 }),
    ];

    let previousCumulative = 0;
    for (let i = 1; i <= records.length; i++) {
      const state = computeGardenState(records.slice(0, i), TODAY);
      expect(state.cumulativeGoalMetDays).toBeGreaterThanOrEqual(previousCumulative);
      previousCumulative = state.cumulativeGoalMetDays;
    }
    // A miss must never remove already-earned growth.
    expect(previousCumulative).toBe(4);
  });

  it('resets the cosmetic streak on a miss but not the cumulative total or stage', () => {
    const records = [
      record({ date: '2026-09-18', stepCount: 9000 }),
      record({ date: '2026-09-19', stepCount: 9000 }),
      record({ date: '2026-09-20', stepCount: 9000 }), // reaches stage 1 (threshold 3)
      record({ date: '2026-09-21', stepCount: 1000 }), // missed
    ];
    const state = computeGardenState(records, TODAY);
    expect(state.currentStreak).toBe(0);
    expect(state.cumulativeGoalMetDays).toBe(3);
    expect(state.currentStage).toBe(1);
  });

  it('does not break the streak on a rest day', () => {
    const records = [
      record({ date: '2026-09-19', stepCount: 9000 }),
      record({ date: '2026-09-20', isRestDaySnapshot: true, stepCount: null }),
      record({ date: '2026-09-21', stepCount: 9000 }),
    ];
    const state = computeGardenState(records, TODAY);
    expect(state.currentStreak).toBe(2);
    expect(state.cumulativeGoalMetDays).toBe(2);
  });

  it('excludes a rest day from cumulative growth even if steps that day exceeded the goal', () => {
    const records = [record({ date: '2026-09-20', isRestDaySnapshot: true, stepCount: 20000 })];
    const state = computeGardenState(records, TODAY);
    expect(state.cumulativeGoalMetDays).toBe(0);
    expect(state.currentStage).toBe(0);
  });

  it('produces the same result regardless of input order', () => {
    const records = [
      record({ date: '2026-09-20', stepCount: 9000 }),
      record({ date: '2026-09-18', stepCount: 9000 }),
      record({ date: '2026-09-19', stepCount: 1000 }),
    ];
    const sorted = computeGardenState(records, TODAY);
    const shuffled = computeGardenState([...records].reverse(), TODAY);
    expect(shuffled.cumulativeGoalMetDays).toBe(sorted.cumulativeGoalMetDays);
    expect(shuffled.currentStreak).toBe(sorted.currentStreak);
    expect(shuffled.plantStartDate).toBe(sorted.plantStartDate);
  });

  it('does not count today toward growth until its goal is actually met', () => {
    const records = [record({ date: TODAY, stepCount: 1000 })];
    const state = computeGardenState(records, TODAY);
    expect(state.cumulativeGoalMetDays).toBe(0);
  });
});
