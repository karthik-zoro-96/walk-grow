import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface RestDayBannerProps {
  message: string;
}

export function RestDayBanner({ message }: RestDayBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '100%',
  },
  text: { color: colors.text, fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
