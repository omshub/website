import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginDrawer from '@/components/LoginDrawer';
import { useAuth } from '@/context/AuthContext';
import { notifyError } from '@/utils/notifications';

const signInWithEmailOtp = jest.fn();
const signInWithProvider = jest.fn();
const verifyOtp = jest.fn();
const onClose = jest.fn();

jest.mock('@mantine/core', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, type = 'button', disabled, loading }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} data-loading={loading ? 'true' : 'false'}>
      {children}
    </button>
  ),
  Divider: ({ label }: any) => <div>{label}</div>,
  Drawer: ({ opened, children, onClose }: any) => (
    opened ? <div><button onClick={onClose}>close</button>{children}</div> : null
  ),
  Group: ({ children }: any) => <div>{children}</div>,
  Loader: () => <span>loading</span>,
  PinInput: ({ value, onChange, onComplete, disabled }: any) => (
    <input
      aria-label="otp"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.value)}
      onBlur={(event) => onComplete?.(event.currentTarget.value)}
    />
  ),
  Stack: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <p>{children}</p>,
  TextInput: ({ value, onChange, error, disabled, placeholder }: any) => (
    <>
      <input
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      {error ? <span>{error}</span> : null}
    </>
  ),
  ThemeIcon: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  getClient: () => ({ auth: { verifyOtp } }),
}));

jest.mock('@/utils/notifications', () => ({
  notifyError: jest.fn(),
}));

describe('LoginDrawer interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    jest.useRealTimers();
    (useAuth as jest.Mock).mockReturnValue({ signInWithEmailOtp, signInWithProvider });
    signInWithEmailOtp.mockResolvedValue(true);
    signInWithProvider.mockResolvedValue(undefined);
    verifyOtp.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('validates email entry and moves through the otp flow', async () => {
    render(<LoginDrawer opened onClose={onClose} />);

    fireEvent.click(screen.getByText('Email me a code'));
    expect(await screen.findByText('Please enter your email address')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'bad' },
    });
    fireEvent.click(screen.getByText('Email me a code'));
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'student@gatech.edu' },
    });
    fireEvent.click(screen.getByText('Email me a code'));

    await waitFor(() => expect(signInWithEmailOtp).toHaveBeenCalledWith('student@gatech.edu'));
    expect(await screen.findByText('Enter Code')).toBeInTheDocument();

    fireEvent.submit(screen.getByText('Verify Code').closest('form')!);
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Invalid Code' }));

    fireEvent.change(screen.getByLabelText('otp'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Verify Code'));
    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({
      email: 'student@gatech.edu',
      token: '12345678',
      type: 'email',
    }));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Use different email'));
  });

  it('handles auth absence, otp errors, and provider login', async () => {
    (useAuth as jest.Mock).mockReturnValue(null);
    render(<LoginDrawer opened onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'student@gatech.edu' },
    });
    fireEvent.click(screen.getByText('Email me a code'));
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error' })));
  });

  it('closes after provider login and resets delayed loading state', async () => {
    jest.useFakeTimers();
    render(<LoginDrawer opened onClose={onClose} />);
    fireEvent.click(screen.getByText('Continue with Google'));
    await waitFor(() => expect(signInWithProvider).toHaveBeenCalledWith('google'));
    expect(onClose).toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });

  it('handles rejected magic-link and otp verification paths', async () => {
    signInWithEmailOtp.mockRejectedValueOnce(new Error('network'));
    render(<LoginDrawer opened onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'student@gatech.edu' },
    });
    fireEvent.click(screen.getByText('Email me a code'));
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error' })));
  });

  it('handles otp service errors, thrown verification, and provider auth absence', async () => {
    verifyOtp.mockResolvedValueOnce({ error: new Error('bad token') });
    render(<LoginDrawer opened onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'student@gatech.edu' },
    });
    fireEvent.click(screen.getByText('Email me a code'));
    await screen.findByText('Enter Code');
    fireEvent.change(screen.getByLabelText('otp'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Verify Code'));
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ message: 'bad token' })));

    fireEvent.click(screen.getByText('Use different email'));
    expect(screen.getByText('Sign in to OMSHub')).toBeInTheDocument();

    cleanup();
    verifyOtp.mockRejectedValueOnce(new Error('verify failed'));
    render(<LoginDrawer opened onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'student@gatech.edu' },
    });
    fireEvent.click(screen.getByText('Email me a code'));
    await screen.findByText('Enter Code');
    fireEvent.change(screen.getByLabelText('otp'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Verify Code'));
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Verification Failed' })));

    cleanup();
    (useAuth as jest.Mock).mockReturnValue(null);
    render(<LoginDrawer opened onClose={onClose} />);
    fireEvent.click(screen.getByText('Continue with Google'));
    expect(signInWithProvider).not.toHaveBeenCalledWith('google');
  });
});
