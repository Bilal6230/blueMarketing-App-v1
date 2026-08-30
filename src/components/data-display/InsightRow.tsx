import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type InsightRowProps = {
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tone?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
};

export function InsightRow({
  detail,
  icon,
  title,
  tone = 'primary',
}: InsightRowProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor:
              theme.colors[`${tone}Soft` as const] ?? theme.colors.primarySoft,
            borderRadius: theme.radius.medium,
          },
        ]}
      >
        <Ionicons
          accessibilityElementsHidden
          color={theme.colors[tone]}
          name={icon}
          size={18}
        />
      </View>
      <View style={styles.copy}>
        <AppText variant="labelStrong">{title}</AppText>
        <AppText color="textSecondary" variant="caption">
          {detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
