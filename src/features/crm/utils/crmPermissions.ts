export function hasCrmPermission(
  permissions: string[],
  permission: 'create lead' | 'read lead' | 'update lead',
) {
  return permissions.includes(permission);
}
