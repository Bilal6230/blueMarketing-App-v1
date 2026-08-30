import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';

export function ToastPreview() {
  return (
    <AppCard surface="elevated">
      <AppText variant="labelStrong">Lead follow-up saved</AppText>
      <AppText color="textSecondary" variant="caption">
        Your update has been stored in the current local session.
      </AppText>
    </AppCard>
  );
}
