import type { AppRole, AuthUser } from '@/types/auth';
import type { ProjectSummary } from '@/types/project';
import { formatDateLabel, getFirstName, getGreeting } from '@/utils/dateTime';

export type FinancialSummaryItem = {
  amount: number;
  detailBody: string[];
  icon: 'business-outline' | 'cash-outline' | 'wallet-outline';
  key: 'bank-account' | 'hand-cash' | 'total-cash';
  label: 'Bank Account' | 'Hand Cash' | 'Total Cash';
  supportText: string;
};

const dashboardSeedData = {
  administrator: {
    alerts: [
      '6 approvals are waiting for action',
      '3 low-stock items need coordination',
      '12 lead follow-ups are overdue',
    ],
    financialSummary: [
      {
        amount: 67092,
        detailBody: [
          'PKR 67,092.00',
          'Cash available for daily operations.',
        ],
        icon: 'wallet-outline',
        key: 'hand-cash',
        label: 'Hand Cash',
        supportText: 'Cash currently available',
      },
      {
        amount: 1617510,
        detailBody: [
          'PKR 1,617,510.00',
          'Funds available in registered bank accounts.',
        ],
        icon: 'business-outline',
        key: 'bank-account',
        label: 'Bank Account',
        supportText: 'Current bank balance',
      },
      {
        amount: 1684602,
        detailBody: [
          'PKR 1,684,602.00',
          'Combined hand cash and bank balance.',
        ],
        icon: 'cash-outline',
        key: 'total-cash',
        label: 'Total Cash',
        supportText: 'Combined available balance',
      },
    ] as FinancialSummaryItem[],
    metrics: [
      {
        detail: 'Items that still require approval before close of business.',
        icon: 'shield-checkmark-outline',
        key: 'approvals',
        label: 'Pending approvals',
        supportText: 'Construction and sales',
        value: '6',
      },
      {
        detail: 'Stock items that need replenishment planning.',
        icon: 'briefcase-outline',
        key: 'inventory',
        label: 'Inventory pressure',
        supportText: 'Low-stock operational items',
        value: '3',
      },
    ],
    overviewBars: [
      { label: 'Recovery', progress: 0.785 },
      { label: 'CRM follow-up compliance', progress: 0.58 },
    ],
    recentActivity: [
      'Manager approved revised instalment plan',
      'Lead recovery campaign refreshed for Block B',
      'Weekly financial summary reviewed by management',
    ],
  },
  staff: {
    priorities: [
      {
        key: 'follow-ups',
        label: '7 follow-ups due before 5:00 PM',
        route: { pathname: '/(app)/crm' as const, params: { status: 'All' } },
      },
      {
        key: 'overdue',
        label: '2 overdue leads need recovery today',
        route: {
          pathname: '/(app)/crm' as const,
          params: { status: 'Overdue' },
        },
      },
      {
        key: 'attendance',
        label: 'Prepare site visit notes for Blue Residency',
        route: { pathname: '/(app)/attendance' as const },
      },
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

type AdministratorDashboard = typeof dashboardSeedData.administrator & {
  dateLabel: string;
  greeting: string;
  projectName: string;
};

type StaffDashboard = typeof dashboardSeedData.staff & {
  dateLabel: string;
  greeting: string;
  projectName: string;
};

export function getDashboard(
  role: 'administrator',
  user: AuthUser | null,
  project?: ProjectSummary | null,
): AdministratorDashboard;
export function getDashboard(
  role: 'staff',
  user: AuthUser | null,
  project?: ProjectSummary | null,
): StaffDashboard;
export function getDashboard(
  role: AppRole,
  user: AuthUser | null,
  project?: ProjectSummary | null,
) {
  const now = new Date();
  const name = getFirstName(user?.name);

  return {
    dateLabel: formatDateLabel(now),
    greeting: `${getGreeting(now)}, ${name}`,
    projectName: project?.name ?? 'Blue Residency',
    ...(role === 'administrator'
      ? dashboardSeedData.administrator
      : dashboardSeedData.staff),
  };
}
