import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from '@/utils/permissions';

describe('permissions utilities', () => {
  it('matches exact permissions after normalization', () => {
    expect(hasPermission([' reports.view '], 'reports.view')).toBe(true);
  });

  it('rejects partial permission matches', () => {
    expect(hasPermission(['reports.view_all'], 'reports.view')).toBe(false);
  });

  it('supports any-permission matching', () => {
    expect(hasAnyPermission(['crm.read', 'stock.update'], ['stock.update', 'admin.manage'])).toBe(
      true,
    );
  });

  it('supports all-permission matching', () => {
    expect(hasAllPermissions(['crm.read', 'stock.update'], ['crm.read', 'stock.update'])).toBe(
      true,
    );
  });

  it('handles empty required permission arrays predictably', () => {
    expect(hasAnyPermission(['crm.read'], [])).toBe(false);
    expect(hasAllPermissions(['crm.read'], [])).toBe(true);
  });

  it('handles duplicates and case-insensitive comparisons', () => {
    expect(hasAnyPermission([' Admin.Manage ', 'admin.manage'], ['admin.manage'])).toBe(true);
  });

  it('checks roles consistently', () => {
    expect(hasRole([' SuperAdmin '], 'superadmin')).toBe(true);
    expect(hasAnyRole(['staff'], ['admin', 'staff'])).toBe(true);
  });

  it('treats missing permissions as false', () => {
    expect(hasPermission([], 'reports.view')).toBe(false);
  });
});
