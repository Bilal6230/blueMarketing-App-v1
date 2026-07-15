import { View } from 'react-native';

import { Avatar } from '@/components/data-display/Avatar';

type AvatarGroupProps = {
  avatars: string[];
};

export function AvatarGroup({ avatars }: AvatarGroupProps) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {avatars.map((avatar, index) => (
        <View
          key={`${avatar}-${index}`}
          style={{ marginLeft: index === 0 ? 0 : -10 }}
        >
          <Avatar initials={avatar} />
        </View>
      ))}
    </View>
  );
}
