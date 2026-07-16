import { render } from '@testing-library/react-native';

import IndexRoute from '../../app/index';
import PreviewLayout from '../../app/(preview)/_layout';
import { isUiPreviewEnabled } from '@/config/isUiPreviewEnabled';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`redirect:${href}`}</Text>;
  },
  Stack: () => {
    const { Text } = require('react-native');
    return <Text>preview-stack</Text>;
  },
}));

jest.mock('@/config/isUiPreviewEnabled', () => ({
  isUiPreviewEnabled: jest.fn(),
}));

describe('preview routing', () => {
  const mockedIsUiPreviewEnabled = jest.mocked(isUiPreviewEnabled);

  beforeEach(() => {
    mockedIsUiPreviewEnabled.mockReset();
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

  it('keeps production root routing unchanged for authenticated users', async () => {
    mockedIsUiPreviewEnabled.mockReturnValue(false);
    useAuthStore.setState({ status: 'authenticated' });

    const { getByText } = await render(<IndexRoute />);

    expect(getByText('redirect:/(app)')).toBeTruthy();
  });

  it('keeps production root routing unchanged for unauthenticated users', async () => {
    mockedIsUiPreviewEnabled.mockReturnValue(false);

    const { getByText } = await render(<IndexRoute />);

    expect(getByText('redirect:/(auth)/login')).toBeTruthy();
  });

  it('redirects to the preview selector when preview mode is enabled', async () => {
    mockedIsUiPreviewEnabled.mockReturnValue(true);
    const beforeState = useAuthStore.getState();

    const { getByText } = await render(<IndexRoute />);
    const afterState = useAuthStore.getState();

    expect(getByText('redirect:/(preview)')).toBeTruthy();
    expect(afterState).toMatchObject({
      accessToken: beforeState.accessToken,
      status: beforeState.status,
    });
  });

  it('redirects preview routes back to the root when preview mode is disabled', async () => {
    mockedIsUiPreviewEnabled.mockReturnValue(false);

    const { getByText } = await render(<PreviewLayout />);

    expect(getByText('redirect:/')).toBeTruthy();
  });

  it('allows preview routes when preview mode is enabled', async () => {
    mockedIsUiPreviewEnabled.mockReturnValue(true);

    const { getByText } = await render(<PreviewLayout />);

    expect(getByText('preview-stack')).toBeTruthy();
  });
});
