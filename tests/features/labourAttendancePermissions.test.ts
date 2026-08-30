import {
  canMarkLabourAttendance,
  canReadLabourAttendance,
  canUpdateSavedLabourAttendance,
} from '@/features/attendance/labour/utils/labourAttendancePermissions';

describe('labour attendance permissions', () => {
  it('allows read-only access without mark or update permissions', () => {
    const permissions = ['read attendance'];

    expect(canReadLabourAttendance(permissions)).toBe(true);
    expect(canMarkLabourAttendance(permissions)).toBe(false);
    expect(canUpdateSavedLabourAttendance(permissions, ['staff'])).toBe(false);
  });

  it('allows administrators to update saved labour attendance', () => {
    expect(canUpdateSavedLabourAttendance([], ['administrator'])).toBe(true);
  });
});
