import { fireEvent, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/api/errors';
import { LeadDetailScreen } from '@/features/crm/screens/LeadDetailScreen';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ leadId: '51' }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/features/crm/components/UpdateFollowUpSheet', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');

  return {
    UpdateFollowUpSheet: ({
      errors,
      onSave,
      visible,
    }: {
      errors: { followUpDate?: string; followUpTime?: string };
      onSave: () => void;
      visible: boolean;
    }) =>
      visible ? (
        <View>
          <Pressable accessibilityLabel="Save follow-up" accessibilityRole="button" onPress={onSave}>
            <Text>Save follow-up</Text>
          </Pressable>
          {errors.followUpDate ? <Text>{errors.followUpDate}</Text> : null}
          {errors.followUpTime ? <Text>{errors.followUpTime}</Text> : null}
        </View>
      ) : null,
  };
});

const lead = {
  assignedUser: null,
  createdAt: '2026-08-10 09:00:00',
  firstName: 'Adeel',
  followUp: '2026-08-11 10:00:00',
  id: 51,
  lastName: 'Shah',
  latestRemarks: 'Existing remark',
  mobileNumber: null,
  nicNumberMasked: '*********1111',
  phoneNumber: '03005556677',
  project: { id: 101, name: 'Blue Residency' },
  recordState: 'active' as const,
  updatedAt: '2026-08-10 10:00:00',
};

describe('LeadDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuthStore.setState({
      accessToken: 'token',
      clearSession: jest.fn(),
      hydrateSession: jest.fn(),
      logout: jest.fn(),
      permissions: ['update lead'],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['staff'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    } as never);
  });

  it('surfaces follow_up_date validation errors in the existing follow-up date and time UI', async () => {
    useCrmStore.setState({
      detailById: { 51: lead },
      historyByLeadId: { 51: [] },
      historyErrorByLeadId: { 51: null },
      isLoadingLead: false,
      isMutating: false,
      leadError: null,
      loadLeadDetail: jest.fn().mockResolvedValue(lead),
      loadLeadHistory: jest.fn().mockResolvedValue([]),
      updateLeadFollowUp: jest.fn().mockRejectedValue(
        new ApiError({
          errorKey: 'validation_error',
          fieldErrors: {
            follow_up_date: ['Use a valid follow-up date.'],
          },
          message: 'The given data was invalid.',
          statusCode: 422,
        }),
      ),
    } as never);

    const screen = await renderWithTheme(<LeadDetailScreen />);

    fireEvent.press(screen.getAllByRole('button')[3]!);

    await waitFor(() => {
      expect(screen.getByText('Save follow-up')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Save follow-up'));

    await waitFor(() => {
      expect(screen.getAllByText('Use a valid follow-up date.').length).toBeGreaterThan(0);
    });
  });
});
