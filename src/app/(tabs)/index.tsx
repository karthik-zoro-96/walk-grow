import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlantView } from '../../components/garden/PlantView';
import { StepProgressRing } from '../../components/garden/StepProgressRing';
import { RestDayBanner } from '../../components/shared/RestDayBanner';
import { getRestDayMessage } from '../../copy/restDayCopy';
import { dayOfWeekForKey, todayKey } from '../../domain/dateUtils';
import type { PermissionState } from '../../health/types';
import { getHealthPermissionState, recordManualSteps } from '../../services/syncService';
import { useAppResumeSync } from '../../state/useAppResumeSync';
import { useGardenStore } from '../../state/useGardenStore';
import { useSettingsStore } from '../../state/useSettingsStore';
import { getDayRecord } from '../../storage/dayRecordsRepo';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const MANUAL_ENTRY_STATES: PermissionState[] = ['denied', 'unavailable', 'manual_fallback'];

export default function HomeGardenScreen() {
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore((s) => s.settings);
  const gardenState = useGardenStore((s) => s.gardenState);
  const setGardenState = useGardenStore((s) => s.setGardenState);
  const refreshGardenState = useGardenStore((s) => s.refresh);

  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [manualInput, setManualInput] = useState('');

  const today = todayKey();
  const isRestDayToday = settings.restDays.includes(dayOfWeekForKey(today));

  const refreshFromStorage = useCallback(() => {
    const record = getDayRecord(today);
    setTodaySteps(record?.stepCount ?? null);
    refreshGardenState();
    getHealthPermissionState()
      .then(setPermissionState)
      .catch(() => setPermissionState('unavailable'));
  }, [today, refreshGardenState]);

  useAppResumeSync(refreshFromStorage);

  function submitManualSteps() {
    const parsed = parseInt(manualInput, 10);
    if (manualInput.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
      Alert.alert('Enter a valid number of steps');
      return;
    }
    const state = recordManualSteps(today, parsed, settings);
    setGardenState(state);
    setTodaySteps(parsed);
    setManualInput('');
  }

  const stage = gardenState?.currentStage ?? 0;
  // HealthKit in particular can't reliably confirm grant/deny, so also fall back to manual
  // entry whenever we simply have no step data yet and aren't in a definitively granted state
  // (e.g. the user skipped the permission step during onboarding on iOS).
  const showManualEntry =
    MANUAL_ENTRY_STATES.includes(permissionState) ||
    (permissionState !== 'granted' && todaySteps === null);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.header}>Steps Garden</Text>

      {isRestDayToday ? (
        <RestDayBanner message={getRestDayMessage(today)} />
      ) : (
        <StepProgressRing steps={todaySteps ?? 0} goal={settings.dailyStepGoal} />
      )}

      <PlantView stage={stage} />

      {gardenState && (
        <Text style={styles.streak}>
          {gardenState.currentStreak > 0
            ? `${gardenState.currentStreak}-day streak`
            : 'Take a step today to keep growing'}
        </Text>
      )}

      {showManualEntry && !isRestDayToday && (
        <View style={styles.manualEntry}>
          <Text style={styles.manualEntryLabel}>Enter today&apos;s steps</Text>
          <View style={styles.manualEntryRow}>
            <TextInput
              style={styles.manualEntryInput}
              value={manualInput}
              onChangeText={setManualInput}
              keyboardType="number-pad"
              placeholder={todaySteps !== null ? String(todaySteps) : '0'}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Today's steps"
            />
            <Pressable
              style={styles.manualEntryButton}
              onPress={submitManualSteps}
              accessibilityRole="button"
            >
              <Text style={styles.manualEntryButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.lg },
  header: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  streak: { fontSize: 15, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.lg },
  manualEntry: { width: '100%', marginTop: spacing.md },
  manualEntryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  manualEntryRow: { flexDirection: 'row', gap: spacing.sm },
  manualEntryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  manualEntryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualEntryButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
