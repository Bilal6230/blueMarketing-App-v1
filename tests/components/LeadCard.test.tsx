import { fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { LeadCard } from '@/features/crm/components/LeadCard';
import type { LeadListRecord } from '@/features/crm/services/crmService';
import { renderWithTheme } from '../utils/renderWithTheme';

const lead: LeadListRecord = {
  assignedUser: { id: 1, name: 'Sana Ahmed' },
  createdAt: '2026-07-25 09:15:00',
  firstName: 'Bilal',
  followUp: '2026-07-29 15:30:00',
  id: 1011,
  lastName: 'Ahmed',
  mobileNumber: '03121112242',
  phoneNumber: '03001112242',
  project: { id: 101, name: 'Blue Residency' },
  recordState: 'active',
};

describe('LeadCard', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('opens detail when the card is pressed', async () => {
    const onPress = jest.fn();
    const screen = await renderWithTheme(
      <LeadCard lead={lead} onPress={onPress} onPressCallError={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId('lead-card-1011'));
    expect(onPress).toHaveBeenCalled();
  });

  it('opens tel without triggering detail navigation', async () => {
    const onPress = jest.fn();
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const screen = await renderWithTheme(
      <LeadCard lead={lead} onPress={onPress} onPressCallError={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId('lead-card-call-1011'));

    await waitFor(() => {
      expect(canOpenSpy).toHaveBeenCalledWith('tel:03001112242');
      expect(openSpy).toHaveBeenCalledWith('tel:03001112242');
    });
    expect(onPress).not.toHaveBeenCalled();
  });
});
