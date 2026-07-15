import { EmptyState, Screen } from '@/components';

export default function AppIndexRoute() {
  return (
    <Screen>
      <EmptyState
        subtitle="Authenticated business modules remain intentionally unimplemented in this sprint."
        title="Application shell ready"
      />
    </Screen>
  );
}
