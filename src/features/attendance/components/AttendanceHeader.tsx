import { StyleSheet, View } from 'react-native';

import { AppText, ProjectPill } from '@/components';

type AttendanceHeaderProps = {
  dateLabel: string;
  projectLabel: string;
  subtitle?: string;
};

export function AttendanceHeader({
  dateLabel,
  projectLabel,
  subtitle,
}: AttendanceHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="headingMedium">Attendance</AppText>
      <ProjectPill label={projectLabel} />
      <AppText color="textSecondary" variant="body">
        {dateLabel}
      </AppText>
      {subtitle ? (
        <AppText color="textSecondary" variant="caption">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});
