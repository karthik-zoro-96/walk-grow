import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthCalendarGrid } from '../../components/calendar/MonthCalendarGrid';
import { dayOfWeekForKey, getMonthGridKeys, todayKey } from '../../domain/dateUtils';
import { computeDayStatus } from '../../domain/growth';
import type { DayStatus } from '../../domain/types';
import { useSettingsStore } from '../../state/useSettingsStore';
import { getDayRecordsInRange } from '../../storage/dayRecordsRepo';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface VisibleMonth {
  year: number;
  month: number;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore((s) => s.settings);
  const today = todayKey();

  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const gridKeys = useMemo(
    () => getMonthGridKeys(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );

  const statusByDate = useMemo(() => {
    const records = getDayRecordsInRange(gridKeys[0], gridKeys[gridKeys.length - 1]);
    const recordByDate = new Map(records.map((r) => [r.date, r]));
    const statuses = new Map<string, DayStatus>();

    for (const date of gridKeys) {
      const record = recordByDate.get(date);
      statuses.set(
        date,
        computeDayStatus({
          date,
          today,
          stepCount: record?.stepCount ?? null,
          goal: record?.goalSnapshot ?? settings.dailyStepGoal,
          isScheduledRestDay:
            record?.isRestDaySnapshot ?? settings.restDays.includes(dayOfWeekForKey(date)),
        }),
      );
    }
    return statuses;
  }, [gridKeys, today, settings.dailyStepGoal, settings.restDays]);

  function goToPreviousMonth() {
    setVisibleMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  }

  function goToNextMonth() {
    setVisibleMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  }

  function handleDayPress(date: string) {
    if (date > today) return;
    router.push(`/day/${date}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.header}>Calendar</Text>
      <MonthCalendarGrid
        year={visibleMonth.year}
        month={visibleMonth.month}
        gridKeys={gridKeys}
        today={today}
        statusByDate={statusByDate}
        onPressDay={handleDayPress}
        onPressPrevious={goToPreviousMonth}
        onPressNext={goToNextMonth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
});
