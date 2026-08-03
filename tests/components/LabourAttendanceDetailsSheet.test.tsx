import { act, fireEvent } from '@testing-library/react-native';

import { LabourAttendanceDetailsSheet } from '@/features/attendance/labour/components/LabourAttendanceDetailsSheet';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('LabourAttendanceDetailsSheet', () => {
  it('rejects invalid numeric text', async () => {
    const onApply = jest.fn();
    const screen = await renderWithTheme(
      <LabourAttendanceDetailsSheet
        initialDraft={{
          hours: 8,
          overtimeHours: 0,
          rate: 2500,
          rating: null,
          remarks: '',
        }}
        labour={{
          dailyWage: '2500',
          fatherName: 'Rashid',
          id: 1,
          maskedPhone: '03******42',
          name: 'Muhammad Ali',
          role: 'Mason',
          todayAttendance: null,
        }}
        onApply={onApply}
        onClose={jest.fn()}
        onReset={jest.fn()}
        status="present"
        visible
      />,
    );

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('Custom hours'), 'abc');
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Apply labour attendance details'));
    });

    expect(onApply).not.toHaveBeenCalled();
    expect(
      screen.getByText('Working details are outside the allowed range.'),
    ).toBeTruthy();
  });
});
