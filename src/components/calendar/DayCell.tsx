import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DayStatus } from '../../domain/types';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/spacing';

const STATUS_DOT_COLOR: Record<DayStatus, string> = {
  grew: colors.statusGrew,
  missed: colors.textMuted,
  rest: colors.statusRest,
  today_in_progress: colors.statusToday,
  future: colors.border,
};

interface DayCellProps {
  date: string;
  status: DayStatus;
  inCurrentMonth: boolean;
  isToday: boolean;
  onPress: (date: string) => void;
}

export function DayCell({ date, status, inCurrentMonth, isToday, onPress }: DayCellProps) {
  const dayNumber = parseInt(date.slice(8, 10), 10);
  const disabled = status === 'future';

  return (
    <View style={styles.cellWrapper}>
      <Pressable
        onPress={() => onPress(date)}
        disabled={disabled}
        style={[styles.cell, isToday && styles.todayCell, !inCurrentMonth && styles.dimmed]}
        accessibilityRole="button"
        accessibilityLabel={`${date}, ${status.replace('_', ' ')}`}
      >
        <Text style={[styles.dayNumber, !inCurrentMonth && styles.dimmedText]}>{dayNumber}</Text>
        <View style={[styles.dot, { backgroundColor: STATUS_DOT_COLOR[status] }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cellWrapper: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  cell: {
    flex: 1,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  todayCell: { borderColor: colors.primary, borderWidth: 2 },
  dimmed: { opacity: 0.4 },
  dayNumber: { fontSize: 13, fontWeight: '600', color: colors.text },
  dimmedText: { color: colors.textMuted },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
