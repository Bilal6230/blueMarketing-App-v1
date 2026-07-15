import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';

export function ToastPreview() {
  return (
    <AppCard surface="elevated">
      <AppText variant="labelStrong">Lead follow-up saved</AppText>
      <AppText color="textSecondary" variant="caption">
        Prototype toast preview only. No global toast framework is active yet.
      </AppText>
    </AppCard>
  );
}
