import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PermissionState } from '../../health/types';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const STATUS_LABEL: Record<PermissionState, string> = {
  granted: 'Connected',
  unknown: 'Connected',
  denied: 'Not connected',
  not_requested: 'Not connected',
  unavailable: 'Not available on this device',
  manual_fallback: 'Manual entry',
  checking: 'Checking…',
};

interface PermissionStatusCardProps {
  state: PermissionState;
  onRequestPermission: () => void;
}

export function PermissionStatusCard({ state, onRequestPermission }: PermissionStatusCardProps) {
  const needsAction = state === 'denied' || state === 'not_requested';

  function handlePress() {
    if (state === 'denied') {
      Linking.openSettings();
      return;
    }
    onRequestPermission();
  }

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>Health access</Text>
        <Text style={styles.value}>{STATUS_LABEL[state]}</Text>
      </View>
      {needsAction && (
        <Pressable style={styles.button} onPress={handlePress} accessibilityRole="button">
          <Text style={styles.buttonText}>{state === 'denied' ? 'Open Settings' : 'Connect'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', color: colors.text },
  button: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
