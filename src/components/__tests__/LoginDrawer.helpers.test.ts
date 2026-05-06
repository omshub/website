const verifyOtp = jest.fn();

jest.mock('@mantine/core', () => ({
  Box: () => null,
  Button: () => null,
  Divider: () => null,
  Drawer: () => null,
  Group: () => null,
  Loader: () => null,
  PinInput: () => null,
  Stack: () => null,
  Text: () => null,
  TextInput: () => null,
  ThemeIcon: () => null,
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/utils/notifications', () => ({ notifyError: jest.fn() }));
jest.mock('@/lib/supabase/client', () => ({
  getClient: () => ({ auth: { verifyOtp } }),
}));

import {
  isCompleteOtpCode,
  loginProviders,
  validateLoginEmail,
  verifyEmailOtp,
} from '@/components/LoginDrawer';

describe('LoginDrawer helpers', () => {
  beforeEach(() => {
    verifyOtp.mockResolvedValue({ error: null });
  });

  it('validates email addresses and otp code shape', () => {
    expect(validateLoginEmail('student@gatech.edu')).toBe(true);
    expect(validateLoginEmail('bad')).toBe(false);
    expect(validateLoginEmail('bad@example')).toBe(false);
    expect(validateLoginEmail('bad example@gatech.edu')).toBe(false);

    expect(isCompleteOtpCode('12345678')).toBe(true);
    expect(isCompleteOtpCode('')).toBe(false);
    expect(isCompleteOtpCode('1234')).toBe(false);
  });

  it('exposes configured providers and delegates otp verification to Supabase', async () => {
    expect(loginProviders.map((provider) => provider.name)).toEqual(['google', 'github']);
    expect(loginProviders[0]).toMatchObject({
      displayName: 'Google',
      color: '#4285F4',
      bg: '#ffffff',
      textColor: '#1f1f1f',
    });
    expect(loginProviders[1]).toMatchObject({
      displayName: 'GitHub',
      color: '#ffffff',
      bg: '#24292e',
      textColor: '#ffffff',
    });

    await expect(verifyEmailOtp('student@gatech.edu', '12345678')).resolves.toEqual({ error: null });
    expect(verifyOtp).toHaveBeenCalledWith({
      email: 'student@gatech.edu',
      token: '12345678',
      type: 'email',
    });
  });
});
