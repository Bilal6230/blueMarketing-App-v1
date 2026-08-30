import { EmptyState } from '@/components/feedback/EmptyState';

type StateMessageProps = {
  body: string;
  title: string;
};

export function StateMessage({ body, title }: StateMessageProps) {
  return <EmptyState subtitle={body} title={title} />;
}
