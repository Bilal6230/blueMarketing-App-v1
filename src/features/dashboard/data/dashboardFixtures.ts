export const dashboardFixtures = {
  administrator: {
    alerts: [
      {
        count: 6,
        key: 'approvals-awaiting',
        title: 'Approvals awaiting action',
        tone: 'warning',
      },
      {
        count: 3,
        key: 'inventory-low-stock',
        title: 'Low-stock items',
        tone: 'primary',
      },
      {
        count: 12,
        key: 'overdue-follow-ups',
        title: 'Overdue lead follow-ups',
        tone: 'info',
      },
    ],
    financialSummary: [
      {
        amount: 1684602,
        key: 'total-cash',
        label: 'Total Cash',
        supportText: 'Combined available balance',
      },
      {
        amount: 67092,
        key: 'hand-cash',
        label: 'Hand Cash',
        supportText: 'Cash currently available',
      },
      {
        amount: 1617510,
        key: 'bank-account',
        label: 'Bank Account',
        supportText: 'Current bank balance',
      },
    ],
    greeting: 'Good morning, Sana',
    metrics: [
      {
        count: 6,
        label: 'Pending approvals',
        supportText: 'Construction and sales',
      },
      {
        count: 3,
        label: 'Inventory pressure',
        supportText: 'Low-stock items',
      },
    ],
    overviewBars: [
      { label: 'Recovery', progress: 0.785 },
      { label: 'CRM follow-up compliance', progress: 0.58 },
    ],
    quickActions: [
      'Review approvals',
      'Check recovery plan',
      'Open team status',
    ],
    recentActivity: [
      {
        category: 'Approvals',
        id: 'activity-approvals',
        timeLabel: 'Today',
        title: 'Manager approved revised instalment plan',
      },
      {
        category: 'CRM',
        id: 'activity-crm',
        timeLabel: 'Today',
        title: 'Lead recovery campaign refreshed for Block B',
      },
      {
        category: 'Finance',
        id: 'activity-finance',
        timeLabel: 'Today',
        title: 'Weekly financial summary reviewed',
      },
    ],
  },
  shared: {
    dateLabel: 'Sunday, July 19, 2026',
    projectName: 'Blue Residency',
  },
  staff: {
    greeting: 'Good morning, Bilal',
    priorities: [
      '7 follow-ups due before 5:00 PM',
      '2 overdue leads need recovery today',
      'Prepare site visit notes for Blue Residency',
    ],
    quickActions: [
      'Open CRM queue',
      'Check attendance',
      'Review today schedule',
    ],
    recentActivity: [
      'Lead follow-up scheduled with Ayesha at 3:30 PM',
      'Inventory note added for Block C signage',
      'Customer call logged by Sana',
    ],
    stats: [
      { icon: 'call-outline', label: 'Follow-ups today', value: '7' },
      { icon: 'alert-circle-outline', label: 'Overdue leads', value: '2' },
      { icon: 'people-outline', label: 'Active leads', value: '18' },
    ],
  },
};
