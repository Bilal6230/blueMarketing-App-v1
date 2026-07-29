import {
  __resetCrmServiceData,
  createLead,
  defaultCrmFilters,
  getHistory,
  getLead,
  getLeads,
  getSummary,
  updateFollowUp,
} from '@/features/crm/services/crmService';
import {
  formatLeadFollowUpLabel,
  getFollowUpTiming,
} from '@/features/crm/utils/crmSelectors';

describe('crmService', () => {
  beforeEach(() => {
    __resetCrmServiceData();
  });

  it('uses API-shaped lead records without email fields', async () => {
    const { data } = await getLeads(101, defaultCrmFilters, { page: 1, perPage: 20 });
    const detail = await getLead(1011);

    expect(data[0]).not.toHaveProperty('email');
    expect(detail).not.toHaveProperty('email');
    expect(detail).toHaveProperty('nicNumberMasked');
  });

  it('search matches name and phone', async () => {
    const byName = await getLeads(
      101,
      { ...defaultCrmFilters, search: 'Bilal' },
      { page: 1, perPage: 20 },
    );
    const byPhone = await getLeads(
      101,
      { ...defaultCrmFilters, search: '03001112251' },
      { page: 1, perPage: 20 },
    );

    expect(byName.data.map((lead) => lead.id)).toEqual([1011]);
    expect(byPhone.data.map((lead) => lead.id)).toEqual([1012]);
  });

  it('quick filters represent follow-up timing and overdue is derived from follow-up date', async () => {
    const today = await getLeads(
      101,
      { ...defaultCrmFilters, quickFilter: 'today' },
      { page: 1, perPage: 20 },
    );
    const overdue = await getLeads(
      101,
      { ...defaultCrmFilters, quickFilter: 'overdue' },
      { page: 1, perPage: 20 },
    );
    const upcoming = await getLeads(
      101,
      { ...defaultCrmFilters, quickFilter: 'upcoming' },
      { page: 1, perPage: 20 },
    );

    expect(today.data.map((lead) => lead.id)).toEqual([1011]);
    expect(overdue.data.map((lead) => lead.id)).toEqual([1012]);
    expect(upcoming.data.map((lead) => lead.id)).toEqual([1013]);
    expect(getFollowUpTiming('2026-07-28 11:00:00', new Date('2026-07-29T09:00:00'))).toBe('overdue');
    expect(formatLeadFollowUpLabel('2026-07-28 11:00:00', new Date('2026-07-29T09:00:00'))).toMatch(/Overdue by 1 day/i);
  });

  it('keeps active or inactive as a separate record state from follow-up timing', async () => {
    const active = await getLeads(
      101,
      { ...defaultCrmFilters, recordState: 'active' },
      { page: 1, perPage: 20 },
    );
    const inactive = await getLeads(
      102,
      { ...defaultCrmFilters, recordState: 'inactive' },
      { page: 1, perPage: 20 },
    );

    expect(active.data.every((lead) => lead.recordState === 'active')).toBe(true);
    expect(inactive.data[0]?.recordState).toBe('inactive');
  });

  it('summary counts reflect project data and summary cards can filter list inputs', async () => {
    const summary = await getSummary(101);
    const overdue = await getLeads(
      101,
      { ...defaultCrmFilters, quickFilter: 'overdue' },
      { page: 1, perPage: 20 },
    );

    expect(summary).toEqual({
      activeLeads: 3,
      overdueFollowups: 1,
      todayFollowups: 1,
      totalLeads: 3,
    });
    expect(overdue.meta.total).toBe(summary.overdueFollowups);
  });

  it('create lead returns API-like id and history uses API-shaped fields', async () => {
    const created = await createLead({
      firstName: 'Adeel',
      followUp: '2026-07-30 12:30:00',
      lastName: 'Shah',
      mobileNumber: null,
      nicNumber: '3520211111111',
      phoneNumber: '03005556677',
      projectId: 101,
      remarks: 'Requested a callback after lunch.',
    });
    const detail = await getLead(created.id);
    const history = await getHistory(created.id);

    expect(detail?.project.id).toBe(101);
    expect(history[0]).toMatchObject({
      callDuration: null,
      callStatus: 6,
      comment: 'Requested a callback after lunch.',
      followUp: '2026-07-30 12:30:00',
    });
  });

  it('updateFollowUp does not require remarks and immediately affects list, detail, history and summary', async () => {
    await updateFollowUp(1013, {
      followUpDate: '2026-07-29 18:00:00',
      remarks: null,
      status: 2,
    });

    const detail = await getLead(1013);
    const history = await getHistory(1013);
    const summary = await getSummary(101);
    const today = await getLeads(
      101,
      { ...defaultCrmFilters, quickFilter: 'today' },
      { page: 1, perPage: 20 },
    );

    expect(detail?.followUp).toBe('2026-07-29 18:00:00');
    expect(history[0]).toMatchObject({
      callStatus: 2,
      comment: null,
      followUp: '2026-07-29 18:00:00',
    });
    expect(summary.todayFollowups).toBe(2);
    expect(today.data.map((lead) => lead.id)).toContain(1013);
  });
});
