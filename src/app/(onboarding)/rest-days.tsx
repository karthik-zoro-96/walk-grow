import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WeekdaySelector } from '../../components/shared/WeekdaySelector';
import { useSettingsStore } from '../../state/useSettingsStore';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export default function RestDaySetupScreen() {
  const restDays = useSettingsStore((s) => s.settings.restDays);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  function finish() {
    updateSettings({ onboardingCompleted: true });
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Pick your rest days</Text>
        <Text style={styles.body}>
          On a rest day your plant doesn&apos;t need to grow — no goal, no miss, just rest. Pick
          as many or as few as you like.
        </Text>
        <View style={styles.selectorWrapper}>
          <WeekdaySelector
            selected={restDays}
            onChange={(days) => updateSettings({ restDays: days })}
          />
        </View>
      </View>
      <Pressable style={styles.button} onPress={finish} accessibilityRole="button">
        <Text style={styles.buttonText}>Finish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  body: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  selectorWrapper: { marginTop: spacing.xl },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
