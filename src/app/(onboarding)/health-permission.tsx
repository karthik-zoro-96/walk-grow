import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PermissionState } from '../../health/types';
import { requestHealthPermission, syncRecentDays } from '../../services/syncService';
import { useSettingsStore } from '../../state/useSettingsStore';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const OUTCOME_COPY: Partial<Record<PermissionState, string>> = {
  granted: "You're all set — Steps Garden will read today's steps automatically.",
  unknown: "You're all set — Steps Garden will read today's steps automatically.",
  denied: 'No problem — you can enter your steps manually each day instead.',
  unavailable: "Health data isn't available on this device — enter your steps manually instead.",
};

export default function HealthPermissionScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [outcome, setOutcome] = useState<PermissionState | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAllow() {
    setBusy(true);
    try {
      const result = await requestHealthPermission();
      setOutcome(result);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    updateSettings({ onboardingCompleted: true });
    try {
      await syncRecentDays(settings);
    } catch {
      // Non-fatal — the Home screen re-syncs on its next open/resume.
    }
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Connect your steps</Text>
        <Text style={styles.body}>
          Steps Garden reads your daily step count from your phone&apos;s Health app to grow
          your plant. It never leaves your device.
        </Text>

        {outcome ? (
          <Text style={styles.outcome}>{OUTCOME_COPY[outcome]}</Text>
        ) : (
          <Pressable
            style={styles.button}
            onPress={handleAllow}
            disabled={busy}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Allow access</Text>
            )}
          </Pressable>
        )}
      </View>

      <Pressable style={styles.secondaryButton} onPress={finish} accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>{outcome ? 'Continue' : 'Skip for now'}</Text>
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
  outcome: { fontSize: 16, color: colors.text, lineHeight: 24 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
