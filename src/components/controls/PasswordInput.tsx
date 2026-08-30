import { forwardRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { AppInput } from '@/components/controls/AppInput';
import { IconButton } from '@/components/controls/IconButton';

type PasswordInputProps = React.ComponentProps<typeof AppInput>;

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <AppInput
        ref={ref}
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
  },
);

PasswordInput.displayName = 'PasswordInput';
