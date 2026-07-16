import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { AppInput } from '@/components';
import { PasswordInput } from '@/components/controls/PasswordInput';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('AppInput', () => {
  it('renders a visible label and helper text', async () => {
    const { getByLabelText, getByText } = await renderWithTheme(
      <AppInput
        helperText="Helper copy"
        label="Email address"
        testID="email"
      />,
    );

    expect(getByText('Email address')).toBeTruthy();
    expect(getByText('Helper copy')).toBeTruthy();
    expect(getByLabelText('Email address').props.accessibilityLabel).toBe('Email address');
  });

  it('shows a focused border treatment', async () => {
    const { getByLabelText, getByTestId } = await renderWithTheme(
      <AppInput label="Email address" testID="email" />,
    );

    await act(async () => {
      fireEvent(getByLabelText('Email address'), 'focus');
    });
    await waitFor(() => {
      expect(getByTestId('email-shell')).toHaveStyle({
        outlineWidth: 2,
      });
    });
  });

  it('renders error and success states', async () => {
    const error = await renderWithTheme(
      <AppInput errorText="Enter a valid email" label="Email address" />,
    );
    const success = await renderWithTheme(
      <AppInput
        label="Project code"
        success
        successText="Looks good"
      />,
    );

    expect(error.getByText('Enter a valid email')).toBeTruthy();
    expect(success.getByText('Looks good')).toBeTruthy();
  });

  it('renders disabled state accessibly', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppInput editable={false} label="Email address" />,
    );

    expect(getByLabelText('Email address').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('wires helper text to the input description on web-style aria props', async () => {
    const { getByLabelText, getByText } = await renderWithTheme(
      <AppInput helperText="We only use your work email" label="Email address" />,
    );

    const input = getByLabelText('Email address');
    const helper = getByText('We only use your work email');

    expect(input.props['aria-describedby']).toBe(helper.props.nativeID);
  });

  it('toggles password visibility', async () => {
    const { getByLabelText } = await renderWithTheme(
      <PasswordInput label="Password" />,
    );

    expect(getByLabelText('Password').props.secureTextEntry).toBe(true);

    await act(async () => {
      fireEvent.press(getByLabelText('Show password'));
    });
    await waitFor(() => {
      expect(getByLabelText('Password').props.secureTextEntry).toBe(false);
    });
  });
});
