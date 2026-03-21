export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export function verifyAdmin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function setAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chakra_auth', 'true');
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chakra_auth');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chakra_auth') === 'true';
  }
  return false;
}
