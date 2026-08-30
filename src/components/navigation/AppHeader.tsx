import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';

type AppHeaderProps = {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function AppHeader({
  leftAction,
  rightAction,
  subtitle,
  title,
}: AppHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>{leftAction}</View>
      <View style={styles.center}>
        <AppText align="center" variant="headingSmall">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" color="textSecondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    gap: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  side: {
    minWidth: 44,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
});
