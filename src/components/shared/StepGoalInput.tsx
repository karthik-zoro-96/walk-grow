import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface StepGoalInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

export function StepGoalInput({ value, onChange, step = 500, min = 1000 }: StepGoalInputProps) {
  function adjust(delta: number) {
    onChange(Math.max(min, value + delta));
  }

  function handleTextChange(text: string) {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly === '') {
      onChange(0);
      return;
    }
    onChange(parseInt(digitsOnly, 10));
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={() => adjust(-step)}
        accessibilityRole="button"
        accessibilityLabel="Decrease step goal"
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <TextInput
        style={styles.input}
        value={String(value)}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        accessibilityLabel="Daily step goal"
      />
      <Pressable
        style={styles.button}
        onPress={() => adjust(step)}
        accessibilityRole="button"
        accessibilityLabel="Increase step goal"
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  input: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
});
