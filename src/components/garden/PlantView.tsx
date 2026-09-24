import { StyleSheet, Text, View } from 'react-native';

import { GROWTH_STAGE_LABELS } from '../../domain/types';
import type { GrowthStage } from '../../domain/types';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const STAGE_EMOJI: Record<GrowthStage, string> = {
  0: '🌰',
  1: '🌱',
  2: '🌿',
  3: '🌸',
  4: '🌳',
};

interface PlantViewProps {
  stage: GrowthStage;
}

export function PlantView({ stage }: PlantViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>{STAGE_EMOJI[stage]}</Text>
      </View>
      <Text style={styles.label}>{GROWTH_STAGE_LABELS[stage]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: spacing.lg },
  circle: {
    width: 160,
    height: 160,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 80 },
  label: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
