import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepGoalInput } from '../../components/shared/StepGoalInput';
import { WeekdaySelector } from '../../components/shared/WeekdaySelector';
import { useSettingsStore } from '../../state/useSettingsStore';
import { deleteAllDayRecords } from '../../storage/dayRecordsRepo';
import { deleteGardenState } from '../../storage/gardenStateRepo';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  function confirmResetGarden() {
    Alert.alert(
      'Reset garden?',
      'This clears all step history and growth progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            deleteAllDayRecords();
            deleteGardenState();
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily step goal</Text>
        <StepGoalInput
          value={settings.dailyStepGoal}
          onChange={(value) => updateSettings({ dailyStepGoal: value })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rest days</Text>
        <WeekdaySelector
          selected={settings.restDays}
          onChange={(days) => updateSettings({ restDays: days })}
        />
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.dangerButton}
          onPress={confirmResetGarden}
          accessibilityRole="button"
        >
          <Text style={styles.dangerButtonText}>Reset garden</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dangerButtonText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
