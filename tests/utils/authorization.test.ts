import { hasAppPermission } from '@/utils/authorization';

describe('authorization', () => {
  it('allows superadmin to read lead without explicit permissions', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['superadmin'],
        permission: 'read lead',
        permissions: [],
      }),
    ).toBe(true);
  });

  it('allows superadmin to create lead without explicit permissions', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['superadmin'],
        permission: 'create lead',
        permissions: [],
      }),
    ).toBe(true);
  });

  it('allows superadmin to update lead without explicit permissions', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['superadmin'],
        permission: 'update lead',
        permissions: [],
      }),
    ).toBe(true);
  });

  it('does not allow admin without explicit permissions', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['admin'],
        permission: 'read lead',
        permissions: [],
      }),
    ).toBe(false);
  });

  it('allows normal admin with explicit read permission', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['admin'],
        permission: 'read lead',
        permissions: ['read lead'],
      }),
    ).toBe(true);
  });

  it('does not treat normalized administrator role alone as superadmin', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['administrator'],
        permission: 'read lead',
        permissions: [],
      }),
    ).toBe(false);
  });

  it('matches backend role names safely across case and whitespace', () => {
    expect(
      hasAppPermission({
        backendRoleNames: ['  SuperAdmin  '],
        permission: 'read lead',
        permissions: [],
      }),
    ).toBe(true);
  });
});
