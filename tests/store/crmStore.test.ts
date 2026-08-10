import { ApiError } from '@/api/errors';
import {
  defaultCrmFilters,
  getHistory,
  getLead,
  getLeads,
  getSummary,
  createLead,
  updateLead,
  updateFollowUp,
} from '@/features/crm/services/crmService';
import { useCrmStore } from '@/features/crm/store/crmStore';

jest.mock('@/features/crm/services/crmService', () => ({
  createLead: jest.fn(),
  defaultCrmFilters: {
    followUpFrom: '',
    followUpTo: '',
    quickFilter: 'all',
    recordState: 'all',
    search: '',
    sortBy: 'follow_up',
    sortOrder: 'asc',
  },
  getHistory: jest.fn(),
  getLead: jest.fn(),
  getLeads: jest.fn(),
  getSummary: jest.fn(),
  updateFollowUp: jest.fn(),
  updateLead: jest.fn(),
}));

const mockedCreateLead = jest.mocked(createLead);
const mockedGetHistory = jest.mocked(getHistory);
const mockedGetLead = jest.mocked(getLead);
const mockedGetLeads = jest.mocked(getLeads);
const mockedGetSummary = jest.mocked(getSummary);
const mockedUpdateFollowUp = jest.mocked(updateFollowUp);
const mockedUpdateLead = jest.mocked(updateLead);

function createLeadListRecord(id: number) {
  return {
    assignedUser: null,
    createdAt: '2026-08-10 09:00:00',
    firstName: `Lead ${id}`,
    followUp: '2026-08-11 10:00:00',
    id,
    lastName: 'Tester',
    mobileNumber: null,
    phoneNumber: `0300000000${id}`,
    project: { id: 101, name: 'Blue Residency' },
    recordState: 'active' as const,
  };
}

function createLeadDetailRecord(id: number) {
  return {
    ...createLeadListRecord(id),
    latestRemarks: 'Latest remark',
    nicNumberMasked: '*********1111',
    updatedAt: '2026-08-10 10:00:00',
  };
}

