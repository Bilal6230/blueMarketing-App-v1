import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/branding/BrandMark';
import { AppText } from '@/components/controls/AppText';

type BrandLockupProps = {
  subtitle?: string;
};

export function BrandLockup({
  subtitle = 'Operations workspace',
}: BrandLockupProps) {
  return (
    <View style={styles.container}>
      <BrandMark size="md" />
      <View style={styles.copy}>
        <AppText variant="headingSmall">Blue Marketing</AppText>
        <AppText color="textSecondary" variant="label">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  copy: {
    gap: 2,
  },
});
