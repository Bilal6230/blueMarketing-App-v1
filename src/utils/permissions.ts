const normalizeValue = (value: string) => value.trim().toLowerCase();
const normalizeList = (values: string[]) =>
  [...new Set(values.map((value) => normalizeValue(value)).filter(Boolean))];

export function hasPermission(permissions: string[], permission: string) {
  const normalizedPermission = normalizeValue(permission);
  return normalizeList(permissions).includes(normalizedPermission);
}

export function hasAnyPermission(permissions: string[], requiredPermissions: string[]) {
  if (requiredPermissions.length === 0) {
    return false;
  }

  const normalizedPermissions = normalizeList(permissions);
  return normalizeList(requiredPermissions).some((permission) =>
    normalizedPermissions.includes(permission),
  );
}

export function hasAllPermissions(permissions: string[], requiredPermissions: string[]) {
  if (requiredPermissions.length === 0) {
    return true;
  }

  const normalizedPermissions = normalizeList(permissions);
  return normalizeList(requiredPermissions).every((permission) =>
    normalizedPermissions.includes(permission),
  );
}

export function hasRole(roles: string[], role: string) {
  const normalizedRole = normalizeValue(role);
  return normalizeList(roles).includes(normalizedRole);
}

export function hasAnyRole(roles: string[], requiredRoles: string[]) {
  if (requiredRoles.length === 0) {
    return false;
  }

  const normalizedRoles = normalizeList(roles);
  return normalizeList(requiredRoles).some((role) => normalizedRoles.includes(role));
}
