import { format } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DayStatus } from '../../domain/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { DayCell } from './DayCell';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface MonthCalendarGridProps {
  year: number;
  month: number;
  gridKeys: string[];
  today: string;
  statusByDate: Map<string, DayStatus>;
  onPressDay: (date: string) => void;
  onPressPrevious: () => void;
  onPressNext: () => void;
}

export function MonthCalendarGrid({
  year,
  month,
  gridKeys,
  today,
  statusByDate,
  onPressDay,
  onPressPrevious,
  onPressNext,
}: MonthCalendarGridProps) {
  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy');
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={onPressPrevious}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
        >
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          onPress={onPressNext}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={8}
        >
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {gridKeys.map((date) => (
          <DayCell
            key={date}
            date={date}
            status={statusByDate.get(date) ?? 'future'}
            inCurrentMonth={date.startsWith(monthPrefix)}
            isToday={date === today}
            onPress={onPressDay}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navArrow: { fontSize: 28, color: colors.primary, paddingHorizontal: spacing.md },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  weekdayRow: { flexDirection: 'row', marginBottom: spacing.sm },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