describe('crmStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCrmStore.getState().resetCrmState();
    mockedGetSummary.mockResolvedValue({
      activeLeads: 2,
      overdueFollowups: 1,
      todayFollowups: 1,
      totalLeads: 2,
    });
  });

  it('appends page 2 without duplicate lead ids', async () => {
    mockedGetLeads
      .mockResolvedValueOnce({
        data: [createLeadListRecord(1), createLeadListRecord(2)],
        meta: {
          currentPage: 1,
          lastPage: 2,
          perPage: 20,
          total: 3,
        },
      })
      .mockResolvedValueOnce({
        data: [createLeadListRecord(2), createLeadListRecord(3)],
        meta: {
          currentPage: 2,
          lastPage: 2,
          perPage: 20,
          total: 3,
        },
      });

    await useCrmStore.getState().loadLeads(101, defaultCrmFilters, { page: 1, perPage: 20 });
    await useCrmStore.getState().loadNextLeadsPage();

    expect(useCrmStore.getState().leads.map((lead) => lead.id)).toEqual([1, 2, 3]);
  });

  it('resets to page 1 when filters change', async () => {
    mockedGetLeads.mockResolvedValue({
      data: [createLeadListRecord(1)],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 1,
      },
    });

    await useCrmStore.getState().loadLeads(101, defaultCrmFilters, { page: 2, perPage: 20 });
    await useCrmStore.getState().loadLeads(
      101,
      { ...defaultCrmFilters, search: 'Bilal' },
      { page: 1, perPage: 20 },
    );

    expect(useCrmStore.getState().currentPagination.page).toBe(1);
    expect(mockedGetLeads).toHaveBeenLastCalledWith(
      101,
      { ...defaultCrmFilters, search: 'Bilal' },
      { page: 1, perPage: 20 },
    );
  });

  it('prevents stale old-project responses from overwriting the latest project', async () => {
    let resolveFirstSummary: ((value: any) => void) | null = null;
    let resolveFirstLeads: ((value: any) => void) | null = null;
    let resolveSecondSummary: ((value: any) => void) | null = null;
    let resolveSecondLeads: ((value: any) => void) | null = null;

    mockedGetSummary
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstSummary = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondSummary = resolve;
          }),
      );
    mockedGetLeads
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstLeads = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondLeads = resolve;
          }),
      );

    const firstRequest = useCrmStore.getState().loadLeads(101, defaultCrmFilters, {
      page: 1,
      perPage: 20,
    });
    const secondRequest = useCrmStore.getState().loadLeads(102, defaultCrmFilters, {
      page: 1,
      perPage: 20,
    });

    const secondSummaryResolver = resolveSecondSummary as ((value: any) => void) | null;
    const secondLeadsResolver = resolveSecondLeads as ((value: any) => void) | null;
    const firstSummaryResolver = resolveFirstSummary as ((value: any) => void) | null;
    const firstLeadsResolver = resolveFirstLeads as ((value: any) => void) | null;

    if (secondSummaryResolver) {
      secondSummaryResolver({
        activeLeads: 5,
        overdueFollowups: 0,
        todayFollowups: 0,
        totalLeads: 5,
      });
    }

    if (secondLeadsResolver) {
      secondLeadsResolver({
        data: [createLeadListRecord(201)],
        meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
      });
    }
    await secondRequest;

    if (firstSummaryResolver) {
      firstSummaryResolver({
        activeLeads: 1,
        overdueFollowups: 0,
        todayFollowups: 0,
        totalLeads: 1,
      });
    }

    if (firstLeadsResolver) {
      firstLeadsResolver({
        data: [createLeadListRecord(101)],
        meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
      });
    }
    await firstRequest;

    expect(useCrmStore.getState().currentProjectId).toBe(102);
    expect(useCrmStore.getState().leads.map((lead) => lead.id)).toEqual([201]);
    expect(useCrmStore.getState().summary?.totalLeads).toBe(5);
  });

  it('resets isLoadingLeads after list failure', async () => {
    mockedGetSummary.mockRejectedValue(
      new ApiError({
        errorKey: 'server_error',
        message: 'Unable to load CRM right now. Try again.',
        retryable: true,
        statusCode: 500,
      }),
    );

    await useCrmStore.getState().loadLeads(101, defaultCrmFilters, { page: 1, perPage: 20 });

    expect(useCrmStore.getState().isLoadingLeads).toBe(false);
    expect(useCrmStore.getState().leadsError?.statusCode).toBe(500);
  });

  it('resets isLoadingLead after detail failure', async () => {
    mockedGetLead.mockRejectedValue(
      new ApiError({
        errorKey: 'not_found',
        message: 'Lead not found.',
        statusCode: 404,
      }),
    );

    await expect(useCrmStore.getState().loadLeadDetail(999)).resolves.toBeNull();

    expect(useCrmStore.getState().isLoadingLead).toBe(false);
    expect(useCrmStore.getState().leadError?.statusCode).toBe(404);
  });

  it('resets isMutating after failed create, update, and follow-up requests', async () => {
    const mutationError = new ApiError({
      errorKey: 'validation_error',
      message: 'The given data was invalid.',
      statusCode: 422,
    });

    mockedCreateLead.mockRejectedValueOnce(mutationError);
    await expect(
      useCrmStore.getState().createLeadRecord({
        firstName: 'Adeel',
        followUp: null,
        lastName: 'Shah',
        mobileNumber: null,
        nicNumber: null,
        phoneNumber: '03005556677',
        projectId: 101,
        remarks: null,
      }),
    ).rejects.toBe(mutationError);
    expect(useCrmStore.getState().isMutating).toBe(false);

    mockedUpdateLead.mockRejectedValueOnce(mutationError);
    await expect(
      useCrmStore.getState().updateLeadRecord(1, {
        firstName: 'Adeel',
        followUp: null,
        lastName: 'Shah',
        mobileNumber: null,
        nicNumber: null,
        phoneNumber: '03005556677',
        remarks: null,
      }),
    ).rejects.toBe(mutationError);
    expect(useCrmStore.getState().isMutating).toBe(false);

    mockedUpdateFollowUp.mockRejectedValueOnce(mutationError);
    await expect(
      useCrmStore.getState().updateLeadFollowUp(1, {
        followUpDate: '2026-08-12 11:00:00',
        remarks: null,
        status: 2,
      }),
    ).rejects.toBe(mutationError);
    expect(useCrmStore.getState().isMutating).toBe(false);
  });

  it('refreshes real detail, history, list, and summary after create, update, and follow-up', async () => {
    mockedGetLeads.mockResolvedValue({
      data: [createLeadListRecord(1)],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 1,
      },
    });
    await useCrmStore.getState().loadLeads(101, defaultCrmFilters, { page: 1, perPage: 20 });

    mockedCreateLead.mockResolvedValue({ id: 5 });
    mockedGetLead.mockResolvedValue(createLeadDetailRecord(5));
    mockedGetHistory.mockResolvedValue([
      {
        callDuration: null,
        callStatus: 2,
        comment: 'Interested',
        createdAt: '2026-08-10 10:10:00',
        followUp: '2026-08-12 11:00:00',
        id: 10,
        user: { id: 8, name: 'Sana' },
      },
    ]);

    await expect(
      useCrmStore.getState().createLeadRecord({
        firstName: 'Adeel',
        followUp: null,
        lastName: 'Shah',
        mobileNumber: null,
        nicNumber: null,
        phoneNumber: '03005556677',
        projectId: 101,
        remarks: null,
      }),
    ).resolves.toMatchObject({ id: 5 });
    expect(mockedGetLead).toHaveBeenCalledWith(5);

    mockedUpdateLead.mockResolvedValue({ id: 5 });
    await expect(
      useCrmStore.getState().updateLeadRecord(5, {
        firstName: 'Adeel',
        followUp: null,
        lastName: 'Shah',
        mobileNumber: null,
        nicNumber: null,
        phoneNumber: '03005556677',
        remarks: null,
      }),
    ).resolves.toMatchObject({ id: 5 });
    expect(mockedGetHistory).toHaveBeenCalledWith(5);

    mockedUpdateFollowUp.mockResolvedValue({ id: 5 });
    await expect(
      useCrmStore.getState().updateLeadFollowUp(5, {
        followUpDate: '2026-08-12 11:00:00',
        remarks: 'Interested',
        status: 2,
      }),
    ).resolves.toMatchObject({ id: 5 });
    expect(mockedGetSummary).toHaveBeenCalled();
    expect(mockedGetLeads).toHaveBeenCalled();
  });
});
