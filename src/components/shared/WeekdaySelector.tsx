import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface WeekdaySelectorProps {
  selected: number[];
  onChange: (days: number[]) => void;
}

export function WeekdaySelector({ selected, onChange }: WeekdaySelectorProps) {
  function toggle(day: number) {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day].sort((a, b) => a - b);
    onChange(next);
  }

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, day) => {
        const isSelected = selected.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => toggle(day)}
            style={[styles.day, isSelected && styles.daySelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${WEEKDAY_NAMES[day]}${isSelected ? ', rest day' : ''}`}
          >
            <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  day: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  daySelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { color: colors.text, fontWeight: '600' },
  dayTextSelected: { color: '#FFFFFF' },
});
