import { Alert } from 'react-native';

import {
  buildEditLeadInput,
  confirmDiscard,
  getInitialEditLeadFormValues,
} from '@/features/crm/screens/EditLeadScreen';

const lead = {
  assignedUser: null,
  createdAt: '2026-08-10 09:00:00',
  firstName: 'Adeel',
  followUp: '2026-08-11 10:00:00',
  id: 51,
  lastName: 'Shah',
  latestRemarks: 'Existing server remark',
  mobileNumber: null,
  nicNumberMasked: '*********1111',
  phoneNumber: '03005556677',
  project: { id: 101, name: 'Blue Residency' },
  recordState: 'active' as const,
  updatedAt: '2026-08-10 10:00:00',
};

describe('EditLeadScreen helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with blank remarks and NIC so existing values are not automatically resubmitted', () => {
    expect(getInitialEditLeadFormValues(lead)).toMatchObject({
      firstName: 'Adeel',
      followUpDate: '2026-08-11',
      followUpTime: '10:00',
      nicNumber: '',
      phoneNumber: '03005556677',
      remarks: '',
    });
  });

  it('omits nic_number and remarks when editing another field only', () => {
    const initialValues = getInitialEditLeadFormValues(lead);

    expect(
      buildEditLeadInput({
        ...initialValues,
        firstName: 'Adeel Updated',
      }),
    ).toEqual({
      firstName: 'Adeel Updated',
      followUp: '2026-08-11 10:00:00',
      lastName: 'Shah',
      mobileNumber: null,
      nicNumber: undefined,
      phoneNumber: '03005556677',
      remarks: undefined,
    });
  });

  it('sends nic_number and remarks only when the user explicitly enters new values', () => {
    const initialValues = getInitialEditLeadFormValues(lead);

    expect(
      buildEditLeadInput({
        ...initialValues,
        nicNumber: '3520211111111',
        remarks: 'Call after lunch',
      }),
    ).toEqual({
      firstName: 'Adeel',
      followUp: '2026-08-11 10:00:00',
      lastName: 'Shah',
      mobileNumber: null,
      nicNumber: '3520211111111',
      phoneNumber: '03005556677',
      remarks: 'Call after lunch',
    });
  });

  it('goes back immediately when the form is clean', () => {
    const onConfirm = jest.fn();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    confirmDiscard(false, onConfirm);

    expect(onConfirm).toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('requires confirmation before going back when the form is dirty', () => {
    const onConfirm = jest.fn();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    confirmDiscard(true, onConfirm);

    expect(Alert.alert).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
