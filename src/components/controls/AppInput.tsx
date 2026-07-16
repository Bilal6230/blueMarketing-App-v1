import { forwardRef, useId, useState, type ReactNode } from 'react';
import {
  Platform,
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
    const [isFocused, setIsFocused] = useState(false);
    const describedBy = useId();
    const labelledBy = useId();
    const shellTestID = props.testID ? `${props.testID}-shell` : undefined;
    const hasError = Boolean(errorText);
    const message = hasError ? errorText : success ? successText : helperText;
    const resolvedLabel = props.accessibilityLabel ?? label;
    const shellBorderColor = hasError
      ? theme.component.input.borderInvalid
      : success
        ? theme.component.input.borderSuccess
        : isFocused
          ? theme.component.input.borderFocused
          : theme.component.input.border;
    const shellBackgroundColor = editable
      ? theme.component.input.background
      : theme.colors.surfaceMuted;
    const inputTextColor = editable
      ? theme.component.input.text
      : theme.colors.textMuted;
    const helperColor = hasError
      ? theme.colors.danger
      : success
        ? theme.colors.success
        : theme.component.input.helper;

    return (
      <View style={styles.wrapper}>
        {resolvedLabel ? (
          <AppText nativeID={labelledBy} variant="labelStrong">
            {resolvedLabel}
          </AppText>
        ) : null}
        <View
          testID={shellTestID}
          style={[
            styles.inputShell,
            {
              backgroundColor: shellBackgroundColor,
              borderColor: shellBorderColor,
              borderRadius: theme.radius.large,
              minHeight: theme.component.input.controlHeight,
              outlineColor: isFocused ? theme.colors.focusRing : 'transparent',
              outlineOffset: 2,
              outlineStyle: 'solid',
              outlineWidth: isFocused ? 2 : 0,
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
            accessibilityHint={props.accessibilityHint}
            accessibilityLabel={resolvedLabel}
            accessibilityState={{ disabled: !editable }}
            {...({
              'aria-invalid': hasError || undefined,
              'aria-describedby': message ? describedBy : undefined,
              'aria-labelledby': resolvedLabel ? labelledBy : undefined,
            } as object)}
            accessibilityLabelledBy={
              Platform.OS === 'android' && resolvedLabel ? labelledBy : undefined
            }
            editable={editable}
            nativeID={props.nativeID}
            onBlur={(event) => {
              setIsFocused(false);
              props.onBlur?.(event);
            }}
            onFocus={(event) => {
              setIsFocused(true);
              props.onFocus?.(event);
            }}
            placeholderTextColor={theme.component.input.placeholder}
            selectionColor={theme.colors.primary}
            style={[
              styles.input,
              {
                color: inputTextColor,
                fontFamily: theme.typography.body.fontFamily,
              },
              style,
            ]}
            {...props}
          />
          {trailingAction}
        </View>
        {message ? (
          <AppText
            accessibilityLiveRegion={hasError ? 'assertive' : 'polite'}
            nativeID={describedBy}
            style={{ color: helperColor }}
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
