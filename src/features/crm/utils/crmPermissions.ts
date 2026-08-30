import { hasAppPermission } from '@/utils/authorization';

export function hasCrmPermission(
  permissions: string[],
  backendRoleNames: string[],
  permission: 'create lead' | 'read lead' | 'update lead',
) {
  return hasAppPermission({
    backendRoleNames,
    permission,
    permissions,
  });
}
