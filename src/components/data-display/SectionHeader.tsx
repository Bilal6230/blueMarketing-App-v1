import { View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { AppButton } from '@/components/controls/AppButton';

type SectionHeaderProps = {
  actionLabel?: string;
  onPressAction?: () => void;
  subtitle?: string;
  title: string;
};

export function SectionHeader({
  actionLabel,
  onPressAction,
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="headingSmall">{title}</AppText>
        {subtitle ? (
          <AppText color="textSecondary" variant="body">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel ? (
        <AppButton
          compact
          fullWidth={false}
          onPress={onPressAction}
          title={actionLabel}
          variant="ghost"
        />
      ) : null}
    </View>
  );
}
