export function hasCrmPermission(
  permissions: string[],
  permission: 'create lead' | 'read lead' | 'update lead',
) {
  if (permissions.includes(permission)) {
    return true;
  }

  if (permission === 'read lead') {
    return permissions.includes('crm.view');
  }

  return false;
}
