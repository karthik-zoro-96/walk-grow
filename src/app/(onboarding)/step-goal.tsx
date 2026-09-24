import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StepGoalInput } from '../../components/shared/StepGoalInput';
import { useSettingsStore } from '../../state/useSettingsStore';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export default function StepGoalSetupScreen() {
  const dailyStepGoal = useSettingsStore((s) => s.settings.dailyStepGoal);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Set your daily step goal</Text>
        <Text style={styles.body}>
          Hit this many steps on a given day and your plant grows. You can change it anytime in
          Settings.
        </Text>
        <View style={styles.inputWrapper}>
          <StepGoalInput
            value={dailyStepGoal}
            onChange={(value) => updateSettings({ dailyStepGoal: value })}
          />
        </View>
      </View>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(onboarding)/rest-days')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Next</Text>
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
  body: { fontSize: 16, color: colors.textMuted, lineHeight: 24, marginBottom: spacing.xl },
  inputWrapper: { marginTop: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
