import { Avatar } from '@/components/data-display/Avatar';
import { PressableScale } from '@/motion';

type ProfileButtonProps = {
  initials: string;
  onPress?: () => void;
};

export function ProfileButton({ initials, onPress }: ProfileButtonProps) {
  return (
    <PressableScale
      accessibilityLabel="Open profile preview"
      accessibilityRole="button"
      onPress={onPress}
      style={{ borderRadius: 999 }}
    >
      <Avatar initials={initials} />
    </PressableScale>
  );
}
