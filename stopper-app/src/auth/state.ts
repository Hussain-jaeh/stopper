export interface AuthState {
  email: string;
  password: string;
  otp: string;
  displayName?: string;
}

export function freshAuthState(): AuthState {
  return { email: '', password: '', otp: '' };
}

export const isValidEmail = (e: string): boolean => /\S+@\S+\.\S+/.test(e.trim());
export const isValidPassword = (p: string): boolean => (p || '').length >= 8;
