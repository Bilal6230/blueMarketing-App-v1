type InternalAssignedUser = {
  id: number;
  name: string;
};

type InternalLeadRecord = {
  assignedUser: InternalAssignedUser | null;
  createdAt: string | null;
  firstName: string;
  followStatus: number | null;
  followUp: string | null;
  history: InternalLeadHistoryRecord[];
  id: number;
  isActive: boolean;
  lastName: string;
  latestRemarks: string | null;
  mobileNumber: string | null;
  nicNumber: string | null;
  phoneNumber: string;
  project: {
    id: number;
    name: string;
  };
  updatedAt: string | null;
};

type InternalLeadHistoryRecord = {
  callDuration: number | null;
  callStatus: number | null;
  comment: string | null;
  createdAt: string | null;
  followUp: string | null;
  id: number;
  user: InternalAssignedUser | null;
};

const crmSeedData: InternalLeadRecord[] = [
  {
    assignedUser: { id: 1, name: 'Sana Ahmed' },
    createdAt: '2026-07-25 09:15:00',
    firstName: 'Bilal',
    followStatus: 2,
    followUp: '2026-07-29 15:30:00',
    history: [
      {
        callDuration: 240,
        callStatus: 2,
        comment: 'Requested another call after reviewing the payment plan.',
        createdAt: '2026-07-29 14:15:00',
        followUp: '2026-07-31 15:00:00',
        id: 9001,
        user: { id: 1, name: 'Sana Ahmed' },
      },
      {
        callDuration: 180,
        callStatus: 6,
        comment: 'Initial lead created after site visit enquiry.',
        createdAt: '2026-07-25 09:15:00',
        followUp: '2026-07-29 15:30:00',
        id: 9002,
        user: { id: 1, name: 'Sana Ahmed' },
      },
    ],
    id: 1011,
    isActive: true,
    lastName: 'Ahmed',
    latestRemarks: 'Requested another call after reviewing the payment plan.',
    mobileNumber: '03121112242',
    nicNumber: '4210112345678',
    phoneNumber: '03001112242',
    project: { id: 101, name: 'Blue Residency' },
    updatedAt: '2026-07-29 14:15:00',
  },
  {
    assignedUser: { id: 2, name: 'Bilal Iqbal' },
    createdAt: '2026-07-22 11:00:00',
    firstName: 'Hina',
    followStatus: 3,
    followUp: '2026-07-28 11:00:00',
    history: [
      {
        callDuration: 120,
        callStatus: 3,
        comment: 'Asked for another call after family discussion.',
        createdAt: '2026-07-27 16:10:00',
        followUp: '2026-07-28 11:00:00',
        id: 9003,
        user: { id: 2, name: 'Bilal Iqbal' },
      },
    ],
    id: 1012,
    isActive: true,
    lastName: 'Khan',
    latestRemarks: 'Asked for another call after family discussion.',
    mobileNumber: null,
    nicNumber: '3520212345678',
    phoneNumber: '03001112251',
    project: { id: 101, name: 'Blue Residency' },
    updatedAt: '2026-07-27 16:10:00',
  },
  {
    assignedUser: { id: 1, name: 'Sana Ahmed' },
    createdAt: '2026-07-23 10:25:00',
    firstName: 'Mubeen',
    followStatus: 7,
    followUp: '2026-07-31 10:00:00',
    history: [
      {
        callDuration: 300,
        callStatus: 7,
        comment: 'Town visit confirmed for the weekend.',
        createdAt: '2026-07-28 12:45:00',
        followUp: '2026-07-31 10:00:00',
        id: 9004,
        user: { id: 1, name: 'Sana Ahmed' },
      },
    ],
    id: 1013,
    isActive: true,
    lastName: 'Raza',
    latestRemarks: 'Town visit confirmed for the weekend.',
    mobileNumber: '03012223333',
    nicNumber: null,
    phoneNumber: '03001112263',
    project: { id: 101, name: 'Blue Residency' },
    updatedAt: '2026-07-28 12:45:00',
  },
  {
    assignedUser: null,
    createdAt: '2026-07-21 08:40:00',
    firstName: 'Ayesha',
    followStatus: 6,
    followUp: null,
    history: [],
    id: 1021,
    isActive: false,
    lastName: 'Noor',
    latestRemarks: null,
    mobileNumber: null,
    nicNumber: '6110112345678',
    phoneNumber: '03007778899',
    project: { id: 102, name: 'Blue Heights' },
    updatedAt: '2026-07-21 08:40:00',
  },
];

export function createCrmSeedData() {
  return crmSeedData.map((lead) => ({
    ...lead,
    assignedUser: lead.assignedUser ? { ...lead.assignedUser } : null,
    history: lead.history.map((historyItem) => ({
      ...historyItem,
      user: historyItem.user ? { ...historyItem.user } : null,
    })),
    project: { ...lead.project },
  }));
}
