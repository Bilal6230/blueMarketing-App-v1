import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { AttendanceScreen } from '@/features/attendance/screens/AttendanceScreen';
import {
  __resetAttendanceServiceData,
  checkIn,
  checkOut,
} from '@/features/attendance/services/attendanceService';
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: mockPush,
    replace: jest.fn(),
  }),
}));

async function flushServiceDelay() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(400);
  });
}

describe('AttendanceScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
    mockPush.mockReset();
    __resetAttendanceServiceData();
    useAttendanceStore.getState().resetAttendanceState();
    useAuthStore.setState({
      accessToken: 'token',
      clearSession: jest.fn().mockResolvedValue({ ok: true }),
      permissions: ['attendance.view', 'profile.view'],
      projects: [
        { id: 101, name: 'Blue Residency' },
        { id: 102, name: 'Blue Heights' },
      ],
      roles: ['staff'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the not-checked-in state, limits recent history to five rows, and removes unsupported content', async () => {
    await renderWithTheme(<AttendanceScreen />);
    await flushServiceDelay();

    expect(screen.getByText('Ready to start')).toBeTruthy();
    expect(screen.getByTestId('attendance-check-in-button')).toBeTruthy();
    expect(screen.getAllByText(/Completed/)).toHaveLength(5);
    expect(screen.queryByText('Weekly overview')).toBeNull();
    expect(screen.queryByText('Attendance record')).toBeNull();
    expect(screen.queryByText('Entry 1')).toBeNull();
    expect(screen.queryByText('Present')).toBeNull();
    expect(screen.queryByText('Late')).toBeNull();
    expect(screen.queryByText('Absent')).toBeNull();
    expect(screen.queryByText('Leave')).toBeNull();
    expect(screen.queryByText('Location')).toBeNull();
    expect(screen.queryByText('Remarks')).toBeNull();
    expect(screen.queryByText('Labour Attendance')).toBeNull();
  });

  it('shows the selected project in the check-in confirmation and opens the history route from View all', async () => {
    await renderWithTheme(<AttendanceScreen />);
    await flushServiceDelay();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Check in'));
    });

    await waitFor(() => {
      expect(screen.getByText('Start attendance?')).toBeTruthy();
      expect(screen.getAllByText('Blue Residency').length).toBeGreaterThan(1);
    });

    fireEvent.press(screen.getByTestId('attendance-view-all'));

    expect(mockPush).toHaveBeenCalledWith('/(app)/attendance-history');
  });

  it('shows the checked-in state with a derived elapsed duration and a check-out action', async () => {
    const checkInPromise = checkIn({ projectId: 101 });

    await flushServiceDelay();
    await checkInPromise;

    jest.setSystemTime(new Date('2026-07-29T12:38:00'));

    await renderWithTheme(<AttendanceScreen />);
    await flushServiceDelay();

    expect(screen.getByText('You’re checked in')).toBeTruthy();
    expect(screen.getByText('03h 42m')).toBeTruthy();
    expect(screen.getByTestId('attendance-check-out-button')).toBeTruthy();
  });

  it('shows the completed state with no attendance action after check-out', async () => {
    const checkInPromise = checkIn({ projectId: 101 });

    await flushServiceDelay();
    await checkInPromise;

    jest.setSystemTime(new Date('2026-07-29T18:04:00'));

    const checkOutPromise = checkOut();

    await flushServiceDelay();
    await checkOutPromise;

    await renderWithTheme(<AttendanceScreen />);
    await flushServiceDelay();

    expect(screen.getByText('Attendance complete')).toBeTruthy();
    expect(screen.queryByTestId('attendance-check-in-button')).toBeNull();
    expect(screen.queryByTestId('attendance-check-out-button')).toBeNull();
  });

  it('updates the UI immediately after a real check-in submission', async () => {
    await renderWithTheme(<AttendanceScreen />);
    await flushServiceDelay();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Check in'));
    });

    await waitFor(() => {
      expect(screen.getByText('Start attendance?')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Confirm check in'));
    });

    await flushServiceDelay();

    await waitFor(() => {
      expect(screen.getByText('Checked in successfully.')).toBeTruthy();
      expect(screen.getByText('You’re checked in')).toBeTruthy();
    });
  });
});
