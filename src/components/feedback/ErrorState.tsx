import { EmptyState } from '@/components/feedback/EmptyState';

type ErrorStateProps = {
  actionLabel?: string;
  onPressAction?: () => void;
  subtitle: string;
  title: string;
};

export function ErrorState(props: ErrorStateProps) {
  return <EmptyState {...props} />;
}
