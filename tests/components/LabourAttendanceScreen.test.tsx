import { act, fireEvent, waitFor } from '@testing-library/react-native';
import AttendanceRoute from '../../app/(app)/attendance';
import { LabourAttendanceScreen } from '@/features/attendance/labour/screens/LabourAttendanceScreen';
import { __resetLabourAttendanceServiceData } from '@/features/attendance/labour/services/labourAttendanceService';
import { useLabourAttendanceStore } from '@/features/attendance/labour/store/labourAttendanceStore';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

async function flushDelay() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(420);
  });
}

describe('LabourAttendanceScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    __resetLabourAttendanceServiceData();
    useLabourAttendanceStore.getState().resetLabourAttendanceState();
    useAuthStore.setState({
      accessToken: 'token',
      clearSession: jest.fn().mockResolvedValue({ ok: true }),
      permissions: ['attendance.manage', 'dashboard.view', 'profile.view'],
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

  it('renders labour attendance from the active attendance route and keeps staff attendance inaccessible', async () => {
    const screen = await renderWithTheme(<AttendanceRoute />);

    await flushDelay();

    expect(screen.getByTestId('labour-attendance-screen')).toBeTruthy();
    expect(screen.getByText('Labour Attendance')).toBeTruthy();
    expect(screen.queryByText('Check in')).toBeNull();
    expect(screen.queryByText('Check out')).toBeNull();
    expect(screen.queryByText('View all')).toBeNull();
    expect(screen.queryByText('Labour Reports')).toBeNull();
    expect(screen.queryByText('Payment Summary')).toBeNull();
  });

  it('requires site selection before marking and defaults to the active labour filter', async () => {
    const screen = await renderWithTheme(<LabourAttendanceScreen />);

    await flushDelay();

    expect(screen.getByText('Select a site to mark attendance.')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getAllByLabelText('Present')[0]?.props.accessibilityState).toEqual({
      disabled: true,
      selected: false,
    });
  });

  it('allows update-capable users to edit saved attendance after selecting a site', async () => {
    const screen = await renderWithTheme(<LabourAttendanceScreen />);

    await flushDelay();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Select site'));
    });

    await waitFor(() => {
      expect(screen.getByText('Block B Construction')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Block B Construction'));
    });

    await flushDelay();

    expect(screen.getAllByText('Saved').length).toBeGreaterThan(0);
    fireEvent.press(screen.getAllByLabelText('Edit labour attendance details')[0] as never);

    await waitFor(() => {
      expect(screen.getByText('Estimated amount')).toBeTruthy();
    });
  });

});
