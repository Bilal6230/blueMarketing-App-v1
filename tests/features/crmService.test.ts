import { ApiError } from '@/api/errors';
import { apiClient } from '@/api/client';
import {
  createLead,
  defaultCrmFilters,
  getHistory,
  getLead,
  getLeads,
  getSummary,
  mapCrmFieldErrors,
  updateFollowUp,
  updateLead,
} from '@/features/crm/services/crmService';

jest.mock('@/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('crmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-10T09:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends project_id to crm/summary and maps snake_case summary fields', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        data: {
          active_leads: 12,
          completed_or_future_followups: 3,
          overdue_followups: 2,
          today_followups: 4,
          total_leads: 20,
        },
      },
    } as never);

    await expect(getSummary(101)).resolves.toEqual({
      activeLeads: 12,
      overdueFollowups: 2,
      todayFollowups: 4,
      totalLeads: 20,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('crm/summary', {
      params: { project_id: 101 },
    });
  });

  it('sends project_id and search to crm/leads and maps list/pagination data', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        data: [
          {
            assigned_user: { id: 9, name: 'Sana Ahmed' },
            created_at: '2026-08-10 09:15:00',
            first_name: 'Bilal',
            follow_up: '2026-08-12 11:30:00',
            id: 11,
            last_name: 'Iqbal',
            mobile_number: '03001234567',
            phone_number: '03001112233',
            project: { id: 101, name: 'Blue Residency' },
            status: 'active',
          },
        ],
        meta: {
          current_page: 2,
          last_page: 4,
          per_page: 20,
          selected_project_id: 101,
          total: 77,
        },
      },
    } as never);

    const result = await getLeads(
      101,
      { ...defaultCrmFilters, search: 'Bilal' },
      { page: 2, perPage: 20 },
    );

    expect(mockedApiClient.get).toHaveBeenCalledWith('crm/leads', {
      params: {
        page: 2,
        per_page: 20,
        project_id: 101,
        search: 'Bilal',
        sort_by: 'follow_up',
        sort_order: 'asc',
      },
    });
    expect(result).toEqual({
      data: [
        {
          assignedUser: { id: 9, name: 'Sana Ahmed' },
          createdAt: '2026-08-10 09:15:00',
          firstName: 'Bilal',
          followUp: '2026-08-12 11:30:00',
          id: 11,
          lastName: 'Iqbal',
          mobileNumber: '03001234567',
          phoneNumber: '03001112233',
          project: { id: 101, name: 'Blue Residency' },
          recordState: 'active',
        },
      ],
      meta: {
        currentPage: 2,
        lastPage: 4,
        perPage: 20,
        total: 77,
      },
    });
  });

  it('maps recordState filters to backend status parameters and omits status for all', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, selected_project_id: 101, total: 0 } },
    } as never);

    await getLeads(101, { ...defaultCrmFilters, recordState: 'active' }, { page: 1, perPage: 20 });
    await getLeads(101, { ...defaultCrmFilters, recordState: 'inactive' }, { page: 1, perPage: 20 });
    await getLeads(101, { ...defaultCrmFilters, recordState: 'all' }, { page: 1, perPage: 20 });

    expect(mockedApiClient.get.mock.calls[0]?.[1]).toMatchObject({
      params: expect.objectContaining({ status: 'active' }),
    });
    expect(mockedApiClient.get.mock.calls[1]?.[1]).toMatchObject({
      params: expect.objectContaining({ status: 'inactive' }),
    });
    expect(mockedApiClient.get.mock.calls[2]?.[1]).toMatchObject({
      params: expect.not.objectContaining({ status: expect.anything() }),
    });
  });

  it('maps today, overdue, and upcoming quick filters to local date ranges', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, selected_project_id: 101, total: 0 } },
    } as never);

    await getLeads(101, { ...defaultCrmFilters, quickFilter: 'today' }, { page: 1, perPage: 20 });
    await getLeads(101, { ...defaultCrmFilters, quickFilter: 'overdue' }, { page: 1, perPage: 20 });
    await getLeads(101, { ...defaultCrmFilters, quickFilter: 'upcoming' }, { page: 1, perPage: 20 });

    expect(mockedApiClient.get.mock.calls[0]?.[1]).toMatchObject({
      params: expect.objectContaining({
        follow_up_from: '2026-08-10',
        follow_up_to: '2026-08-10',
      }),
    });
    expect(mockedApiClient.get.mock.calls[1]?.[1]).toMatchObject({
      params: expect.objectContaining({
        follow_up_to: '2026-08-09',
      }),
    });
    expect(mockedApiClient.get.mock.calls[2]?.[1]).toMatchObject({
      params: expect.objectContaining({
        follow_up_from: '2026-08-11',
      }),
    });
  });

  it('intersects quick and advanced follow-up ranges and skips impossible server requests', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, selected_project_id: 101, total: 0 } },
    } as never);

    await getLeads(
      101,
      {
        ...defaultCrmFilters,
        followUpFrom: '2026-08-01',
        quickFilter: 'overdue',
      },
      { page: 1, perPage: 20 },
    );

    expect(mockedApiClient.get).toHaveBeenCalledWith('crm/leads', {
      params: expect.objectContaining({
        follow_up_from: '2026-08-01',
        follow_up_to: '2026-08-09',
      }),
    });

    mockedApiClient.get.mockClear();

    const emptyResult = await getLeads(
      101,
      {
        ...defaultCrmFilters,
        followUpFrom: '2026-08-12',
        quickFilter: 'overdue',
      },
      { page: 1, perPage: 20 },
    );

    expect(mockedApiClient.get).not.toHaveBeenCalled();
    expect(emptyResult).toEqual({
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
      },
    });
  });

  it('maps sorting parameters directly', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, selected_project_id: 101, total: 0 } },
    } as never);

    await getLeads(
      101,
      {
        ...defaultCrmFilters,
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
      { page: 1, perPage: 20 },
    );

    expect(mockedApiClient.get).toHaveBeenCalledWith('crm/leads', {
      params: expect.objectContaining({
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    });
  });

  it('maps detail and history responses using the real backend contract', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: {
          data: {
            assigned_user: null,
            created_at: '2026-08-10 09:00:00',
            first_name: 'Adeel',
            follow_up: '2026-08-11 10:00:00',
            id: 51,
            last_name: 'Shah',
            remarks: 'Call again tomorrow.',
            mobile_number: null,
            nic_number_masked: '*********1111',
            phone_number: '03005556677',
            project: { id: 101, name: 'Blue Residency' },
            status: 'inactive',
            updated_at: '2026-08-10 09:30:00',
          },
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              call_duration: 180,
              call_status: 2,
              comment: 'Interested in visit.',
              created_at: '2026-08-10 09:35:00',
              follow_up: '2026-08-11 10:00:00',
              id: 900,
              user: { id: 5, name: 'Amina' },
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        data: { data: [] },
      } as never);

    const detail = await getLead(51);
    const history = await getHistory(51);
    const emptyHistory = await getHistory(52);

    expect(detail).toEqual({
      assignedUser: null,
      createdAt: '2026-08-10 09:00:00',
      firstName: 'Adeel',
      followUp: '2026-08-11 10:00:00',
      id: 51,
      lastName: 'Shah',
      latestRemarks: 'Call again tomorrow.',
      mobileNumber: null,
      nicNumberMasked: '*********1111',
      phoneNumber: '03005556677',
      project: { id: 101, name: 'Blue Residency' },
      recordState: 'inactive',
      updatedAt: '2026-08-10 09:30:00',
    });
    expect(history).toEqual([
      {
        callDuration: 180,
        callStatus: 2,
        comment: 'Interested in visit.',
        createdAt: '2026-08-10 09:35:00',
        followUp: '2026-08-11 10:00:00',
        id: 900,
        user: { id: 5, name: 'Amina' },
      },
    ]);
    expect(emptyHistory).toEqual([]);
  });

  it('sends create, update, and follow-up requests with real backend field names', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({ data: { data: { id: 501 } } } as never)
      .mockResolvedValueOnce({ data: { data: {} } } as never);
    mockedApiClient.put.mockResolvedValue({ data: { data: {} } } as never);

    await expect(
      createLead({
        firstName: ' Adeel ',
        followUp: '2026-08-12 11:00:00',
        lastName: ' Shah ',
        mobileNumber: '',
        nicNumber: ' ',
        phoneNumber: ' 03005556677 ',
        projectId: 101,
        remarks: ' Interested ',
      }),
    ).resolves.toEqual({ id: 501 });

    await updateLead(501, {
      firstName: ' Adeel ',
      followUp: null,
      lastName: ' Shah ',
      mobileNumber: '03001234567',
      nicNumber: '',
      phoneNumber: ' 03005556677 ',
      remarks: '',
    });

    await updateFollowUp(501, {
      followUpDate: '2026-08-13 16:00:00',
      remarks: ' Needs callback ',
      status: 2,
    });

    expect(mockedApiClient.post.mock.calls[0]).toEqual([
      'crm/leads',
      {
        first_name: 'Adeel',
        follow_up: '2026-08-12 11:00:00',
        last_name: 'Shah',
        mobile_number: null,
        nic_number: null,
        phone_number: '03005556677',
        project_id: 101,
        remarks: 'Interested',
      },
    ]);
    expect(mockedApiClient.put.mock.calls[0]).toEqual([
      'crm/leads/501',
      {
        first_name: 'Adeel',
        follow_up: null,
        last_name: 'Shah',
        mobile_number: '03001234567',
        phone_number: '03005556677',
      },
    ]);
    expect(mockedApiClient.post.mock.calls[1]).toEqual([
      'crm/leads/501/follow-up',
      {
        follow_up_date: '2026-08-13 16:00:00',
        remarks: 'Needs callback',
        status: 2,
      },
    ]);
  });

  it('omits nic_number and remarks from update requests when the user leaves them blank', async () => {
    mockedApiClient.put.mockResolvedValue({ data: { data: {} } } as never);

    await updateLead(501, {
      firstName: 'Adeel',
      followUp: null,
      lastName: 'Shah',
      mobileNumber: null,
      nicNumber: undefined,
      phoneNumber: '03005556677',
      remarks: undefined,
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith('crm/leads/501', {
      first_name: 'Adeel',
      follow_up: null,
      last_name: 'Shah',
      mobile_number: null,
      phone_number: '03005556677',
    });
  });

  it('sends nic_number and remarks when the user explicitly enters new values', async () => {
    mockedApiClient.put.mockResolvedValue({ data: { data: {} } } as never);

    await updateLead(501, {
      firstName: 'Adeel',
      followUp: null,
      lastName: 'Shah',
      mobileNumber: null,
      nicNumber: ' 3520211111111 ',
      phoneNumber: '03005556677',
      remarks: ' New remark ',
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith('crm/leads/501', {
      first_name: 'Adeel',
      follow_up: null,
      last_name: 'Shah',
      mobile_number: null,
      nic_number: '3520211111111',
      phone_number: '03005556677',
      remarks: 'New remark',
    });
  });

  it('maps follow_up_date validation errors into the existing follow-up form field bucket', () => {
    expect(
      mapCrmFieldErrors({
        follow_up_date: ['Use a valid follow-up date.'],
      }),
    ).toEqual({
      followUp: 'Use a valid follow-up date.',
    });
  });

  it('passes through ApiError responses for validation and not-found cases', async () => {
    const validationError = new ApiError({
      errorKey: 'validation_error',
      fieldErrors: { phone_number: ['Phone already exists.'] },
      message: 'The given data was invalid.',
      statusCode: 422,
    });
    const notFoundError = new ApiError({
      errorKey: 'not_found',
      message: 'Lead not found.',
      statusCode: 404,
    });

    mockedApiClient.post.mockRejectedValueOnce(validationError);
    mockedApiClient.get.mockRejectedValueOnce(notFoundError);

    await expect(
      createLead({
        firstName: 'Adeel',
        followUp: null,
        lastName: 'Shah',
        mobileNumber: null,
        nicNumber: null,
        phoneNumber: '03005556677',
        projectId: 101,
        remarks: null,
      }),
    ).rejects.toBe(validationError);

    await expect(getLead(999)).rejects.toBe(notFoundError);
  });
});
