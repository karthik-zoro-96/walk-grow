import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Welcome to Steps Garden</Text>
        <Text style={styles.body}>
          Walk toward your daily step goal and watch a plant grow, one day at a time. Miss a day
          and your plant just waits for you — it never goes backwards.
        </Text>
      </View>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(onboarding)/step-goal')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Get started</Text>
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
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  body: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
