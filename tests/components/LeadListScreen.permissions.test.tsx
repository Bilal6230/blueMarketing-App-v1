import { LeadListScreen } from '@/features/crm/screens/LeadListScreen';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LeadListScreen permissions', () => {
  beforeEach(() => {
    useCrmStore.setState({
      currentFilters: {
        followUpFrom: '',
        followUpTo: '',
        quickFilter: 'all',
        recordState: 'all',
        search: '',
        sortBy: 'follow_up',
        sortOrder: 'asc',
      },
      currentPagination: { page: 1, perPage: 20 },
      currentProjectId: 101,
      detailById: {},
      historyByLeadId: {},
      historyErrorByLeadId: {},
      isLoadingLead: false,
      isLoadingLeads: false,
      isLoadingMoreLeads: false,
      isMutating: false,
      leadError: null,
      leads: [],
      leadsError: null,
      loadLeadDetail: jest.fn(),
      loadLeadHistory: jest.fn(),
      loadLeads: jest.fn().mockResolvedValue(undefined),
      loadNextLeadsPage: jest.fn().mockResolvedValue(undefined),
      loadSummary: jest.fn(),
      meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 0 },
      mutationError: null,
      resetCrmState: jest.fn(),
      summary: {
        activeLeads: 0,
        overdueFollowups: 0,
        todayFollowups: 0,
        totalLeads: 0,
      },
      createLeadRecord: jest.fn(),
      updateLeadFollowUp: jest.fn(),
      updateLeadRecord: jest.fn(),
    } as never);
  });

  it('renders CRM for a superadmin even without explicit read lead permission', async () => {
    useAuthStore.setState({
      accessToken: 'token',
      backendRoleNames: ['superadmin'],
      clearSession: jest.fn(),
      permissions: [],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['administrator'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'superadmin@bluemarketing.com', id: 1, name: 'Super Admin' },
    } as never);

    const screen = await renderWithTheme(<LeadListScreen />);

    expect(screen.queryByText('CRM unavailable')).toBeNull();
    expect(screen.getByText('Search leads')).toBeTruthy();
  });

  it('keeps normal admin behavior unchanged when explicit read lead permission is missing', async () => {
    useAuthStore.setState({
      accessToken: 'token',
      backendRoleNames: ['admin'],
      clearSession: jest.fn(),
      permissions: [],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['administrator'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'admin@bluemarketing.com', id: 1, name: 'Admin' },
    } as never);

    const screen = await renderWithTheme(<LeadListScreen />);

    expect(screen.getByText('CRM unavailable')).toBeTruthy();
  });
});
