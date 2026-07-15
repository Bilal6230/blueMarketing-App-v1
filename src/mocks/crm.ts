export const crmLeadsMock = [
  {
    assignedTo: 'Sana',
    followUp: 'Follow-up today, 3:30 PM',
    initials: 'BA',
    maskedPhone: '+92 •••••• 42',
    name: 'Bilal Ahmed',
    status: 'Active',
    statusTone: 'active' as const,
  },
  {
    assignedTo: 'Ali',
    followUp: 'Overdue since yesterday',
    initials: 'HK',
    maskedPhone: '+92 •••••• 51',
    name: 'Hina Khan',
    status: 'Overdue',
    statusTone: 'overdue' as const,
  },
  {
    assignedTo: 'Sana',
    followUp: 'Tomorrow, 11:00 AM',
    initials: 'MR',
    maskedPhone: '+92 •••••• 63',
    name: 'Mubeen Raza',
    status: 'Pending',
    statusTone: 'pending' as const,
  },
];

export const leadDetailMock = {
  actions: ['Call lead', 'Add follow-up'],
  assignedTo: 'Sana Ahmed',
  email: 'bilal.ahmed@example.com',
  followUp: 'Today, 3:30 PM',
  initials: 'BA',
  maskedPhone: '+92 •••••• 42',
  name: 'Bilal Ahmed',
  project: 'Blue Residency',
  status: 'Active',
  timeline: [
    {
      body: 'Requested revised possession timeline and installment clarity.',
      time: 'Today · 9:15 AM',
      title: 'Phone call logged',
    },
    {
      body: 'Sales deck and revised payment plan shared.',
      time: 'Yesterday · 4:10 PM',
      title: 'Follow-up sent',
    },
    {
      body: 'Lead assigned to Sana after site visit request.',
      time: 'Monday · 1:25 PM',
      title: 'Lead routed',
    },
  ],
};
