export const dashboardFixtures = {
  administrator: {
    alerts: [
      '6 approvals are waiting for action',
      '3 low-stock items need coordination',
      '12 lead follow-ups are overdue',
    ],
    greeting: 'Good morning, Sana',
    metrics: [
      {
        icon: 'cash-outline',
        label: 'Collections today',
        supportText: 'PKR 12.4M received this week',
        value: 'PKR 48.2M',
      },
      {
        icon: 'shield-checkmark-outline',
        label: 'Pending approvals',
        supportText: 'Construction and sales',
        value: '6',
      },
      {
        icon: 'briefcase-outline',
        label: 'Inventory pressure',
        supportText: 'Low-stock operational items',
        value: '3',
      },
    ],
    overviewBars: [
      { label: 'Recovery', progress: 0.785 },
      { label: 'Collections', progress: 0.66 },
      { label: 'CRM follow-up compliance', progress: 0.58 },
    ],
    quickActions: [
      'Review approvals',
      'Check recovery plan',
      'Open team status',
    ],
    recentActivity: [
      'Manager approved revised instalment plan',
      'Lead recovery campaign refreshed for Block B',
      'Collections summary shared with executive team',
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
