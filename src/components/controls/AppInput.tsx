import { forwardRef, useId, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextInput as TextInputType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type AppInputProps = TextInputProps & {
  errorText?: string;
  helperText?: string;
  label?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  success?: boolean;
  successText?: string;
  trailingAction?: ReactNode;
};

export const AppInput = forwardRef<TextInputType, AppInputProps>(
  (
    {
      editable = true,
      errorText,
      helperText,
      label,
      leadingIcon,
      success = false,
      successText,
      style,
      trailingAction,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();
    const describedBy = useId();
    const hasError = Boolean(errorText);
    const message = hasError ? errorText : success ? successText : helperText;

    return (
      <View style={styles.wrapper}>
        {label ? <AppText variant="labelStrong">{label}</AppText> : null}
        <View
          style={[
            styles.inputShell,
            {
              backgroundColor: theme.component.input.background,
              borderColor: hasError
                ? theme.component.input.borderInvalid
                : success
                  ? theme.component.input.borderSuccess
                  : theme.component.input.border,
              borderRadius: theme.radius.large,
              minHeight: theme.component.input.controlHeight,
            },
          ]}
        >
          {leadingIcon ? (
            <Ionicons
              accessibilityElementsHidden
              color={theme.colors.textMuted}
              name={leadingIcon}
              size={18}
            />
          ) : null}
          <TextInput
            ref={ref}
            accessibilityState={{ disabled: !editable }}
            placeholderTextColor={theme.component.input.placeholder}
            selectionColor={theme.colors.primary}
            style={[
              styles.input,
              {
                color: theme.component.input.text,
                fontFamily: theme.typography.body.fontFamily,
              },
              style,
            ]}
            {...props}
            editable={editable}
          />
          {trailingAction}
        </View>
        {message ? (
          <AppText
            color={hasError ? 'danger' : success ? 'success' : 'textMuted'}
            nativeID={describedBy}
            variant="caption"
          >
            {message}
          </AppText>
        ) : null}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingVertical: 12,
  },
  inputShell: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  wrapper: {
    gap: 8,
    width: '100%',
  },
});
