export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chakra_auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chakra_auth_token');
  }
  return null;
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chakra_auth_token');
    localStorage.removeItem('chakra_role');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('chakra_auth_token');
  }
  return false;
}

export function getUserRole(): 'admin' | 'staff' | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chakra_role') as 'admin' | 'staff' | null;
  }
  return null;
}

export function isStaff(): boolean {
  return getUserRole() === 'staff';
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}
