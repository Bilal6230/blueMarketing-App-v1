import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { LeadDetailScreen } from '@/features/crm/screens/LeadDetailScreen';
import { LeadListScreen } from '@/features/crm/screens/LeadListScreen';
import { renderWithTheme } from '../utils/renderWithTheme';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('CRM preview screens', () => {
  it('renders the loaded CRM state', async () => {
    const { getByText } = await renderWithTheme(<LeadListScreen />);

    expect(getByText('Lead pipeline')).toBeTruthy();
    expect(getByText('3 leads in this view')).toBeTruthy();
  });

  it('renders offline and error CRM states on demand', async () => {
    const { getByText } = await renderWithTheme(<LeadListScreen />);

    await act(async () => {
      fireEvent.press(getByText('Offline').parent as never);
    });
    await waitFor(() => {
      expect(getByText('You are viewing offline prototype content')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText('Error').parent as never);
    });
    await waitFor(() => {
      expect(getByText('CRM preview error')).toBeTruthy();
    });
  });

  it('renders the lead detail timeline and preview notices', async () => {
    const { getByText } = await renderWithTheme(<LeadDetailScreen />);

    expect(getByText('Activity timeline')).toBeTruthy();
    expect(getByText('Phone call logged')).toBeTruthy();
  });
});
