import { act, fireEvent, waitFor } from '@testing-library/react-native';
import AttendanceRoute from '../../app/(app)/attendance';
import * as labourService from '@/features/attendance/labour/services/labourAttendanceService';
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
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
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

  it('keeps existing saved attendance read-only after selecting a site', async () => {
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
    expect(
      screen.getAllByLabelText('Edit labour attendance details')[0]?.props
        .accessibilityState,
    ).toEqual({
      disabled: true,
    });
    fireEvent.press(screen.getAllByLabelText('Edit labour attendance details')[0] as never);
    expect(screen.queryByText('Rating')).toBeNull();
  });

  it('shows save-bar copy as changes to save', async () => {
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

    const enabledPresentButton = screen
      .getAllByLabelText('Present')
      .find((button) => button.props.accessibilityState?.disabled === false);

    await act(async () => {
      fireEvent.press(enabledPresentButton as never);
    });

    expect(screen.getByText('1 changes to save')).toBeTruthy();
  });

  it('loads the initial labour list exactly once', async () => {
    const loadSpy = jest.spyOn(labourService, 'getLabours');

    await renderWithTheme(<LabourAttendanceScreen />);

    await flushDelay();

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(loadSpy).toHaveBeenCalledWith({
      page: 1,
      perPage: 100,
      projectId: 101,
      recordState: 'active',
      search: '',
      siteId: undefined,
    });
  });

});
