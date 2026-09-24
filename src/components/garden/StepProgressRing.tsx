import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface StepProgressRingProps {
  steps: number;
  goal: number;
}

export function StepProgressRing({ steps, goal }: StepProgressRingProps) {
  const progress = goal > 0 ? Math.min(1, steps / goal) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        {steps.toLocaleString()} / {goal.toLocaleString()} steps
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  track: {
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
