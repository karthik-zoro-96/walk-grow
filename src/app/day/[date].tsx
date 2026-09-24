import { format } from 'date-fns';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { getRestDayMessage } from '../../copy/restDayCopy';
import { dayOfWeekForKey, parseDateKey, todayKey } from '../../domain/dateUtils';
import { computeDayStatus } from '../../domain/growth';
import type { DayStatus } from '../../domain/types';
import { useSettingsStore } from '../../state/useSettingsStore';
import { getDayRecord } from '../../storage/dayRecordsRepo';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const STATUS_LABEL: Record<DayStatus, string> = {
  grew: 'Goal reached 🌱',
  missed: 'Goal missed',
  rest: 'Rest day',
  today_in_progress: 'In progress',
  future: 'Upcoming',
};

export default function DayDetailScreen() {
  const params = useLocalSearchParams<{ date: string }>();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;
  const settings = useSettingsStore((s) => s.settings);
  const today = todayKey();

  const record = getDayRecord(date);
  const goal = record?.goalSnapshot ?? settings.dailyStepGoal;
  const isRestDay = record?.isRestDaySnapshot ?? settings.restDays.includes(dayOfWeekForKey(date));
  const status = computeDayStatus({
    date,
    today,
    stepCount: record?.stepCount ?? null,
    goal,
    isScheduledRestDay: isRestDay,
  });

  const dateLabel = format(parseDateKey(date), 'EEEE, MMMM d, yyyy');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: dateLabel, headerBackTitle: 'Calendar' }} />
      <Text style={styles.status}>{STATUS_LABEL[status]}</Text>

      {status === 'rest' ? (
        <Text style={styles.body}>{getRestDayMessage(date)}</Text>
      ) : (
        <Text style={styles.body}>
          {record?.stepCount ?? 0} / {goal} steps
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  body: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
});
