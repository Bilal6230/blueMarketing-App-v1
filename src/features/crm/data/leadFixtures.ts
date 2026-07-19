export type LeadStatus = 'Active' | 'Overdue' | 'Pending';

export type LeadFixture = {
  assignedTo: string;
  email: string;
  followUp: string;
  id: string;
  initials: string;
  maskedPhone: string;
  name: string;
  project: string;
  status: LeadStatus;
  statusTone: 'active' | 'overdue' | 'pending';
  timeline: {
    body: string;
    time: string;
    title: string;
  }[];
};

export const leadFixtures: LeadFixture[] = [
  {
    assignedTo: 'Sana Ahmed',
    email: 'bilal.ahmed@example.com',
    followUp: 'Today, 3:30 PM',
    id: 'lead-1',
    initials: 'BA',
    maskedPhone: '+92 •••••• 42',
    name: 'Bilal Ahmed',
    project: 'Blue Residency',
    status: 'Active',
    statusTone: 'active',
    timeline: [
      {
        body: 'Requested revised possession timeline and installment clarity.',
        time: 'Sunday, July 19, 2026 · 9:15 AM',
        title: 'Phone call logged',
      },
      {
        body: 'Sales deck and revised payment plan shared.',
        time: 'Saturday, July 18, 2026 · 4:10 PM',
        title: 'Follow-up sent',
      },
      {
        body: 'Lead assigned after site visit request.',
        time: 'Friday, July 17, 2026 · 1:25 PM',
        title: 'Lead routed',
      },
    ],
  },
  {
    assignedTo: 'Ali Raza',
    email: 'hina.khan@example.com',
    followUp: 'Overdue since Saturday, July 18, 2026',
    id: 'lead-2',
    initials: 'HK',
    maskedPhone: '+92 •••••• 51',
    name: 'Hina Khan',
    project: 'Blue Residency',
    status: 'Overdue',
    statusTone: 'overdue',
    timeline: [
      {
        body: 'Requested a revised site visit window.',
        time: 'Saturday, July 18, 2026 · 11:20 AM',
        title: 'Lead follow-up due',
      },
    ],
  },
  {
    assignedTo: 'Sana Ahmed',
    email: 'mubeen.raza@example.com',
    followUp: 'Monday, July 20, 2026 · 11:00 AM',
    id: 'lead-3',
    initials: 'MR',
    maskedPhone: '+92 •••••• 63',
    name: 'Mubeen Raza',
    project: 'Blue Residency',
    status: 'Pending',
    statusTone: 'pending',
    timeline: [
      {
        body: 'Requested payment plan comparison before booking.',
        time: 'Sunday, July 19, 2026 · 8:45 AM',
        title: 'Message received',
      },
    ],
  },
];
