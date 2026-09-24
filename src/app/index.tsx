import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSettingsStore } from '../state/useSettingsStore';
import { colors } from '../theme/colors';

export default function Index() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const onboardingCompleted = useSettingsStore((s) => s.settings.onboardingCompleted);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <View style={styles.container} />;
  }

  return <Redirect href={onboardingCompleted ? '/(tabs)' : '/(onboarding)/welcome'} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
