import { hasPermission, hasRole } from '@/utils/permissions';

type HasAppPermissionInput = {
  backendRoleNames?: readonly string[];
  permission: string;
  permissions: readonly string[];
};

export function hasAppPermission({
  backendRoleNames = [],
  permission,
  permissions,
}: HasAppPermissionInput) {
  if (hasRole([...backendRoleNames], 'superadmin')) {
    return true;
  }

  return hasPermission([...permissions], permission);
}
