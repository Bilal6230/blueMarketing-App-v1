import { PremiumLoginScreen } from '@/features/auth';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockUseForm = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('react-hook-form', () => ({
  Controller: ({ render }: { render: (props: any) => React.ReactNode }) =>
    render({
      field: {
        onBlur: jest.fn(),
        onChange: jest.fn(),
        value: '',
      },
    }),
  useForm: () => mockUseForm(),
}));

describe('PremiumLoginScreen', () => {
  beforeEach(() => {
    mockUseForm.mockReturnValue({
      control: {},
      formState: {
        errors: {},
        isSubmitting: false,
      },
      handleSubmit: () => jest.fn(),
      setError: jest.fn(),
    });
  });

  it('renders the production login copy', async () => {
    const { getByText } = await renderWithTheme(<PremiumLoginScreen />);

    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('disables repeated submission while loading', async () => {
    mockUseForm.mockReturnValue({
      control: {},
      formState: {
        errors: {},
        isSubmitting: true,
      },
      handleSubmit: () => jest.fn(),
      setError: jest.fn(),
    });

    const { getByTestId } = await renderWithTheme(<PremiumLoginScreen />);

    expect(
      getByTestId('login-sign-in-button').props.accessibilityState,
    ).toEqual({
      busy: true,
      disabled: true,
    });
  });
});
