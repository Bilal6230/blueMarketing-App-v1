import { act, cleanup, waitFor } from '@testing-library/react-native';

import { LeadDetailScreen } from '@/features/crm/screens/LeadDetailScreen';
import { createInitialLeads } from '@/features/crm/services/crmService';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { renderWithTheme } from '../utils/renderWithTheme';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ leadId: 'lead-1' }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('LeadDetailScreen', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useCrmStore.setState({
      leads: createInitialLeads(),
      selectedLeadId: null,
    });
  });

  it('renders follow-up changes immediately after saving', async () => {
    const screen = await renderWithTheme(<LeadDetailScreen />);

    await act(async () => {
      useCrmStore.getState().addLeadFollowUp('lead-1', {
        note: 'Call after site visit',
        scheduledFor: new Date('2026-07-22T09:00:00'),
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Tuesday, July 22, 2026|Wednesday, July 22, 2026/i),
      ).toBeTruthy();
      expect(screen.getByText('Call after site visit')).toBeTruthy();
      expect(screen.getByText('Follow-up added')).toBeTruthy();
    });
  });

  it('renders lead updates immediately after saving', async () => {
    const screen = await renderWithTheme(<LeadDetailScreen />);

    await act(async () => {
      useCrmStore.getState().updateLeadRecord('lead-1', {
        assignedTo: 'Hamza Ali',
        email: 'hamza.ali@bluemarketing.com',
        followUpDate: new Date('2026-07-24T09:00:00'),
        status: 'Pending',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Hamza Ali')).toBeTruthy();
      expect(screen.getByText('hamza.ali@bluemarketing.com')).toBeTruthy();
      expect(screen.getByText('Pending')).toBeTruthy();
      expect(
        screen.getAllByText(/Friday, July 24, 2026/i).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByText(/Status updated to Pending and follow-up moved to/i),
      ).toBeTruthy();
    });
  });
});
