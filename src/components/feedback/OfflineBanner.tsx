import { InlineMessage } from '@/components/feedback/InlineMessage';

export function OfflineBanner() {
  return (
    <InlineMessage
      message="Reconnect to refresh operational data."
      title="You are viewing offline prototype content"
      tone="warning"
    />
  );
}
