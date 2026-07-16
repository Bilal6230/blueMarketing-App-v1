import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { AttendancePrototypeScreen } from '@/features/attendance/screens/AttendancePrototypeScreen';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('AttendancePrototypeScreen', () => {
  it('supports the checked-in to checked-out transition without double check-in', async () => {
    const { getByTestId, getByText } = await renderWithTheme(<AttendancePrototypeScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('attendance-primary-action'));
    });
    await waitFor(() => {
      expect(
        getByText(
          'Attendance preview updated locally only. No backend attendance entry was created.',
        ),
      ).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('attendance-primary-action'));
    });
    await waitFor(() => {
      expect(getByText('Shift completed')).toBeTruthy();
    });
  });
});
