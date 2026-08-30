import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type TimelineItemProps = {
  body: string;
  time: string;
  title: string;
};

export function TimelineItem({ body, time, title }: TimelineItemProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.pill,
            height: 12,
            width: 12,
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.border,
            flex: 1,
            marginTop: 6,
            width: 1,
          }}
        />
      </View>
      <View style={styles.copy}>
        <AppText variant="labelStrong">{title}</AppText>
        <AppText color="textMuted" variant="captionStrong">
          {time}
        </AppText>
        <AppText color="textSecondary" variant="body">
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
    paddingBottom: 10,
  },
  rail: {
    alignItems: 'center',
    width: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
