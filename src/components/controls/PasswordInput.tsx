import { useState } from 'react';

import { AppInput } from '@/components/controls/AppInput';
import { IconButton } from '@/components/controls/IconButton';

type PasswordInputProps = React.ComponentProps<typeof AppInput>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      {...props}
      autoCapitalize="none"
      secureTextEntry={!visible}
      trailingAction={
        <IconButton
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          onPress={() => setVisible((current) => !current)}
        />
      }
    />
  );
}
