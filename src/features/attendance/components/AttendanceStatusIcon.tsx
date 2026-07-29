import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { StaffAttendanceStatus } from '@/features/attendance/services/attendanceService';
import { useAppTheme } from '@/hooks/useAppTheme';

type AttendanceStatusIconProps = {
  size?: 'large' | 'small';
  status: StaffAttendanceStatus;
};

export function AttendanceStatusIcon({
  size = 'large',
  status,
}: AttendanceStatusIconProps) {
  const { theme } = useAppTheme();
  const iconSize = size === 'large' ? 24 : 16;
  const boxSize = size === 'large' ? 52 : 32;
  const tokens =
    status === 'checked_out'
      ? {
          backgroundColor: theme.colors.successSoft,
          color: theme.colors.success,
          icon: 'checkmark-done-circle-outline' as const,
        }
      : status === 'checked_in'
        ? {
            backgroundColor: theme.colors.primarySoft,
            color: theme.colors.primary,
            icon: 'checkmark-circle-outline' as const,
          }
        : {
            backgroundColor: theme.colors.infoSoft,
            color: theme.colors.primary,
            icon: 'time-outline' as const,
          };

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: tokens.backgroundColor,
        borderRadius: 999,
        height: boxSize,
        justifyContent: 'center',
        width: boxSize,
      }}
    >
      <Ionicons
        accessibilityElementsHidden
        color={tokens.color}
        name={tokens.icon}
        size={iconSize}
      />
    </View>
  );
}
