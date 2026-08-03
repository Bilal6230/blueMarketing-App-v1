import type { AppRole, AuthUser } from '@/types/auth';
import type { ProjectSummary } from '@/types/project';
import { formatDateLabel, getFirstName, getGreeting } from '@/utils/dateTime';

export type DashboardActionType =
  | 'activity-finance'
  | 'activity-approval'
  | 'activity-crm'
  | 'alert-approvals'
  | 'alert-inventory'
  | 'alert-overdue'
  | 'financial-bank'
  | 'financial-hand'
  | 'financial-total'
  | 'performance-crm'
  | 'performance-recovery'
  | 'status-approvals'
  | 'status-inventory';

export type DashboardTone = 'info' | 'primary' | 'warning';

export type FinancialSummaryItem = {
  actionType: DashboardActionType;
  amount: number;
  detailBody: string[];
  detailTitle: string;
  icon: 'business-outline' | 'cash-outline' | 'wallet-outline';
  key: 'bank-account' | 'hand-cash' | 'total-cash';
  label: 'Bank Account' | 'Hand Cash' | 'Total Cash';
  metaLabel?: string;
  supportText: string;
};

export type AdminStatusItem = {
  actionType: DashboardActionType;
  count: number;
  detailBody: string[];
  detailTitle: string;
  icon: 'briefcase-outline' | 'shield-checkmark-outline';
  key: 'approvals' | 'inventory';
  label: 'Inventory pressure' | 'Pending approvals';
  supportText: string;
  tone: 'primary' | 'warning';
};

export type AttentionItem = {
  actionType: DashboardActionType;
  count: number;
  detailBody?: string[];
  detailTitle?: string;
  icon: 'alert-circle-outline' | 'briefcase-outline' | 'time-outline';
  key: 'approvals-awaiting' | 'inventory-low-stock' | 'overdue-follow-ups';
  title: string;
  tone: DashboardTone;
};

export type OverviewBarItem = {
  actionType: DashboardActionType;
  detailBody: string[];
  detailTitle: string;
  label: 'CRM follow-up compliance' | 'Recovery';
  progress: number;
};

export type RecentActivityItem = {
  actionType: DashboardActionType;
  category: 'Approvals' | 'CRM' | 'Finance';
  detailBody: string[];
  detailTitle: string;
  icon: 'cash-outline' | 'document-text-outline' | 'pulse-outline';
  id: 'activity-approvals' | 'activity-crm' | 'activity-finance';
  timeLabel: 'Today';
  title: string;
};

const dashboardSeedData = {
  administrator: {
    alerts: [
      {
        actionType: 'alert-approvals',
        count: 6,
        detailBody: [
          'Items that still require approval before close of business.',
          'Construction and sales approvals are pending review.',
        ],
        detailTitle: 'Pending approvals',
        icon: 'alert-circle-outline',
        key: 'approvals-awaiting',
        title: 'Approvals awaiting action',
        tone: 'warning',
      },
      {
        actionType: 'alert-inventory',
        count: 3,
        detailBody: [
          'Stock items that need replenishment planning.',
          'Low-stock operational items need coordination.',
        ],
        detailTitle: 'Inventory pressure',
        icon: 'briefcase-outline',
        key: 'inventory-low-stock',
        title: 'Low-stock items',
        tone: 'primary',
      },
      {
        actionType: 'alert-overdue',
        count: 12,
        icon: 'time-outline',
        key: 'overdue-follow-ups',
        title: 'Overdue lead follow-ups',
        tone: 'info',
      },
    ] as AttentionItem[],
    financialSummary: [
      {
        actionType: 'financial-hand',
        amount: 67092,
        detailBody: [
          'PKR 67,092.00',
          'Cash available for daily operations.',
        ],
        detailTitle: 'Hand Cash',
        icon: 'wallet-outline',
        key: 'hand-cash',
        label: 'Hand Cash',
        supportText: 'Cash currently available',
      },
      {
        actionType: 'financial-bank',
        amount: 1617510,
        detailBody: [
          'PKR 1,617,510.00',
          'Funds available in registered bank accounts.',
        ],
        detailTitle: 'Bank Account',
        icon: 'business-outline',
        key: 'bank-account',
        label: 'Bank Account',
        supportText: 'Current bank balance',
      },
      {
        actionType: 'financial-total',
        amount: 1684602,
        detailBody: [
          'PKR 1,684,602.00',
          'Combined hand cash and bank balance.',
        ],
        detailTitle: 'Total Cash',
        icon: 'cash-outline',
        key: 'total-cash',
        label: 'Total Cash',
        metaLabel: 'Hand cash + bank balance',
        supportText: 'Combined available balance',
      },
    ] as FinancialSummaryItem[],
    metrics: [
      {
        actionType: 'status-approvals',
        count: 6,
        detailBody: [
          'Items that still require approval before close of business.',
          'Construction and sales approvals are pending review.',
        ],
        detailTitle: 'Pending approvals',
        icon: 'shield-checkmark-outline',
        key: 'approvals',
        label: 'Pending approvals',
        supportText: 'Construction and sales',
        tone: 'warning',
      },
      {
        actionType: 'status-inventory',
        count: 3,
        detailBody: [
          'Stock items that need replenishment planning.',
          'Low-stock items need operational coordination.',
        ],
        detailTitle: 'Inventory pressure',
        icon: 'briefcase-outline',
        key: 'inventory',
        label: 'Inventory pressure',
        supportText: 'Low-stock items',
        tone: 'primary',
      },
    ] as AdminStatusItem[],
    overviewBars: [
      {
        actionType: 'performance-recovery',
        detailBody: ['Current progress: 79%.'],
        detailTitle: 'Recovery',
        label: 'Recovery',
        progress: 0.785,
      },
      {
        actionType: 'performance-crm',
        detailBody: ['Current progress: 58%.'],
        detailTitle: 'CRM follow-up compliance',
        label: 'CRM follow-up compliance',
        progress: 0.58,
      },
    ] as OverviewBarItem[],
    recentActivity: [
      {
        actionType: 'activity-approval',
        category: 'Approvals',
        detailBody: [
          'Manager approved revised instalment plan',
          'Reference 1 for the current project.',
        ],
        detailTitle: 'Activity detail',
        icon: 'document-text-outline',
        id: 'activity-approvals',
        timeLabel: 'Today',
        title: 'Manager approved revised instalment plan',
      },
      {
        actionType: 'activity-crm',
        category: 'CRM',
        detailBody: [
          'Lead recovery campaign refreshed for Block B',
          'Reference 2 for the current project.',
        ],
        detailTitle: 'Activity detail',
        icon: 'pulse-outline',
        id: 'activity-crm',
        timeLabel: 'Today',
        title: 'Lead recovery campaign refreshed for Block B',
      },
      {
        actionType: 'activity-finance',
        category: 'Finance',
        detailBody: [
          'Weekly financial summary reviewed',
          'Reference 3 for the current project.',
        ],
        detailTitle: 'Activity detail',
        icon: 'cash-outline',
        id: 'activity-finance',
        timeLabel: 'Today',
        title: 'Weekly financial summary reviewed',
      },
    ] as RecentActivityItem[],
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
