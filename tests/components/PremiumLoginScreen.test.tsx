import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { PremiumLoginScreen } from '@/features/auth';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('PremiumLoginScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useAuthStore.setState({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'unauthenticated',
      user: null,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('keeps the foundation mode honest', async () => {
    const { getByTestId, getByText } = await renderWithTheme(
      <PremiumLoginScreen mode="foundation" />,
    );

    expect(
      getByText(
        'Authentication integration is not connected in this foundation route yet.',
      ),
    ).toBeTruthy();
    expect(getByTestId('login-sign-in-button').props.accessibilityState.disabled).toBe(true);
  });

  it('shows preview loading feedback without mutating auth state', async () => {
    const { getByTestId, getByText } = await renderWithTheme(
      <PremiumLoginScreen mode="preview" />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('login-sign-in-button'));
    });
    await act(async () => {
      jest.advanceTimersByTime(900);
    });
    await waitFor(() => {
      expect(
        getByText('No request was sent. This preview demonstrates the loading state only.'),
      ).toBeTruthy();
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
